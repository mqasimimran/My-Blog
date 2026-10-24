'use client'

import { useEffect, useState } from 'react'
import AdminNav from '@/app/admin/AdminNav'

type Row = { term: string; searches: number; no_results: number }

// Admin -> Site Searches: what visitors look for, and what they couldn't find (ideas for new content).
// Page views, referrers and countries are in Vercel -> your project -> Analytics.
export default function SearchesPage() {
  const [data, setData] = useState<{ total: number; top: Row[]; missing: Row[] } | null>(null)
  const [error, setError] = useState('')
  useEffect(() => { fetch('/api/admin/searches').then(async (r) => { const d = await r.json(); r.ok ? setData(d) : setError(d.error || 'Could not load.') }).catch(() => setError('Could not load.')) }, [])
  const table = (rows: Row[], col: 'searches' | 'no_results', empty: string) => rows.length === 0 ? <p className="mt-4 text-sm text-ink-500">{empty}</p> : (
    <table className="mt-4 w-full text-left text-sm"><tbody>
      {rows.map((r) => <tr key={r.term} className="border-b border-ink-100"><td className="py-2.5 text-ink-900">{r.term}</td><td className="py-2.5 text-right font-mono tabular-nums text-ink-700">{r[col]}</td></tr>)}
    </tbody></table>
  )
  return (
    <div className="flex min-h-screen">
      <AdminNav />
      <main className="flex-1 px-6 py-10 md:px-12">
        <h1 className="text-4xl text-ink-900">Site Searches</h1>
        <p className="mt-2 max-w-2xl text-sm text-ink-500">What visitors typed into your site&rsquo;s search in the last 30 days. Only the words and daily counts are stored, never who searched. For page views, referrers and countries, open Vercel &rarr; your project &rarr; Analytics.</p>
        {error && <p role="alert" className="mt-6 text-sm text-error">{error}</p>}
        {data && (
          <>
            <p className="mt-6 text-sm text-ink-700">{data.total} searches</p>
            <div className="mt-6 grid gap-10 md:grid-cols-2">
              <section className="border border-ink-100 bg-paper-raised p-6"><h2 className="text-xs font-medium uppercase tracking-[0.08em] text-ink-900">Most searched</h2>{table(data.top, 'searches', 'No searches yet.')}</section>
              <section className="border border-ink-100 bg-paper-raised p-6"><h2 className="text-xs font-medium uppercase tracking-[0.08em] text-ink-900">Found nothing</h2><p className="mt-1 text-xs text-ink-500">Ideas for what to write or build next.</p>{table(data.missing, 'no_results', 'Every search found something.')}</section>
            </div>
          </>
        )}
      </main>
    </div>
  )
}
