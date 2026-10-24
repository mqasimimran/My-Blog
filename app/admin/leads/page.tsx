'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import AdminNav from '@/app/admin/AdminNav'
import { adminApi } from '@/lib/adminApi'

type Lead = { id: string; name: string; email: string; subject: string | null; message: string; created_at: string; stage: string; notes: string | null; follow_up: string | null }
const STAGES: [string, string][] = [['new', 'New'], ['contacted', 'Contacted'], ['proposal', 'Proposal sent'], ['won', 'Won'], ['lost', 'Lost']]
const today = () => new Date().toISOString().slice(0, 10)

// Admin -> Leads: every contact-form message as a lead you move through stages, with notes and a
// follow-up date so nothing falls through the cracks. Messages stay in Admin -> Messages too.
export default function LeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [open, setOpen] = useState<string | null>(null)
  const [adding, setAdding] = useState(false)
  const [form, setForm] = useState({ name: '', email: '', message: '' })

  const load = async () => {
    try { setLeads(((await adminApi.list('messages', { orderBy: 'created_at', ascending: false })) as Lead[]) || []) }
    catch { setError('Could not load leads. Has the latest SQL update been run?') }
    setLoading(false)
  }
  useEffect(() => { load() }, [])
  const save = async (id: string, patch: Partial<Lead>) => {
    setLeads((ls) => ls.map((l) => (l.id === id ? { ...l, ...patch } : l)))
    try { await adminApi.update('messages', id, patch) } catch { setError('Could not save. Has the latest SQL update been run?') }
  }
  async function addLead(e: React.FormEvent) {
    e.preventDefault()
    if (!form.name.trim()) return
    await adminApi.insert('messages', { name: form.name.trim(), email: form.email.trim(), subject: 'Added by hand', message: form.message.trim() || '(added by hand)', is_read: true, stage: 'new' })
    setForm({ name: '', email: '', message: '' }); setAdding(false); load()
  }
  const due = leads.filter((l) => l.follow_up && l.follow_up <= today() && !['won', 'lost'].includes(l.stage))

  return (
    <div className="flex min-h-screen">
      <AdminNav />
      <main className="flex-1 px-6 py-10 md:px-10">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-4xl text-ink-900">Leads</h1>
            <p className="mt-2 text-sm text-ink-500">Every enquiry from your contact form. Move it along as you talk, add notes, and set a follow-up date.</p>
          </div>
          <button onClick={() => setAdding((v) => !v)} className="bg-ink-900 px-5 py-3 text-xs font-medium uppercase tracking-[0.08em] text-paper hover:bg-accent-600">+ Add a lead</button>
        </div>
        {error && <p role="alert" className="mt-4 text-sm text-error">{error}</p>}
        {due.length > 0 && <p className="mt-6 border-s-2 border-warning bg-ink-50 p-4 text-sm text-ink-900"><strong>{due.length} follow-up{due.length > 1 ? 's' : ''} due:</strong> {due.map((l) => l.name).join(', ')}</p>}
        {adding && (
          <form onSubmit={addLead} className="mt-6 grid gap-3 border border-ink-100 bg-paper-raised p-5 md:grid-cols-4">
            <input aria-label="Name" placeholder="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="border border-ink-300 px-3 py-2.5 text-sm" />
            <input aria-label="Email" placeholder="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="border border-ink-300 px-3 py-2.5 text-sm" />
            <input aria-label="What they need" placeholder="What they need" value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} className="border border-ink-300 px-3 py-2.5 text-sm" />
            <button type="submit" className="bg-ink-900 px-4 py-2.5 text-xs font-medium uppercase tracking-[0.08em] text-paper">Save lead</button>
          </form>
        )}
        {loading ? <p className="mt-8 text-sm text-ink-500">Loading...</p> : (
          <div className="mt-8 grid gap-4 overflow-x-auto lg:grid-cols-5">
            {STAGES.map(([key, label]) => {
              const col = leads.filter((l) => (l.stage || 'new') === key)
              return (
                <section key={key} className="min-w-[220px] border border-ink-100 bg-paper-raised" aria-label={label}>
                  <h2 className="flex justify-between border-b border-ink-100 px-4 py-3 text-xs font-medium uppercase tracking-[0.08em] text-ink-900"><span>{label}</span><span className="text-ink-500">{col.length}</span></h2>
                  <ul className="space-y-2 p-2">
                    {col.map((l) => {
                      const overdue = l.follow_up && l.follow_up <= today() && !['won', 'lost'].includes(l.stage)
                      return (
                        <li key={l.id} className="border border-ink-100 bg-paper p-3 text-sm">
                          <button className="w-full text-left" onClick={() => setOpen(open === l.id ? null : l.id)} aria-expanded={open === l.id}>
                            <p className="font-medium text-ink-900">{l.name}</p>
                            <p className="truncate text-xs text-ink-500">{l.subject || l.message}</p>
                            {l.follow_up && <p className={`mt-1 text-xs ${overdue ? 'font-medium text-warning' : 'text-ink-500'}`}>Follow up {l.follow_up}</p>}
                          </button>
                          {open === l.id && (
                            <div className="mt-3 space-y-3 border-t border-ink-100 pt-3">
                              <p className="whitespace-pre-line text-xs text-ink-700">{l.message}</p>
                              {l.email && <a href={`mailto:${l.email}`} className="block text-xs text-accent-600 underline">{l.email}</a>}
                              <label className="block text-[11px] uppercase tracking-[0.08em] text-ink-500">Stage
                                <select value={l.stage || 'new'} onChange={(e) => save(l.id, { stage: e.target.value })} className="mt-1 block w-full border border-ink-300 bg-paper px-2 py-1.5 text-sm normal-case tracking-normal">
                                  {STAGES.map(([k, lab]) => <option key={k} value={k}>{lab}</option>)}
                                </select>
                              </label>
                              <label className="block text-[11px] uppercase tracking-[0.08em] text-ink-500">Follow up on
                                <input type="date" value={l.follow_up || ''} onChange={(e) => save(l.id, { follow_up: e.target.value || null })} className="mt-1 block w-full border border-ink-300 bg-paper px-2 py-1.5 text-sm" />
                              </label>
                              <label className="block text-[11px] uppercase tracking-[0.08em] text-ink-500">Notes
                                <textarea rows={3} defaultValue={l.notes || ''} onBlur={(e) => e.target.value !== (l.notes || '') && save(l.id, { notes: e.target.value })} className="mt-1 block w-full border border-ink-300 bg-paper px-2 py-1.5 text-sm normal-case tracking-normal" />
                              </label>
                              <Link href={`/admin/proposals?lead=${l.id}`} className="block bg-ink-900 px-3 py-2 text-center text-xs font-medium uppercase tracking-[0.08em] text-paper hover:bg-accent-600">Write a proposal</Link>
                            </div>
                          )}
                        </li>
                      )
                    })}
                  </ul>
                </section>
              )
            })}
          </div>
        )}
      </main>
    </div>
  )
}
