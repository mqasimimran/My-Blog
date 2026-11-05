'use client'

import { useEffect, useState } from 'react'
import AdminNav from '@/app/admin/AdminNav'
import { adminApi } from '@/lib/adminApi'

type E = { id: string; hash: string; message: string; source: string; url: string | null; detail: string | null; count: number; first_seen: string; last_seen: string }

// Admin -> Error Reports: errors real visitors hit, grouped. You're emailed when one first appears.
export default function ErrorsAdmin() {
  const [list, setList] = useState<E[]>([])
  const [open, setOpen] = useState<string | null>(null)
  const [msg, setMsg] = useState('')
  const load = async () => { await adminApi.list('error_reports', { orderBy: 'last_seen', ascending: false })
      .then((rows: E[]) => setList(rows || []))
      .catch(() => setMsg('Could not load. Has the latest SQL update been run?')) }
  useEffect(() => { load() }, [])
  const clear = async (id: string) => { try { await adminApi.remove('error_reports', id); setList((l) => l.filter((e) => e.id !== id)) } catch { setMsg('Could not remove it.') } }
  return (
    <div className="flex min-h-screen">
      <AdminNav />
      <main className="flex-1 px-6 py-10 md:px-12">
        <h1 className="text-4xl text-ink-900">Error Reports</h1>
        <p className="mt-2 text-sm text-ink-500">Errors real visitors ran into, grouped. You&rsquo;re emailed when one appears (at most once an hour each).</p>
        {msg && <p role="status" className="mt-4 text-sm text-error">{msg}</p>}
        <ul className="mt-8 space-y-3">
          {list.length === 0 && <li className="text-sm text-ink-500">No errors. Everything&rsquo;s running smoothly.</li>}
          {list.map((e) => (
            <li key={e.hash} className="border border-ink-100 bg-paper-raised p-4 text-sm">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0 flex-1"><p className="font-medium text-ink-900">{e.message}</p><p className="mt-1 text-xs text-ink-500">{e.source} &middot; {e.url || '\u2014'} &middot; {e.count}&times; &middot; last {new Date(e.last_seen).toLocaleString()}</p></div>
                <div className="flex gap-3 text-xs font-medium uppercase tracking-[0.08em]"><button onClick={() => setOpen(open === e.hash ? null : e.hash)} className="text-ink-700">Details</button><button onClick={() => clear(e.id)} className="text-ink-500 hover:text-error">Resolved</button></div>
              </div>
              {open === e.hash && e.detail && <pre className="mt-3 max-h-64 overflow-auto whitespace-pre-wrap bg-paper p-3 font-mono text-xs text-ink-700">{e.detail}</pre>}
            </li>))}
        </ul>
      </main>
    </div>
  )
}
