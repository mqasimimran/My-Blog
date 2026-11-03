'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import AdminNav from '@/app/admin/AdminNav'
import { adminApi } from '@/lib/adminApi'

type Item = { id?: string; title: string; kind: string; status: 'idea' | 'drafting' | 'scheduled' | 'published'; planned_for: string | null; notes: string | null; link: string | null }
type Auto = { date: string; title: string; kind: string; href: string }
const KINDS = ['post', 'reel', 'video', 'newsletter', 'other']
const STATUS: Record<Item['status'], string> = { idea: 'bg-ink-100 text-ink-700', drafting: 'bg-warning/20 text-ink-900', scheduled: 'bg-accent-600 text-white', published: 'bg-success text-white' }
const iso = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
const field = 'w-full border border-ink-300 bg-paper-raised px-3 py-2 text-sm text-ink-900 outline-none focus:border-accent-600'

// Admin -> Content Calendar: plan posts, reels, videos and newsletters. Blog posts and sent newsletters
// appear automatically on their dates.
export default function CalendarAdmin() {
  const [month, setMonth] = useState(() => { const d = new Date(); return new Date(d.getFullYear(), d.getMonth(), 1) })
  const [items, setItems] = useState<Item[]>([])
  const [auto, setAuto] = useState<Auto[]>([])
  const [edit, setEdit] = useState<Item | null>(null)
  const [msg, setMsg] = useState('')
  const load = async () => {
    try { setItems(((await adminApi.list('content_items', { orderBy: 'planned_for', ascending: true })) as Item[]) || []) } catch { setMsg('Could not load. Has the latest SQL update been run?') }
    const posts = ((await adminApi.list('articles').catch(() => [])) as { title: string; slug: string; created_at: string; publish_at?: string | null; published: boolean }[]) || []
    const sent = ((await adminApi.list('newsletter_campaigns').catch(() => [])) as { subject: string; sent_at: string }[]) || []
    setAuto([...posts.filter((p) => p.published).map((p) => ({ date: (p.publish_at || p.created_at).slice(0, 10), title: p.title, kind: 'blog post', href: `/blog/${p.slug}` })),
      ...sent.map((n) => ({ date: n.sent_at.slice(0, 10), title: n.subject, kind: 'newsletter sent', href: '/admin/newsletter/send' }))])
  }
  useEffect(() => { load() }, [])
  const days = useMemo(() => {
    const first = new Date(month), start = new Date(first); start.setDate(1 - ((first.getDay() + 6) % 7))
    return Array.from({ length: 42 }, (_, i) => { const d = new Date(start); d.setDate(start.getDate() + i); return d })
  }, [month])
  async function save() {
    if (!edit?.title.trim()) return setMsg('Add a title.')
    const row = { title: edit.title.trim(), kind: edit.kind, status: edit.status, planned_for: edit.planned_for || null, notes: edit.notes?.trim() || null, link: edit.link?.trim() || null }
    try { if (edit.id) await adminApi.update('content_items', edit.id, row); else await adminApi.insert('content_items', row); setEdit(null); setMsg(''); load() } catch { setMsg('Could not save.') }
  }
  const today = iso(new Date()), ideas = items.filter((i) => !i.planned_for)
  return (
    <div className="flex min-h-screen">
      <AdminNav />
      <main className="flex-1 px-6 py-10 md:px-10">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div><h1 className="text-4xl text-ink-900">Content Calendar</h1><p className="mt-2 text-sm text-ink-500">Plan what you&rsquo;ll publish. Click a day to add something.</p></div>
          <div className="flex items-center gap-2">
            <button onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() - 1, 1))} aria-label="Previous month" className="border border-ink-100 px-3 py-2">&larr;</button>
            <span className="w-40 text-center font-medium text-ink-900">{month.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</span>
            <button onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() + 1, 1))} aria-label="Next month" className="border border-ink-100 px-3 py-2">&rarr;</button>
          </div>
        </div>
        {msg && <p role="status" className="mt-4 text-sm text-error">{msg}</p>}
        <div className="mt-4 flex flex-wrap gap-3 text-xs">{(Object.keys(STATUS) as Item['status'][]).map((s) => <span key={s} className={`px-2 py-1 capitalize ${STATUS[s]}`}>{s}</span>)}<span className="border border-dashed border-ink-300 px-2 py-1 text-ink-500">automatic (blog / newsletter)</span></div>
        <div className="mt-4 grid gap-6 xl:grid-cols-[1fr_260px]">
          <div className="grid grid-cols-7 gap-px border border-ink-100 bg-ink-100 text-xs">
            {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((d) => <div key={d} className="bg-paper-raised px-2 py-1.5 font-medium text-ink-500">{d}</div>)}
            {days.map((d) => { const key = iso(d), inMonth = d.getMonth() === month.getMonth(); return (
              <div key={key} onClick={() => setEdit({ title: '', kind: 'post', status: 'idea', planned_for: key, notes: '', link: '' })} className={`min-h-[96px] cursor-pointer p-1.5 ${inMonth ? 'bg-paper' : 'bg-paper/50 text-ink-300'} hover:bg-ink-50`}>
                <p className={`mb-1 text-[11px] ${key === today ? 'inline-block bg-ink-900 px-1.5 text-paper' : ''}`}>{d.getDate()}</p>
                {items.filter((i) => i.planned_for === key).map((i) => <button key={i.id} onClick={(e) => { e.stopPropagation(); setEdit(i) }} className={`mb-1 block w-full truncate px-1.5 py-0.5 text-start text-[11px] ${STATUS[i.status]}`} title={`${i.kind}: ${i.title}`}>{i.title}</button>)}
                {auto.filter((a) => a.date === key).map((a, k) => <Link key={k} href={a.href} onClick={(e) => e.stopPropagation()} className="mb-1 block truncate border border-dashed border-ink-300 px-1.5 py-0.5 text-[11px] text-ink-700" title={`${a.kind}: ${a.title}`}>{a.title}</Link>)}
              </div>) })}
          </div>
          <aside>
            <div className="flex items-center justify-between"><h2 className="text-xs font-medium uppercase tracking-[0.08em] text-ink-900">Ideas (no date yet)</h2><button onClick={() => setEdit({ title: '', kind: 'post', status: 'idea', planned_for: null, notes: '', link: '' })} className="text-xs font-medium uppercase tracking-[0.08em] text-ink-900">+ Idea</button></div>
            <ul className="mt-2 space-y-1">{ideas.length === 0 && <li className="text-xs text-ink-500">No undated ideas.</li>}{ideas.map((i) => <li key={i.id}><button onClick={() => setEdit(i)} className="block w-full border border-ink-100 bg-paper-raised px-2 py-1.5 text-start text-sm text-ink-900 hover:border-ink-900">{i.title} <span className="text-xs text-ink-500">&middot; {i.kind}</span></button></li>)}</ul>
          </aside>
        </div>
        {edit && (
          <div role="dialog" aria-modal="true" aria-label="Plan an item" className="fixed inset-0 z-50 grid place-items-center bg-black/50 p-4" onClick={() => setEdit(null)}>
            <div onClick={(e) => e.stopPropagation()} className="w-full max-w-md space-y-3 border border-ink-900 bg-paper p-5">
              <input aria-label="Title" autoFocus value={edit.title} onChange={(e) => setEdit({ ...edit, title: e.target.value })} placeholder="e.g. Reel: 3 Python tips" className={field} />
              <div className="grid grid-cols-3 gap-2">
                <select aria-label="Type" value={edit.kind} onChange={(e) => setEdit({ ...edit, kind: e.target.value })} className={field}>{KINDS.map((k) => <option key={k}>{k}</option>)}</select>
                <select aria-label="Status" value={edit.status} onChange={(e) => setEdit({ ...edit, status: e.target.value as Item['status'] })} className={field}>{Object.keys(STATUS).map((s) => <option key={s}>{s}</option>)}</select>
                <input aria-label="Date" type="date" value={edit.planned_for || ''} onChange={(e) => setEdit({ ...edit, planned_for: e.target.value || null })} className={field} />
              </div>
              <textarea aria-label="Notes" rows={3} value={edit.notes || ''} onChange={(e) => setEdit({ ...edit, notes: e.target.value })} placeholder="Notes, script, hook..." className={field} />
              <input aria-label="Link" value={edit.link || ''} onChange={(e) => setEdit({ ...edit, link: e.target.value })} placeholder="Link once it's live (optional)" className={field} />
              <div className="flex justify-between">
                <div className="flex gap-2"><button onClick={save} className="bg-ink-900 px-4 py-2 text-xs font-medium uppercase tracking-[0.08em] text-paper">Save</button><button onClick={() => setEdit(null)} className="px-3 text-xs uppercase tracking-[0.08em] text-ink-500">Cancel</button></div>
                {edit.id && <button onClick={async () => { if (confirm('Delete this item?')) { await adminApi.remove('content_items', edit.id!); setEdit(null); load() } }} className="text-xs uppercase tracking-[0.08em] text-ink-500 hover:text-error">Delete</button>}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
