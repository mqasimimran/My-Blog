'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import AdminNav from '@/app/admin/AdminNav'
import { money } from '@/lib/invoice'

type Data = { months: string[]; series: Record<'USD' | 'PKR', Record<string, number>>; totals: Record<'month' | 'year' | 'last12', Record<'USD' | 'PKR', number>>; unpaid: { USD: number; PKR: number; count: number; overdue: number }; topProducts: { name: string; sales: number; revenue: number }[] }

// Admin -> Income: shop sales and paid invoices by month, unpaid invoices, and best sellers.
export default function IncomePage() {
  const [d, setD] = useState<Data | null>(null)
  const [error, setError] = useState('')
  const [cur, setCur] = useState<'USD' | 'PKR'>('USD')
  useEffect(() => { fetch('/api/admin/income').then(async (r) => { const j = await r.json(); r.ok ? setD(j) : setError(j.error || 'Could not load.') }).catch(() => setError('Could not load.')) }, [])
  const both = (v: Record<'USD' | 'PKR', number>) => [v.USD ? money(v.USD, 'USD') : '', v.PKR ? money(v.PKR, 'PKR') : ''].filter(Boolean).join(' + ') || money(0, cur)
  const max = d ? Math.max(1, ...d.months.map((m) => d.series[cur][m])) : 1

  return (
    <div className="flex min-h-screen">
      <AdminNav />
      <main className="flex-1 px-6 py-10 md:px-12">
        <h1 className="text-4xl text-ink-900">Income</h1>
        <p className="mt-2 text-sm text-ink-500">Paid shop orders and paid invoices. Dollars and rupees are kept separate.</p>
        {error && <p role="alert" className="mt-6 text-sm text-error">{error}</p>}
        {d && (
          <>
            <div className="mt-8 grid gap-px border border-ink-100 bg-ink-100 md:grid-cols-4">
              {([['This month', d.totals.month], ['This year', d.totals.year], ['Last 12 months', d.totals.last12]] as const).map(([lab, v]) => (
                <div key={lab} className="bg-paper-raised p-5"><p className="text-[11px] uppercase tracking-[0.08em] text-ink-500">{lab}</p><p className="mt-2 font-mono text-xl text-ink-900">{both(v)}</p></div>
              ))}
              <Link href="/admin/invoices" className="bg-paper-raised p-5 hover:bg-ink-50"><p className="text-[11px] uppercase tracking-[0.08em] text-ink-500">Unpaid invoices</p><p className="mt-2 font-mono text-xl text-ink-900">{d.unpaid.count ? both(d.unpaid) : '0'}</p><p className={`mt-1 text-xs ${d.unpaid.overdue ? 'text-warning' : 'text-ink-500'}`}>{d.unpaid.count} unpaid{d.unpaid.overdue ? `, ${d.unpaid.overdue} overdue` : ''}</p></Link>
            </div>
            <section className="mt-8 border border-ink-100 bg-paper-raised p-6">
              <div className="flex items-center justify-between"><h2 className="text-xs font-medium uppercase tracking-[0.08em] text-ink-900">By month</h2>
                <div role="tablist" className="flex gap-1 text-xs">{(['USD', 'PKR'] as const).map((c) => <button key={c} role="tab" aria-selected={cur === c} onClick={() => setCur(c)} className={`px-3 py-1.5 ${cur === c ? 'bg-ink-900 text-paper' : 'border border-ink-100 text-ink-700'}`}>{c}</button>)}</div></div>
              <div className="mt-6 flex h-48 items-end gap-2" role="img" aria-label={`Income by month in ${cur}`}>
                {d.months.map((m) => { const v = d.series[cur][m]; return (
                  <div key={m} className="flex flex-1 flex-col items-center gap-2" title={`${m}: ${money(v, cur)}`}>
                    <div className="w-full bg-accent-600 transition-all" style={{ height: `${Math.max(v ? 4 : 1, (v / max) * 160)}px`, opacity: v ? 1 : 0.15 }} />
                    <span className="text-[10px] text-ink-500">{new Date(m + '-01T00:00:00Z').toLocaleDateString('en-US', { month: 'short', timeZone: 'UTC' })}</span>
                  </div>) })}
              </div>
            </section>
            <section className="mt-8 border border-ink-100 bg-paper-raised p-6">
              <h2 className="text-xs font-medium uppercase tracking-[0.08em] text-ink-900">Best-selling products</h2>
              {d.topProducts.length === 0 ? <p className="mt-4 text-sm text-ink-500">No paid orders yet.</p> : (
                <table className="mt-4 w-full text-sm"><tbody>{d.topProducts.map((p) => <tr key={p.name} className="border-b border-ink-100"><td className="py-2.5 text-ink-900">{p.name}</td><td className="py-2.5 text-right text-ink-500">{p.sales} sold</td><td className="py-2.5 text-right font-mono">{money(p.revenue, 'USD')}</td></tr>)}</tbody></table>
              )}
            </section>
          </>
        )}
      </main>
    </div>
  )
}
