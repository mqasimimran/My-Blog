import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabaseAdmin'
import { requireAdminSession } from '@/lib/requireAdminSession'
import { invoiceTotals, type Invoice } from '@/lib/invoice'

// Income for the last 12 months: paid shop orders and paid invoices, kept per currency (USD and PKR
// are never added together). Plus unpaid invoices and best-selling products. Admin only.
export async function GET() {
  const denied = await requireAdminSession()
  if (denied) return denied
  const now = new Date()
  const months = Array.from({ length: 12 }, (_, i) => { const d = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - 11 + i, 1)); return d.toISOString().slice(0, 7) })
  const series: Record<'USD' | 'PKR', Record<string, number>> = { USD: {}, PKR: {} }
  for (const m of months) { series.USD[m] = 0; series.PKR[m] = 0 }
  const add = (cur: 'USD' | 'PKR', when: string | null, amount: number) => { const m = (when || '').slice(0, 7); if (m in series[cur]) series[cur][m] = Math.round((series[cur][m] + amount) * 100) / 100 }

  const [{ data: orders }, { data: invoices }] = await Promise.all([
    supabaseAdmin.from('orders').select('product_name, product_price, status, created_at, verified_at').eq('status', 'paid'),
    supabaseAdmin.from('invoices').select('*').in('status', ['paid', 'sent']),
  ])
  const products = new Map<string, { sales: number; revenue: number }>()
  for (const o of orders || []) {
    add('USD', o.verified_at || o.created_at, Number(o.product_price) || 0)
    const p = products.get(o.product_name) || { sales: 0, revenue: 0 }; p.sales++; p.revenue = Math.round((p.revenue + (Number(o.product_price) || 0)) * 100) / 100; products.set(o.product_name, p)
  }
  const unpaid = { USD: 0, PKR: 0, count: 0, overdue: 0 }
  const today = now.toISOString().slice(0, 10)
  for (const inv of (invoices || []) as Invoice[]) {
    const total = invoiceTotals(inv).total
    if (inv.status === 'paid') add(inv.currency, inv.paid_at || inv.issue_date, total)
    else { unpaid[inv.currency] = Math.round((unpaid[inv.currency] + total) * 100) / 100; unpaid.count++; if (inv.due_date && inv.due_date < today) unpaid.overdue++ }
  }
  const thisMonth = months[11], year = String(now.getUTCFullYear())
  const sum = (cur: 'USD' | 'PKR', pred: (m: string) => boolean) => Math.round(Object.entries(series[cur]).filter(([m]) => pred(m)).reduce((s, [, v]) => s + v, 0) * 100) / 100
  return NextResponse.json({
    months,
    series,
    totals: {
      month: { USD: sum('USD', (m) => m === thisMonth), PKR: sum('PKR', (m) => m === thisMonth) },
      year: { USD: sum('USD', (m) => m.startsWith(year)), PKR: sum('PKR', (m) => m.startsWith(year)) },
      last12: { USD: sum('USD', () => true), PKR: sum('PKR', () => true) },
    },
    unpaid,
    topProducts: [...products].map(([name, v]) => ({ name, ...v })).sort((a, b) => b.revenue - a.revenue).slice(0, 5),
  }, { headers: { 'Cache-Control': 'no-store' } })
}
