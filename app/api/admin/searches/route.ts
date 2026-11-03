import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabaseAdmin'
import { requireAdminSession } from '@/lib/requireAdminSession'

// Top search terms over the last 30 days, and the ones that found nothing. Admin only.
export async function GET() {
  const denied = await requireAdminSession()
  if (denied) return denied
  const since = new Date(Date.now() - 30 * 86400000).toISOString().slice(0, 10)
  const { data, error } = await supabaseAdmin.from('site_searches').select('term, searches, no_results').gte('day', since)
  if (error) return NextResponse.json({ error: 'Run the latest SQL update first.' }, { status: 500 })
  const totals = new Map<string, { searches: number; no_results: number }>()
  for (const r of data || []) { const t = totals.get(r.term) || { searches: 0, no_results: 0 }; t.searches += r.searches; t.no_results += r.no_results; totals.set(r.term, t) }
  const rows = [...totals].map(([term, v]) => ({ term, ...v }))
  const { data: lc } = await supabaseAdmin.from('link_clicks').select('label, clicks').gte('day', since)
  const lt = new Map<string, number>(); for (const r of lc || []) lt.set(r.label, (lt.get(r.label) || 0) + r.clicks)
  return NextResponse.json({
    links: [...lt].map(([label, clicks]) => ({ label, clicks })).sort((a, b) => b.clicks - a.clicks),
    total: rows.reduce((s, r) => s + r.searches, 0),
    top: [...rows].sort((a, b) => b.searches - a.searches).slice(0, 25),
    missing: rows.filter((r) => r.no_results > 0).sort((a, b) => b.no_results - a.no_results).slice(0, 25),
  }, { headers: { 'Cache-Control': 'no-store' } })
}
