import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabaseAdmin'
import { requireAdminSession } from '@/lib/requireAdminSession'
import { logSecurityEvent, requestMeta } from '@/lib/audit'
import { sanitizeRichHtml } from '@/lib/sanitizeRichHtml'

// Every table the admin panel is allowed to read/write through this route.
// Anything not in this list is refused outright — a session check alone
// isn't enough if the table name is an open parameter, since that would
// still let a stolen session reach tables like `login_attempts`.
const ALLOWED_TABLES = new Set([
  'articles', 'certifications', 'client_logos', 'designs', 'education',
  'experiences', 'journey_entries', 'messages', 'newsletter_subscribers',
  'orders', 'products', 'projects', 'projects_resume', 'roadmap_items',
  'service_packages', 'services', 'site_settings', 'testimonials', 'activity_log',
])

// Tables whose `content` column is rendered as raw HTML on the public site.
const HTML_CONTENT_TABLES = new Set(['articles', 'projects'])

const MAX_BODY_BYTES = 4 * 1024 * 1024 // 4 MB — comfortably above any real article
const SELECT_RE = /^[A-Za-z0-9_,*():!.\s]{1,500}$/
const COLUMN_RE = /^[a-z_][a-z0-9_]{0,62}$/
const ID_RE = /^[A-Za-z0-9_-]{1,100}$/
const MAX_BULK = 200

type Params = { params: Promise<{ table: string }> }

function bad(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status })
}

async function readJsonObject(request: NextRequest): Promise<{ body: Record<string, any> } | { error: NextResponse }> {
  if (Number(request.headers.get('content-length') || 0) > MAX_BODY_BYTES) return { error: bad('Request too large', 413) }
  const text = await request.text()
  if (text.length > MAX_BODY_BYTES) return { error: bad('Request too large', 413) }
  let parsed: unknown
  try { parsed = JSON.parse(text) } catch { return { error: bad('Invalid JSON') } }
  if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return { error: bad('Body must be a JSON object') }
  return { body: parsed as Record<string, any> }
}

function cleanContent(table: string, obj: Record<string, any>) {
  if (HTML_CONTENT_TABLES.has(table) && typeof obj.content === 'string') {
    obj.content = sanitizeRichHtml(obj.content)
  }
  return obj
}

async function guard(request: NextRequest, table: string) {
  const denied = await requireAdminSession()
  if (denied) return { denied }
  if (!ALLOWED_TABLES.has(table)) {
    const meta = requestMeta(request.headers)
    await logSecurityEvent({ event: 'admin_table_blocked', ...meta, detail: { table, method: request.method } })
    return { denied: bad(`Table "${table}" is not accessible through this API.`, 403) }
  }
  return { meta: requestMeta(request.headers) }
}

// GET /api/admin/[table]
//   ?select=...  ?id=...  ?orderBy=col&ascending=false  ?limit=10
//   ?eq=column:value   (one equality filter)   ?count=true  (row count only)
export async function GET(request: NextRequest, { params }: Params) {
  const { table } = await params
  const g = await guard(request, table)
  if (g.denied) return g.denied

  const { searchParams } = new URL(request.url)
  const select = searchParams.get('select') || '*'
  const id = searchParams.get('id')
  const orderBy = searchParams.get('orderBy')
  const ascending = searchParams.get('ascending') !== 'false'
  const limitParam = searchParams.get('limit')
  const eqParam = searchParams.get('eq')
  const wantCount = searchParams.get('count') === 'true'

  if (!SELECT_RE.test(select)) return bad('Invalid select')
  if (id && !ID_RE.test(id)) return bad('Invalid id')
  if (orderBy && !COLUMN_RE.test(orderBy)) return bad('Invalid orderBy')
  const limit = limitParam === null ? null : Number(limitParam)
  if (limit !== null && (!Number.isInteger(limit) || limit < 1 || limit > 500)) return bad('Invalid limit')
  let eq: [string, string] | null = null
  if (eqParam) {
    const i = eqParam.indexOf(':')
    const col = i > 0 ? eqParam.slice(0, i) : ''
    const val = i > 0 ? eqParam.slice(i + 1) : ''
    if (!COLUMN_RE.test(col) || !ID_RE.test(val)) return bad('Invalid eq filter')
    eq = [col, val]
  }

  // Row count only (used e.g. to work out the next display order).
  if (wantCount) {
    let cq: any = supabaseAdmin.from(table).select('*', { count: 'exact', head: true })
    if (eq) cq = cq.eq(eq[0], eq[1])
    const { count, error } = await cq
    if (error) return bad(error.message, 500)
    return NextResponse.json({ count: count || 0 })
  }

  let q: any = supabaseAdmin.from(table).select(select)
  if (eq) q = q.eq(eq[0], eq[1])
  if (id) {
    const { data, error } = await q.eq('id', id).single()
    if (error) return bad(error.message, 500)
    return NextResponse.json({ data })
  }
  if (orderBy) q = q.order(orderBy, { ascending })
  if (limit !== null) q = q.limit(limit)
  const { data, error } = await q
  if (error) return bad(error.message, 500)
  return NextResponse.json({ data })
}

