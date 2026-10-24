'use client'

import { useEffect, useState } from 'react'
import AdminNav from '@/app/admin/AdminNav'
import { adminApi } from '@/lib/adminApi'
import { money } from '@/lib/invoice'

type Entry = { id: string; client_name: string; project: string | null; description: string | null; work_date: string; minutes: number; rate: number; currency: 'USD' | 'PKR'; invoice_id: string | null }
type Running = { client: string; project: string; description: string; rate: string; currency: 'USD' | 'PKR'; startedAt: number }
const field = 'border border-ink-300 bg-paper-raised px-3 py-2.5 text-sm text-ink-900 outline-none focus:border-accent-600'
const hm = (min: number) => `${Math.floor(min / 60)}h ${String(min % 60).padStart(2, '0')}m`
const KEY = 'time-tracker-running'

// Admin -> Time Tracking: a start/stop timer (kept in this browser, so it survives closing the tab),
// manual entries, and one-click invoices from a client's unbilled hours.
export default function TimePage() {
  const [entries, setEntries] = useState<Entry[]>([])
  const [running, setRunning] = useState<Running | null>(null)
  const [now, setNow] = useState(Date.now())
  const [f, setF] = useState({ client: '', project: '', description: '', rate: '', currency: 'USD' as 'USD' | 'PKR', minutes: '', date: new Date().toISOString().slice(0, 10) })
  const [msg, setMsg] = useState('')
  const load = async () => { try { setEntries(((await adminApi.list('time_entries', { orderBy: 'work_date', ascending: false })) as Entry[]) || []) } catch { setMsg('Could not load. Has the latest SQL update been run?') } }
  useEffect(() => { load(); try { const r = localStorage.getItem(KEY); if (r) setRunning(JSON.parse(r)) } catch {} }, [])
  useEffect(() => { if (!running) return; const t = setInterval(() => setNow(Date.now()), 1000); return () => clearInterval(t) }, [running])

  const start = () => {
    if (!f.client.trim()) return setMsg('Add a client name first.')
    const r: Running = { client: f.client.trim(), project: f.project.trim(), description: f.description.trim(), rate: f.rate, currency: f.currency, startedAt: Date.now() }
    setRunning(r); try { localStorage.setItem(KEY, JSON.stringify(r)) } catch {} setMsg('')
  }
  const save = async (client: string, project: string, description: string, minutes: number, rate: string, currency: 'USD' | 'PKR', date: string) => {
    await adminApi.insert('time_entries', { client_name: client, project: project || null, description: description || null, minutes, rate: Number(rate) || 0, currency, work_date: date })
    load()
  }
  const stop = async () => {
    if (!running) return
    const minutes = Math.max(1, Math.ceil((Date.now() - running.startedAt) / 60000))
    await save(running.client, running.project, running.description, minutes, running.rate, running.currency, new Date().toISOString().slice(0, 10))
    setRunning(null); try { localStorage.removeItem(KEY) } catch {} setMsg(`Saved ${hm(minutes)} for ${running.client}.`)
  }
  const addManual = async (e: React.FormEvent) => {
    e.preventDefault()
    const minutes = Math.round(Number(f.minutes) * 60)
    if (!f.client.trim() || !(minutes > 0)) return setMsg('Add a client and the hours (e.g. 1.5).')
    await save(f.client.trim(), f.project.trim(), f.description.trim(), minutes, f.rate, f.currency, f.date); setF({ ...f, minutes: '', description: '' }); setMsg('Time added.')
  }
  async function invoice(client: string, currency: 'USD' | 'PKR') {
    if (!confirm(`Create a draft invoice for ${client}'s unbilled ${currency} hours?`)) return
    const res = await fetch('/api/admin/time/invoice', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ client, currency }) })
    const d = await res.json(); setMsg(res.ok ? `Draft invoice ${d.number} created from ${d.entries} entries. Review and send it in Invoices.` : d.error); load()
  }
  const unbilled = entries.filter((e) => !e.invoice_id)
  const groups = [...new Set(unbilled.map((e) => `${e.client_name}|${e.currency}`))].map((k) => {
    const [client, currency] = k.split('|') as [string, 'USD' | 'PKR']; const list = unbilled.filter((e) => e.client_name === client && e.currency === currency)
    return { client, currency, minutes: list.reduce((s, e) => s + e.minutes, 0), amount: list.reduce((s, e) => s + (e.minutes / 60) * Number(e.rate), 0) }
  })
  const elapsed = running ? Math.floor((now - running.startedAt) / 1000) : 0

  return (
    <div className="flex min-h-screen">
      <AdminNav />
      <main className="flex-1 px-6 py-10 md:px-12">
        <h1 className="text-4xl text-ink-900">Time Tracking</h1>
        <p className="mt-2 text-sm text-ink-500">Track hours per client, then turn unbilled time into an invoice in one click.</p>
        {msg && <p role="status" className="mt-4 text-sm text-ink-700">{msg}</p>}
        <section className="mt-8 border border-ink-100 bg-paper-raised p-6">
          {running ? (
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div><p className="text-sm text-ink-500">Tracking {running.client}{running.project ? ` \u00b7 ${running.project}` : ''}</p>
                <p className="font-mono text-4xl tabular-nums text-ink-900" aria-live="off">{String(Math.floor(elapsed / 3600)).padStart(2, '0')}:{String(Math.floor((elapsed % 3600) / 60)).padStart(2, '0')}:{String(elapsed % 60).padStart(2, '0')}</p></div>
              <button onClick={stop} className="bg-error px-6 py-3 text-xs font-medium uppercase tracking-[0.08em] text-white">Stop and save</button>
            </div>
          ) : (
            <form onSubmit={addManual} className="grid gap-3 md:grid-cols-6">
              <input aria-label="Client" placeholder="Client" value={f.client} onChange={(e) => setF({ ...f, client: e.target.value })} className={field} list="clients" />
              <datalist id="clients">{[...new Set(entries.map((e) => e.client_name))].map((c) => <option key={c} value={c} />)}</datalist>
              <input aria-label="Project" placeholder="Project (optional)" value={f.project} onChange={(e) => setF({ ...f, project: e.target.value })} className={field} />
              <input aria-label="What you did" placeholder="What you did" value={f.description} onChange={(e) => setF({ ...f, description: e.target.value })} className={`${field} md:col-span-2`} />
              <input aria-label="Hourly rate" type="number" min="0" placeholder="Rate / hour" value={f.rate} onChange={(e) => setF({ ...f, rate: e.target.value })} className={field} />
              <select aria-label="Currency" value={f.currency} onChange={(e) => setF({ ...f, currency: e.target.value as 'USD' | 'PKR' })} className={field}><option>USD</option><option>PKR</option></select>
              <button type="button" onClick={start} className="bg-ink-900 px-4 py-2.5 text-xs font-medium uppercase tracking-[0.08em] text-paper hover:bg-accent-600 md:col-span-2">Start timer</button>
              <input aria-label="Hours (manual)" type="number" min="0" step="0.25" placeholder="or hours, e.g. 1.5" value={f.minutes} onChange={(e) => setF({ ...f, minutes: e.target.value })} className={field} />
              <input aria-label="Date" type="date" value={f.date} onChange={(e) => setF({ ...f, date: e.target.value })} className={field} />
              <button type="submit" className="border border-ink-900 px-4 py-2.5 text-xs font-medium uppercase tracking-[0.08em] text-ink-900 md:col-span-2">Add time</button>
            </form>
          )}
        </section>
        <section className="mt-8 border border-ink-100 bg-paper-raised p-6">
          <h2 className="text-xs font-medium uppercase tracking-[0.08em] text-ink-900">Unbilled</h2>
          {groups.length === 0 ? <p className="mt-4 text-sm text-ink-500">Nothing unbilled.</p> : (
            <table className="mt-4 w-full text-sm"><tbody>{groups.map((g) => (
              <tr key={g.client + g.currency} className="border-b border-ink-100"><td className="py-3 text-ink-900">{g.client}</td><td className="py-3 text-right font-mono">{hm(g.minutes)}</td><td className="py-3 text-right font-mono">{money(g.amount, g.currency)}</td>
                <td className="py-3 text-right"><button onClick={() => invoice(g.client, g.currency)} className="bg-ink-900 px-3 py-1.5 text-xs font-medium uppercase tracking-[0.08em] text-paper hover:bg-accent-600">Create invoice</button></td></tr>))}</tbody></table>
          )}
        </section>
        <section className="mt-8 overflow-x-auto border border-ink-100 bg-paper-raised">
          <table className="w-full text-left text-sm">
            <thead><tr><th className="px-4 py-3">Date</th><th className="px-4 py-3">Client</th><th className="px-4 py-3">Project</th><th className="px-4 py-3">What</th><th className="px-4 py-3 text-right">Time</th><th className="px-4 py-3">Billed</th><th className="px-4 py-3" /></tr></thead>
            <tbody>{entries.length === 0 ? <tr><td colSpan={7} className="px-4 py-6 text-ink-500">No time tracked yet.</td></tr> : entries.map((e) => (
              <tr key={e.id} className="border-t border-ink-100"><td className="px-4 py-3">{e.work_date}</td><td className="px-4 py-3">{e.client_name}</td><td className="px-4 py-3">{e.project}</td><td className="px-4 py-3">{e.description}</td><td className="px-4 py-3 text-right font-mono">{hm(e.minutes)}</td>
                <td className="px-4 py-3 text-xs">{e.invoice_id ? 'Billed' : '\u2014'}</td>
                <td className="px-4 py-3 text-right">{!e.invoice_id && <button onClick={async () => { if (confirm('Delete this entry?')) { await adminApi.remove('time_entries', e.id); load() } }} className="text-xs uppercase tracking-[0.08em] text-ink-500 hover:text-error">Delete</button>}</td></tr>))}</tbody>
          </table>
        </section>
      </main>
    </div>
  )
}
