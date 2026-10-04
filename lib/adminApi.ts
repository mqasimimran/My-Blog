'use client'

// Thin client for the secured /api/admin/[table] route. Use this from
// admin pages instead of calling `supabase.from(table).insert/update/delete`
// directly — those went straight to the database with the public anon
// key and no server-side check at all. This routes every write through
// an API endpoint that verifies your login session first.
//
// Deliberately mirrors the shape of the old supabase-js calls so each
// admin page only needs its insert/update/delete lines swapped, not a
// rewrite: supabase.from(t).insert([data]) -> adminApi.insert(t, data)

type Id = string | number | string[] | undefined

// Route params can be string | string[] | undefined and some tables
// (site_settings) use numeric ids — normalize, and refuse a missing id
// outright instead of sending "undefined" to the server.
function normalizeId(id: Id): string {
  const v = Array.isArray(id) ? id[0] : id
  if (v === undefined || v === null || String(v) === '') throw new Error('Missing id')
  return String(v)
}

async function handle(res: Response) {
  const json = await res.json()
  if (!res.ok) throw new Error(json.error || `Request failed (${res.status})`)
  return json.data
}

export const adminApi = {
  async list(table: string, opts?: { select?: string; orderBy?: string; ascending?: boolean }) {
    const params = new URLSearchParams()
    if (opts?.select) params.set('select', opts.select)
    if (opts?.orderBy) params.set('orderBy', opts.orderBy)
    if (opts?.ascending === false) params.set('ascending', 'false')
    const res = await fetch(`/api/admin/${table}?${params}`)
    return handle(res)
  },

  async get(table: string, id: Id, select?: string) {
    const params = new URLSearchParams({ id: normalizeId(id) })
    if (select) params.set('select', select)
    const res = await fetch(`/api/admin/${table}?${params}`)
    const data = await handle(res)
    return data // already a single row, since GET with id uses .single()
  },

  async insert(table: string, row: Record<string, any>) {
    const res = await fetch(`/api/admin/${table}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(row),
    })
    return handle(res)
  },

  async update(table: string, id: Id, fields: Record<string, any>) {
    const res = await fetch(`/api/admin/${table}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: normalizeId(id), ...fields }),
    })
    return handle(res)
  },

  async updateMany(table: string, ids: (string | number)[], fields: Record<string, any>) {
    const res = await fetch(`/api/admin/${table}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ids, ...fields }),
    })
    return handle(res)
  },

  async remove(table: string, id: Id) {
    const res = await fetch(`/api/admin/${table}?id=${encodeURIComponent(normalizeId(id))}`, { method: 'DELETE' })
    return handle(res)
  },

  async removeMany(table: string, ids: (string | number)[]) {
    const res = await fetch(`/api/admin/${table}?ids=${ids.map(i => encodeURIComponent(String(i))).join(',')}`, { method: 'DELETE' })
    return handle(res)
  },
}
