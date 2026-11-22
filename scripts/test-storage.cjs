// Offline integration checks; no real credentials, database writes or uploads.
const assert = require('node:assert/strict')
const fs = require('node:fs')
const vm = require('node:vm')
const ts = require('typescript')

function load(file, mocks = {}, globals = {}) {
  const code = ts.transpileModule(fs.readFileSync(file, 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, esModuleInterop: true },
  }).outputText
  const exports = {}
  vm.runInNewContext(code, { exports, require: name => name in mocks ? mocks[name] : require(name),
    URL, Set, Map, console, ...globals }, { filename: file })
  return exports
}

async function main() {
  const env = {}
  const r2 = load('lib/r2.ts', { 'server-only': {} }, { process: { env } })
  assert.equal(r2.storageStatus().provider, 'supabase')
  await assert.rejects(r2.createR2Upload('blog-images', 'photo.png', 10, 'image/png'), /incomplete/)
  Object.assign(env, { R2_ACCOUNT_ID: 'a'.repeat(32), R2_ACCESS_KEY_ID: 'test-key', R2_SECRET_ACCESS_KEY: 'test-secret', R2_BUCKET_NAME: 'test-bucket', R2_PUBLIC_URL: 'https://media.example.com', UPLOAD_STORAGE_PROVIDER: 'r2' })
  const result = await r2.createR2Upload('blog-images', 'photo.png', 10, 'image/png')
  const url = new URL(result.uploadUrl)
  assert.equal(url.searchParams.get('X-Amz-Expires'), '300')
  assert.match(url.searchParams.get('X-Amz-SignedHeaders'), /content-length/)
  assert.match(url.searchParams.get('X-Amz-SignedHeaders'), /content-type/)
  assert.match(result.publicUrl, /^https:\/\/media\.example\.com\/blog-images\/[\w-]+\/photo.png$/)
  assert.notEqual((await r2.createR2Upload('blog-images', 'photo.png', 10, 'image/png')).path, result.path)

  let mode = 'r2', failed = false, signedUploads = 0
  const storage = load('lib/adminStorage.ts', {
    '@/lib/asError': { asError: e => e },
    '@/lib/imageOptimize': { optimizeImage: async f => f },
    '@/lib/supabase': { supabase: { storage: { from: () => ({
      uploadToSignedUrl: async () => { signedUploads++; return { data: { path: 'old.png' }, error: null } },
      getPublicUrl: path => ({ data: { publicUrl: `https://old.supabase.co/${path}` } }),
    }) } } },
  }, { fetch: async (url, options) => {
    if (url === '/api/admin/upload-url') return { ok: true, json: async () => mode === 'r2' ? result : { path: 'old.png', token: 'test' } }
    assert.equal(options.method, 'PUT')
    assert.equal(options.headers['Content-Type'], 'image/png')
    return { ok: !failed }
  } }).adminStorage.from('blog-images')
  assert.equal((await storage.upload('photo.png', { size: 10, type: 'image/png' })).error, null)
  assert.equal(storage.getPublicUrl('photo.png').data.publicUrl, result.publicUrl)
  assert.equal(signedUploads, 0)
  failed = true
  assert.ok((await storage.upload('failed.png', { size: 10, type: 'image/png' })).error)
  assert.match(storage.getPublicUrl('failed.png').data.publicUrl, /supabase/)
  mode = 'supabase'
  await storage.upload('old.png', { size: 10, type: 'image/png' })
  assert.equal(signedUploads, 1)

  const links = load('lib/clientSocialLinks.ts')
  assert.equal(links.isDriveLink('https://drive.google.com/drive/folders/example'), true)
  assert.equal(links.isDriveLink('https://drive.google.com.evil.example/file'), false)
  assert.equal(links.socialProfile('javascript:alert(1)'), null)
  assert.equal(links.socialProfile('https://drive.google.com/file/d/example/view').label, 'View full-resolution files on Google Drive')
  let denied = true, issued = 0
  const route = load('app/api/admin/upload-url/route.ts', {
    '@/lib/supabaseAdmin': { supabaseAdmin: {} },
    '@/lib/requireAdminSession': { requireAdminSession: async () => denied ? new Response(null, { status: 401 }) : null },
    '@/lib/audit': { requestMeta: () => ({}), logSecurityEvent: async () => {} },
    '@/lib/r2': { storageStatus: () => ({ provider: 'r2' }), createR2Upload: async () => { issued++; return result } },
  })
  const request = body => new Request('https://example.com/api/admin/upload-url', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
  assert.equal((await route.POST(request({}))).status, 401)
  denied = false
  for (const body of [
    { bucket: 'private', path: 'a.png', size: 10 },
    { bucket: 'blog-images', path: '../a.png', size: 10 },
    { bucket: 'blog-images', path: 'a.exe', size: 10 },
    { bucket: 'blog-images', path: 'a.png' },
    { bucket: 'blog-images', path: 'a.png', size: -1 },
    { bucket: 'blog-images', path: 'a.png', size: 11 * 1024 * 1024 },
  ]) assert.ok((await route.POST(request(body))).status >= 400)
  assert.equal(issued, 0)
  assert.equal((await route.POST(request({ bucket: 'blog-images', path: 'a.png', size: 10, contentType: 'image/png' }))).status, 200)
  assert.equal(issued, 1)
  console.log('PASS: Upload authentication, bucket/path/type/size validation and authorized R2 dispatch.')
  console.log('PASS: R2 signing, expiry, unique keys, upload routing, failed uploads, Supabase fallback and Drive links.')
}
main().catch(error => { console.error(error); process.exitCode = 1 })
