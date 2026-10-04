import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabaseAdmin'
import { requireAdminSession } from '@/lib/requireAdminSession'

// Mints a short-lived signed upload URL so the admin panel can upload to
// Storage without the buckets needing to accept anonymous writes. The
// browser still sends the file bytes straight to Supabase (nothing large
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

  let body: any
  try { body = await request.json() } catch { return NextResponse.json({ error: 'Invalid request' }, { status: 400 }) }

  const { bucket, path, size } = body || {}

  if (!ALLOWED_BUCKETS.has(bucket)) {
    return NextResponse.json({ error: 'Bucket not allowed' }, { status: 403 })
  }
  if (typeof path !== 'string' || path.length > 200 || !SAFE_PATH.test(path) || path.includes('..')) {
    return NextResponse.json({ error: 'Invalid file name' }, { status: 400 })
  }

  const ext = path.split('.').pop()?.toLowerCase() || ''
  const maxMb = ALLOWED_EXTENSIONS[ext]
  if (!maxMb) {
    return NextResponse.json({ error: `".${ext}" files aren't allowed.` }, { status: 400 })
  }
  if (typeof size === 'number' && size > maxMb * 1024 * 1024) {
    return NextResponse.json({ error: `.${ext} files can be at most ${maxMb} MB.` }, { status: 400 })
  }

  const { data, error } = await supabaseAdmin.storage.from(bucket).createSignedUploadUrl(path)
  if (error || !data) {
    return NextResponse.json({ error: error?.message || 'Could not start upload' }, { status: 500 })
  }
  return NextResponse.json({ path: data.path, token: data.token })
}
