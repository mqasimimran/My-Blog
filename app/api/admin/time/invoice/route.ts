import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabaseAdmin'
import { requireAdminSession } from '@/lib/requireAdminSession'
import { nextNumber } from '@/lib/invoiceServer'

// Turns a client's unbilled hours (in one currency) into a draft invoice: one line per project,
// quantity in hours at the hourly rate. Those entries are then marked billed, so they can't be
// invoiced twice (only entries still unbilled at that moment are claimed).
export async function POST(request: NextRequest) {
  const denied = await requireAdminSession()
  if (denied) return denied
  const b = await request.json().catch(() => ({}))
  const client = typeof b.client === 'string' ? b.client : ''
  const currency = b.currency === 'PKR' ? 'PKR' : 'USD'
  const { data: entries } = await supabaseAdmin.from('time_entries').select('*').eq('client_name', client).eq('currency', currency).is('invoice_id', null)
  if (!entries?.length) return NextResponse.json({ error: 'No unbilled time for this client.' }, { status: 400 })

  const groups = new Map<string, { minutes: number; rate: number }>()
  for (const e of entries) {
    const key = `${e.project || 'Work'}|${Number(e.rate)}`
    const g = groups.get(key) || { minutes: 0, rate: Number(e.rate) }; g.minutes += e.minutes; groups.set(key, g)
  }
  const items = [...groups].map(([key, g]) => ({ description: `${key.split('|')[0]}: ${(g.minutes / 60).toFixed(2)} hours`, quantity: Math.round((g.minutes / 60) * 100) / 100, unit_price: g.rate }))
  const { data: inv, error } = await supabaseAdmin.from('invoices').insert([{ number: await nextNumber('invoices', 'INV'), client_name: client, currency, items, status: 'draft',
    due_date: new Date(Date.now() + 14 * 86400000).toISOString().slice(0, 10), notes: 'Hours worked, from time tracking.' }]).select('id, number').single()
  if (error || !inv) return NextResponse.json({ error: 'Could not create the invoice.' }, { status: 500 })
  await supabaseAdmin.from('time_entries').update({ invoice_id: inv.id }).in('id', entries.map((e) => e.id)).is('invoice_id', null)
  return NextResponse.json({ ok: true, number: inv.number, entries: entries.length })
}
