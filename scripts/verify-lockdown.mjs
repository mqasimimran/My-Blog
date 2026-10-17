#!/usr/bin/env node
// Attacks your own database the way an outsider would, using ONLY the
// public anon key (the one anyone can copy out of your site's JavaScript).
// Works on Windows, macOS and Linux — needs only Node 18+.
//
//   Windows PowerShell:
//     $env:SUPABASE_URL="https://xxxx.supabase.co"; $env:SUPABASE_ANON_KEY="eyJ..."; node scripts/verify-lockdown.mjs
//   macOS / Linux:
//     SUPABASE_URL=https://xxxx.supabase.co SUPABASE_ANON_KEY=eyJ... node scripts/verify-lockdown.mjs

const URL_ = (process.env.SUPABASE_URL || '').trim().replace(/\/+$/, '')
const KEY = (process.env.SUPABASE_ANON_KEY || '').trim()
if (!URL_ || !KEY) {
  console.error('Set SUPABASE_URL and SUPABASE_ANON_KEY first (see the comment at the top of this file).')
  process.exit(2)
}

// ---------- 0. Sanity checks BEFORE attacking anything ----------
let host
try { host = new URL(URL_).host } catch { console.error(`SUPABASE_URL is not a valid URL: ${URL_}`); process.exit(2) }

function keyRole(key) {
  if (key.startsWith('sb_secret_')) return 'service_role'
  if (key.startsWith('sb_publishable_')) return 'anon'
  try {
    const payload = JSON.parse(Buffer.from(key.split('.')[1], 'base64url').toString('utf8'))
    return payload.role || 'unknown'
  } catch { return 'unknown' }
}
const role = keyRole(KEY)
console.log(`Target:   ${host}`)
console.log(`Key type: ${role}\n`)

if (role === 'service_role') {
  console.error([
    'STOP — that is the SECRET service_role key, not the public anon key.',
    'The service_role key bypasses ALL database security by design, so every',
    'check below would "fail" no matter how well you are locked down. It is also',
    'a key that must never be pasted into scripts, chats, or screenshots.',
    '',
    'In Supabase: Project Settings -> API -> use the key labelled "anon" / "public"',
    '(or "Publishable key" on newer projects). Never the one labelled service_role / secret.',
  ].join('\n'))
  process.exit(2)
}
if (role !== 'anon') {
  console.warn(`Warning: could not confirm this is an anon key (role: ${role}). Continuing, but double-check it.\n`)
}

const baseHeaders = { apikey: KEY, Authorization: `Bearer ${KEY}`, 'Content-Type': 'application/json' }
// Ask the API to return the rows it affected. Without this a SUCCESSFUL
// write returns an empty body, which is indistinguishable from a blocked one.
const WRITE = { ...baseHeaders, Prefer: 'return=representation' }
const R = `${URL_}/rest/v1`

async function call(method, url, headers, body) {
  try {
    const res = await fetch(url, { method, headers, body })
    const text = await res.text()
    return { status: res.status, text, type: res.headers.get('content-type') || '' }
  } catch (e) {
    return { status: 0, text: String(e), type: '' }
  }
}
const snippet = (t) => t.replace(/\s+/g, ' ').trim().slice(0, 110)

// A table that cannot exist must come back as a 404-style JSON error from
// a real Supabase/PostgREST API. If something answers 2xx (or sends back a
// web page), SUPABASE_URL is not pointing at your Supabase API at all and
// every result below would be meaningless.
{
  const c = await call('GET', `${R}/__verify_no_such_table__?select=*`, baseHeaders)
  const looksLikeApi = c.status >= 400 && c.status < 500 && /json/i.test(c.type)
  if (c.status === 0) {
    console.error(`Could not reach ${host}: ${c.text}\nCheck SUPABASE_URL and your internet connection.`)
    process.exit(2)
  }
  if (!looksLikeApi) {
    console.error([
      `STOP — ${host} does not behave like a Supabase API.`,
      `I asked it for a table that cannot exist and it answered HTTP ${c.status} (${c.type || 'no content-type'}):`,
      `    ${snippet(c.text)}`,
      '',
      'A real Supabase project answers that with a 404 JSON error. So SUPABASE_URL is',
      'probably wrong (your own website? localhost? the dashboard page?).',
      'It must look like  https://<project-ref>.supabase.co  — find it in',
      'Supabase -> Project Settings -> API -> Project URL.',
    ].join('\n'))
    process.exit(2)
  }
}

