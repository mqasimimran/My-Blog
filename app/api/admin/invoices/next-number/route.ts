import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabaseAdmin'
import { requireAdminSession } from '@/lib/requireAdminSession'

// The next invoice number for this year: INV-2026-001, INV-2026-002, ...
export async function GET() {
  const denied = await requireAdminSession()
  if (denied) return denied
  const prefix = `INV-${new Date().getFullYear()}-`
  const { data } = await supabaseAdmin.from('invoices').select('number').like('number', `${prefix}%`)
  const max = (data || []).reduce((m, r) => Math.max(m, parseInt(String(r.number).slice(prefix.length), 10) || 0), 0)
  return NextResponse.json({ number: `${prefix}${String(max + 1).padStart(3, '0')}` }, { headers: { 'Cache-Control': 'no-store' } })
}
