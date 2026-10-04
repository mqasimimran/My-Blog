import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabaseAdmin'
import { requireAdminSession } from '@/lib/requireAdminSession'

// Every table the admin panel is allowed to read/write through this route.
// Anything not in this list is refused outright — this is what makes the
// route safe to expose at all: a session check alone isn't enough if the
// table name is an open parameter, since that would still let a logged-in
// admin (or a stolen session) reach tables they shouldn't, like
// `login_attempts` or `rate_limit_log`.
const ALLOWED_TABLES = new Set([
  'articles',
  'certifications',
  'client_logos',
  'designs',
  'education',
  'experiences',
  'journey_entries',
  'messages',
  'newsletter_subscribers',
  'orders',
  'products',
  'projects',
  'projects_resume',
  'roadmap_items',
  'service_packages',
  'services',
  'site_settings',
  'testimonials',
  'activity_log',
])

function checkTable(table: string) {
  if (!ALLOWED_TABLES.has(table)) {
    return NextResponse.json({ error: `Table "${table}" is not accessible through this API.` }, { status: 403 })
  }
  return null
}

type Params = { params: Promise<{ table: string }> }

// GET /api/admin/[table]?select=...&id=...  (id optional — omit for a list)
export async function GET(request: NextRequest, { params }: Params) {
  const unauthorized = await requireAdminSession()
  if (unauthorized) return unauthorized

  const { table } = await params
  const tableError = checkTable(table)
  if (tableError) return tableError

  const { searchParams } = new URL(request.url)
  const select = searchParams.get('select') || '*'
  const id = searchParams.get('id')
  const orderBy = searchParams.get('orderBy')
  const ascending = searchParams.get('ascending') !== 'false'

  const { data, error } = id
    ? await supabaseAdmin.from(table).select(select).eq('id', id).single()
    : await (orderBy
        ? supabaseAdmin.from(table).select(select).order(orderBy, { ascending })
        : supabaseAdmin.from(table).select(select))
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ data })
}

// POST /api/admin/[table]  — body: the row to insert
export async function POST(request: NextRequest, { params }: Params) {
  const unauthorized = await requireAdminSession()
  if (unauthorized) return unauthorized

  const { table } = await params
  const tableError = checkTable(table)
  if (tableError) return tableError

  const body = await request.json()
  const { data, error } = await supabaseAdmin.from(table).insert([body]).select()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ data })
}

// PATCH /api/admin/[table]  — body: { id, ...fieldsToUpdate } OR { ids: [...], ...fieldsToUpdate } for bulk
export async function PATCH(request: NextRequest, { params }: Params) {
  const unauthorized = await requireAdminSession()
  if (unauthorized) return unauthorized

  const { table } = await params
  const tableError = checkTable(table)
  if (tableError) return tableError

  const body = await request.json()
  const { id, ids, ...fields } = body

  if (!id && !ids) {
    return NextResponse.json({ error: 'Provide an id or ids to update.' }, { status: 400 })
  }

  let query = supabaseAdmin.from(table).update(fields)
  query = id ? query.eq('id', id) : query.in('id', ids)

  const { data, error } = await query.select()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ data })
}

// DELETE /api/admin/[table]?id=...  OR  ?ids=1,2,3  for bulk
export async function DELETE(request: NextRequest, { params }: Params) {
  const unauthorized = await requireAdminSession()
  if (unauthorized) return unauthorized

  const { table } = await params
  const tableError = checkTable(table)
  if (tableError) return tableError

  const { searchParams } = new URL(request.url)
  const id = searchParams.get('id')
  const idsParam = searchParams.get('ids')

  if (!id && !idsParam) {
    return NextResponse.json({ error: 'Provide an id or ids to delete.' }, { status: 400 })
  }

  let query = supabaseAdmin.from(table).delete()
  query = id ? query.eq('id', id) : query.in('id', idsParam!.split(','))

  const { data, error } = await query.select()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  if (!data || data.length === 0) {
    // With RLS now locked down, a silent "0 rows affected" almost always
    // means the row didn't exist or the policy blocked it — surfacing
    // this explicitly instead of pretending the delete succeeded.
    return NextResponse.json({ error: 'Nothing was deleted — the row may not exist.' }, { status: 404 })
  }
  return NextResponse.json({ data })
}