let pass = 0, fail = 0

// Blocked = request refused (non-2xx), OR accepted but touched/returned no rows.
async function blocked(name, method, url, headers, body) {
  const { status, text } = await call(method, url, headers, body)
  const ok2xx = status >= 200 && status < 300
  const leaked = ok2xx && text.trim() !== '' && text.trim() !== '[]'
  if (leaked) { console.log(`FAIL  OPEN (HTTP ${status}): ${name}\n        got back: ${snippet(text)}`); fail++ }
  else if (status === 0) { console.log(`FAIL  could not reach server: ${name} — ${text}`); fail++ }
  else { console.log(`PASS  blocked (HTTP ${status}): ${name}`); pass++ }
}

async function works(name, url) {
  const { status, text } = await call('GET', url, baseHeaders)
  if (status >= 200 && status < 300) { console.log(`PASS  works:   ${name}`); pass++ }
  else { console.log(`FAIL  public site would break (HTTP ${status}): ${name}\n        got back: ${snippet(text)}`); fail++ }
}

console.log('== WRITES (all must be blocked) ==')
await blocked('insert article', 'POST', `${R}/articles`, WRITE, JSON.stringify({ title: 'hacked', slug: 'hacked', category: 'x', content: 'x' }))
await blocked('update every article', 'PATCH', `${R}/articles?id=not.is.null`, WRITE, JSON.stringify({ title: 'hacked' }))
await blocked('delete every article', 'DELETE', `${R}/articles?id=not.is.null`, WRITE)
await blocked('insert fake order', 'POST', `${R}/orders`, WRITE, JSON.stringify({ status: 'paid' }))
await blocked('mark orders paid', 'PATCH', `${R}/orders?id=not.is.null`, WRITE, JSON.stringify({ status: 'paid' }))
await blocked('insert subscriber', 'POST', `${R}/newsletter_subscribers`, WRITE, JSON.stringify({ email: 'x@x.com' }))
await blocked('change site settings', 'PATCH', `${R}/site_settings?id=not.is.null`, WRITE, JSON.stringify({ jazzcash_number: '0000' }))
await blocked('insert client logo', 'POST', `${R}/client_logos`, WRITE, JSON.stringify({ name: 'x', image_url: 'x' }))
await blocked('forge a used 2FA code', 'POST', `${R}/admin_totp_used`, WRITE, JSON.stringify({ step: 1 }))
await blocked('write audit log', 'POST', `${R}/security_audit_log`, WRITE, JSON.stringify({ event: 'x' }))

console.log('\n== PRIVATE DATA (reads must be blocked or empty) ==')
for (const [name, path] of [
  ['read messages', 'messages?select=*'],
  ['read orders', 'orders?select=*'],
  ['read subscriber emails', 'newsletter_subscribers?select=*'],
  ['read login attempts', 'login_attempts?select=*'],
  ['read rate-limit log', 'rate_limit_log?select=*'],
  ['read activity log', 'activity_log?select=*'],
  ['read security audit log', 'security_audit_log?select=*'],
  ['read used 2FA codes', 'admin_totp_used?select=*'],
  ['read paid file URLs', 'products?select=digital_file_url'],
]) await blocked(name, 'GET', `${R}/${path}`, baseHeaders)

console.log('\n== PUBLIC SITE (must still work) ==')
await works('read published articles', `${R}/articles?select=title,slug&published=eq.true&limit=1`)
await works('read projects', `${R}/projects?select=title&limit=1`)
await works('read shop catalog', `${R}/products?select=id,name,price&limit=1`)
await works('read site settings', `${R}/site_settings?select=available_for_work&limit=1`)

console.log('\n== STORAGE (anonymous upload must be blocked) ==')
for (const bucket of ['blog-images', 'resume-images'])
  await blocked(`anon upload to ${bucket}`, 'POST', `${URL_}/storage/v1/object/${bucket}/lockdown-test.png`, { ...baseHeaders, 'Content-Type': 'image/png' }, 'x')

console.log(`\nRESULT: ${pass} passed, ${fail} failed`)
if (fail === 0) console.log('Lockdown verified.')
else { console.log('Something is still open (or the public site is broken) — do not consider this done.'); process.exit(1) }