// POST /api/admin/[table] — body: the row to insert
export async function POST(request: NextRequest, { params }: Params) {
  const { table } = await params
  const g = await guard(request, table)
  if (g.denied) return g.denied

  const parsed = await readJsonObject(request)
  if ('error' in parsed) return parsed.error
  const row = cleanContent(table, parsed.body)

  const { data, error } = await supabaseAdmin.from(table).insert([row]).select()
  if (error) return bad(error.message, 500)
  await logSecurityEvent({ event: 'admin_write', ...g.meta, detail: { table, op: 'insert', ids: (data || []).map((r: any) => r.id), fields: Object.keys(row) } })
  return NextResponse.json({ data })
}

// PATCH /api/admin/[table] — body: { id, ...fields } or { ids: [...], ...fields } for bulk
export async function PATCH(request: NextRequest, { params }: Params) {
  const { table } = await params
  const g = await guard(request, table)
  if (g.denied) return g.denied

  const parsed = await readJsonObject(request)
  if ('error' in parsed) return parsed.error
  const { id, ids, ...rest } = parsed.body
  const fields = cleanContent(table, rest)

  if (id === undefined && ids === undefined) return bad('Provide an id or ids to update.')
  if (id !== undefined && !ID_RE.test(String(id))) return bad('Invalid id')
  if (ids !== undefined && (!Array.isArray(ids) || ids.length === 0 || ids.length > MAX_BULK || !ids.every((x: unknown) => ID_RE.test(String(x))))) {
    return bad('Invalid ids')
  }
  if (Object.keys(fields).length === 0) return bad('Nothing to update.')

  let query = supabaseAdmin.from(table).update(fields)
  query = id !== undefined ? query.eq('id', String(id)) : query.in('id', ids.map(String))

  const { data, error } = await query.select()
  if (error) return bad(error.message, 500)
  await logSecurityEvent({ event: 'admin_write', ...g.meta, detail: { table, op: 'update', ids: id !== undefined ? [String(id)] : ids.map(String), fields: Object.keys(fields) } })
  return NextResponse.json({ data })
}

// DELETE /api/admin/[table]?id=...  OR  ?ids=1,2,3  for bulk
export async function DELETE(request: NextRequest, { params }: Params) {
  const { table } = await params
  const g = await guard(request, table)
  if (g.denied) return g.denied

  const { searchParams } = new URL(request.url)
  const id = searchParams.get('id')
  const idsParam = searchParams.get('ids')
  if (!id && !idsParam) return bad('Provide an id or ids to delete.')

  const ids = idsParam ? idsParam.split(',') : []
  if (id && !ID_RE.test(id)) return bad('Invalid id')
  if (idsParam && (ids.length > MAX_BULK || !ids.every((x) => ID_RE.test(x)))) return bad('Invalid ids')

  let query = supabaseAdmin.from(table).delete()
  query = id ? query.eq('id', id) : query.in('id', ids)

  const { data, error } = await query.select()
  if (error) return bad(error.message, 500)
  if (!data || data.length === 0) return bad('Nothing was deleted — the row may not exist.', 404)
  await logSecurityEvent({ event: 'admin_write', ...g.meta, detail: { table, op: 'delete', ids: data.map((r: any) => r.id) } })
  return NextResponse.json({ data })
}
