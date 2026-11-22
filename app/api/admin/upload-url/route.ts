import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabaseAdmin'
import { requireAdminSession } from '@/lib/requireAdminSession'
import { logSecurityEvent, requestMeta } from '@/lib/audit'
import { createR2Upload, storageStatus } from '@/lib/r2'

// Mints a short-lived signed upload URL so the admin panel can upload to
// Storage without the buckets needing to accept anonymous writes. The
// browser still sends file bytes straight to Supabase or R2 (nothing large
// passes through this server) — this route only decides whether an upload
// is allowed to start, which is where login, bucket, file type, and size
// are all enforced.

const ALLOWED_BUCKETS = new Set(['blog-images', 'resume-images'])

// Extension allowlist (not a blocklist): anything not listed here is
// refused. Deliberately excludes html/js/exe/php/etc., which could execute
// or be abused if served from your storage domain.
const ALLOWED_EXTENSIONS: Record<string, number> = {
  // images — 10 MB
  jpg: 10, jpeg: 10, png: 10, webp: 10, gif: 10, avif: 10, svg: 10,
  // video previews — 100 MB
  mp4: 100, webm: 100, mov: 100,
  // downloadable products — 250 MB
  pdf: 250, zip: 250, psd: 250, ai: 250, fig: 250, sketch: 250, ttf: 250, otf: 250,
}

const SAFE_PATH = /^[A-Za-z0-9][A-Za-z0-9._\-\/]*$/

export async function POST(request: NextRequest) {
  const unauthorized = await requireAdminSession()
  if (unauthorized) return unauthorized

  let body: Record<string, unknown>
  try { body = await request.json() } catch { return NextResponse.json({ error: 'Invalid request' }, { status: 400 }) }

  const { bucket, path, size, contentType } = body || {}
  const meta = requestMeta(request.headers)
  const refuse = async (message: string, status: number) => {
    await logSecurityEvent({ event: 'upload_refused', ...meta, detail: { bucket, path: typeof path === 'string' ? path.slice(0, 120) : null, size, reason: message } })
    return NextResponse.json({ error: message }, { status })
  }

  if (typeof bucket !== 'string' || !ALLOWED_BUCKETS.has(bucket)) {
    return refuse('Bucket not allowed', 403)
  }
  if (typeof path !== 'string' || path.length > 200 || !SAFE_PATH.test(path) || path.includes('..')) {
    return refuse('Invalid file name', 400)
  }

  const ext = path.split('.').pop()?.toLowerCase() || ''
  const maxMb = ALLOWED_EXTENSIONS[ext]
  if (!maxMb) {
    return refuse(`".${ext}" files aren't allowed.`, 400)
  }
  if (typeof size !== 'number' || !Number.isSafeInteger(size) || size <= 0) {
    return refuse('A valid file size is required.', 400)
  }
  if (size > maxMb * 1024 * 1024) {
    return refuse(`.${ext} files can be at most ${maxMb} MB.`, 400)
  }

  const provider = storageStatus().provider
  if (provider === 'r2') {
    const safeTypes = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/avif', 'image/svg+xml', 'video/mp4', 'video/webm', 'video/quicktime', 'application/pdf'])
    const type = typeof contentType === 'string' && safeTypes.has(contentType) ? contentType : 'application/octet-stream'
    try {
      const upload = await createR2Upload(bucket, path, size, type)
      await logSecurityEvent({ event: 'upload_issued', ...meta, detail: { bucket, path: upload.path, size, provider } })
      return NextResponse.json(upload)
    } catch {
      return NextResponse.json({ error: 'Could not prepare R2 upload. Check Admin > Storage and your server environment settings.' }, { status: 503 })
    }
  }
  if (provider !== 'supabase') return NextResponse.json({ error: 'Invalid upload storage provider.' }, { status: 503 })
  const { data, error } = await supabaseAdmin.storage.from(bucket).createSignedUploadUrl(path)
  if (error || !data) {
    return NextResponse.json({ error: error?.message || 'Could not start upload' }, { status: 500 })
  }
  await logSecurityEvent({ event: 'upload_issued', ...meta, detail: { bucket, path: data.path, size } })
  return NextResponse.json({ path: data.path, token: data.token })
}
