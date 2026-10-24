'use client'

import { Suspense, useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import AdminNav from '@/app/admin/AdminNav'
import { adminApi } from '@/lib/adminApi'
import { invoiceTotals, money, type InvoiceItem } from '@/lib/invoice'
import { DEFAULT_TERMS, type Proposal } from '@/lib/proposal'
import { siteConfig } from '@/site.config'

type Draft = Omit<Proposal, 'id' | 'public_token' | 'sent_at' | 'accepted_at' | 'signed_name' | 'decline_reason' | 'invoice_id' | 'created_at'> & { id?: string }
const field = 'w-full border border-ink-300 bg-paper-raised px-3 py-2.5 text-sm text-ink-900 outline-none focus:border-accent-600'
const label = 'mb-1.5 block text-[11px] font-medium uppercase tracking-[0.08em] text-ink-500'
const COLOUR: Record<string, string> = { draft: 'text-ink-500', sent: 'text-warning', accepted: 'text-success', declined: 'text-ink-500 line-through' }

function ProposalsAdmin() {
  const params = useSearchParams()
  const [list, setList] = useState<Proposal[]>([])
  const [draft, setDraft] = useState<Draft | null>(null)
  const [msg, setMsg] = useState('')
  const [busy, setBusy] = useState('')
  const load = async () => { try { setList(((await adminApi.list('proposals', { orderBy: 'created_at', ascending: false })) as Proposal[]) || []) } catch { setMsg('Could not load proposals. Has the latest SQL update been run?') } }
  useEffect(() => { load() }, [])

  async function startNew(leadId?: string) {
    setMsg('')
    let number = `PRO-${new Date().getFullYear()}-001`
    try { number = (await (await fetch('/api/admin/proposals/next-number')).json()).number || number } catch {}
    let client_name = '', client_email = '', summary = ''
    if (leadId) { try { const l: any = await adminApi.get('messages', leadId); client_name = l?.name || ''; client_email = l?.email || ''; summary = '' } catch {} }
    setDraft({ number, client_name, client_email, title: '', summary, scope: '', timeline: '', currency: 'USD', items: [{ description: '', quantity: 1, unit_price: 0 }], discount: 0, tax_percent: 0,
      terms: DEFAULT_TERMS, valid_until: new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 10), status: 'draft', lead_id: leadId || null })
  }
  useEffect(() => { const lead = params.get('lead'); if (lead) startNew(lead) }, [params])
  const setItem = (i: number, patch: Partial<InvoiceItem>) => draft && setDraft({ ...draft, items: draft.items.map((it, k) => (k === i ? { ...it, ...patch } : it)) })

  async function save() {
    if (!draft) return
    if (!draft.client_name.trim() || !draft.title.trim()) return setMsg('Add the client\u2019s name and a title.')
    const items = draft.items.filter((it) => it.description.trim()).map((it) => ({ description: it.description.trim(), quantity: Number(it.quantity) || 0, unit_price: Number(it.unit_price) || 0 }))
    if (!items.length) return setMsg('Add at least one price item.')
    setBusy('save')
    const row = { number: draft.number.trim(), client_name: draft.client_name.trim(), client_email: draft.client_email?.trim() || null, title: draft.title.trim(), summary: draft.summary?.trim() || null,
      scope: draft.scope?.trim() || null, timeline: draft.timeline?.trim() || null, currency: draft.currency, items, discount: Number(draft.discount) || 0, tax_percent: Number(draft.tax_percent) || 0,
      terms: draft.terms?.trim() || null, valid_until: draft.valid_until || null, lead_id: draft.lead_id || null }
    try { if (draft.id) await adminApi.update('proposals', draft.id, row); else await adminApi.insert('proposals', row); setDraft(null); setMsg('Saved.'); load() }
    catch (e: any) { setMsg(/duplicate|unique/i.test(e?.message || '') ? 'That proposal number is already used.' : 'Could not save.') }
    setBusy('')
  }
  async function send(p: Proposal) {
    if (!confirm(`Email ${p.number} to ${p.client_email || 'the client'}?`)) return
    setBusy(p.id); const res = await fetch(`/api/admin/proposals/${p.id}/send`, { method: 'POST' }); const d = await res.json().catch(() => ({}))
    setMsg(res.ok ? `${p.number} sent.` : d.error || 'Could not send.'); setBusy(''); load()
  }
  async function copyLink(p: Proposal) {
    // Sharing the link yourself counts as sending it (a draft can't be opened by the client).
    if (p.status === 'draft') { await adminApi.update('proposals', p.id, { status: 'sent', sent_at: new Date().toISOString() }); if (p.lead_id) { const lead: any = await adminApi.get('messages', p.lead_id).catch(() => null); if (lead && ['new', 'contacted'].includes(lead.stage)) await adminApi.update('messages', p.lead_id, { stage: 'proposal' }) } }
    navigator.clipboard.writeText(`${siteConfig.url}/proposal/${p.public_token}`); setMsg(`Link to ${p.number} copied${p.status === 'draft' ? ' and marked as sent' : ''}.`); load()
  }
  async function remove(p: Proposal) { if (confirm(`Delete ${p.number}?`)) { await adminApi.remove('proposals', p.id); load() } }
  const totals = draft ? invoiceTotals(draft) : null

  return (
    <main className="flex-1 px-6 py-10 md:px-12">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div><h1 className="text-4xl text-ink-900">Proposals</h1><p className="mt-2 text-sm text-ink-500">Send a proposal; the client signs online and an invoice is created automatically.</p></div>
        {!draft && <button onClick={() => startNew()} className="bg-ink-900 px-6 py-3 text-xs font-medium uppercase tracking-[0.08em] text-paper hover:bg-accent-600">+ New proposal</button>}
      </div>
      {msg && <p role="status" className="mt-6 text-sm text-ink-700">{msg}</p>}
      {draft && totals && (
        <section className="mt-8 space-y-5 border border-ink-100 bg-paper-raised p-6">
          <div className="grid gap-4 md:grid-cols-4">
            <div><label htmlFor="p-num" className={label}>Number</label><input id="p-num" value={draft.number} onChange={(e) => setDraft({ ...draft, number: e.target.value })} className={`${field} font-mono`} /></div>
            <div><label htmlFor="p-cn" className={label}>Client name</label><input id="p-cn" value={draft.client_name} onChange={(e) => setDraft({ ...draft, client_name: e.target.value })} className={field} /></div>
            <div><label htmlFor="p-ce" className={label}>Client email</label><input id="p-ce" type="email" value={draft.client_email || ''} onChange={(e) => setDraft({ ...draft, client_email: e.target.value })} className={field} /></div>
            <div><label htmlFor="p-valid" className={label}>Valid until</label><input id="p-valid" type="date" value={draft.valid_until || ''} onChange={(e) => setDraft({ ...draft, valid_until: e.target.value })} className={field} /></div>
          </div>
          <div><label htmlFor="p-title" className={label}>Title</label><input id="p-title" placeholder="e.g. Brand identity for Studio Noor" value={draft.title} onChange={(e) => setDraft({ ...draft, title: e.target.value })} className={field} /></div>
          <div><label htmlFor="p-sum" className={label}>Summary</label><textarea id="p-sum" rows={3} placeholder="The goal of the project, in a few sentences." value={draft.summary || ''} onChange={(e) => setDraft({ ...draft, summary: e.target.value })} className={`${field} resize-y`} /></div>
          <div className="grid gap-4 md:grid-cols-2">
            <div><label htmlFor="p-scope" className={label}>What&rsquo;s included (one per line)</label><textarea id="p-scope" rows={5} placeholder={'Logo in three concepts\nColour palette and fonts\nBrand guidelines PDF'} value={draft.scope || ''} onChange={(e) => setDraft({ ...draft, scope: e.target.value })} className={`${field} resize-y`} /></div>
            <div><label htmlFor="p-time" className={label}>Timeline</label><textarea id="p-time" rows={5} placeholder={'Week 1: concepts\nWeek 2: revisions and final files'} value={draft.timeline || ''} onChange={(e) => setDraft({ ...draft, timeline: e.target.value })} className={`${field} resize-y`} /></div>
          </div>
          <div>
            <p className={label}>Price items ({draft.currency})</p>
            <div className="space-y-2">{draft.items.map((it, i) => (
              <div key={i} className="grid grid-cols-12 items-center gap-2">
                <input aria-label={`Item ${i + 1} description`} value={it.description} onChange={(e) => setItem(i, { description: e.target.value })} className={`${field} col-span-12 md:col-span-6`} />
                <input aria-label={`Item ${i + 1} quantity`} type="number" min="0" step="any" value={it.quantity} onChange={(e) => setItem(i, { quantity: e.target.value as unknown as number })} className={`${field} col-span-3 md:col-span-1`} />
                <input aria-label={`Item ${i + 1} unit price`} type="number" min="0" step="any" value={it.unit_price} onChange={(e) => setItem(i, { unit_price: e.target.value as unknown as number })} className={`${field} col-span-4 md:col-span-2`} />
                <span className="col-span-4 text-right font-mono text-sm md:col-span-2">{money((Number(it.quantity) || 0) * (Number(it.unit_price) || 0), draft.currency)}</span>
                <button type="button" aria-label={`Remove item ${i + 1}`} onClick={() => setDraft({ ...draft, items: draft.items.filter((_, k) => k !== i) })} className="col-span-1 text-ink-500 hover:text-error">✕</button>
              </div>))}</div>
            <button type="button" onClick={() => setDraft({ ...draft, items: [...draft.items, { description: '', quantity: 1, unit_price: 0 }] })} className="mt-2 text-xs font-medium uppercase tracking-[0.08em] text-ink-900">+ Add item</button>
            <div className="mt-4 grid grid-cols-3 gap-4 md:max-w-md">
              <div><label htmlFor="p-cur" className={label}>Currency</label><select id="p-cur" value={draft.currency} onChange={(e) => setDraft({ ...draft, currency: e.target.value as 'USD' | 'PKR' })} className={field}><option>USD</option><option>PKR</option></select></div>
              <div><label htmlFor="p-dis" className={label}>Discount</label><input id="p-dis" type="number" min="0" value={draft.discount} onChange={(e) => setDraft({ ...draft, discount: e.target.value as unknown as number })} className={field} /></div>
              <div><label htmlFor="p-tax" className={label}>Tax %</label><input id="p-tax" type="number" min="0" value={draft.tax_percent} onChange={(e) => setDraft({ ...draft, tax_percent: e.target.value as unknown as number })} className={field} /></div>
            </div>
            <p className="mt-3 text-lg font-medium text-ink-900">Total: <span className="font-mono">{money(totals.total, draft.currency)}</span></p>
          </div>
          <div><label htmlFor="p-terms" className={label}>Terms (edit for each job; for large contracts get legal advice)</label><textarea id="p-terms" rows={8} value={draft.terms || ''} onChange={(e) => setDraft({ ...draft, terms: e.target.value })} className={`${field} resize-y`} /></div>
          <div className="flex gap-4"><button onClick={save} disabled={busy === 'save'} className="bg-ink-900 px-6 py-3 text-xs font-medium uppercase tracking-[0.08em] text-paper hover:bg-accent-600">{busy === 'save' ? 'Saving...' : 'Save proposal'}</button><button onClick={() => setDraft(null)} className="px-4 py-3 text-xs uppercase tracking-[0.08em] text-ink-500">Cancel</button></div>
        </section>
      )}
      <div className="mt-10 overflow-x-auto border border-ink-100 bg-paper-raised">
        <table className="w-full text-left text-sm">
          <thead><tr><th className="px-4 py-3">Number</th><th className="px-4 py-3">Client</th><th className="px-4 py-3">Title</th><th className="px-4 py-3 text-right">Total</th><th className="px-4 py-3">Status</th><th className="px-4 py-3" /></tr></thead>
          <tbody>
            {list.length === 0 ? <tr><td colSpan={6} className="px-4 py-6 text-ink-500">No proposals yet.</td></tr> : list.map((p) => (
              <tr key={p.id}>
                <td className="px-4 py-3 font-mono">{p.number}</td><td className="px-4 py-3">{p.client_name}</td><td className="px-4 py-3">{p.title}</td>
                <td className="px-4 py-3 text-right font-mono">{money(invoiceTotals(p).total, p.currency)}</td>
                <td className={`px-4 py-3 text-xs font-medium uppercase tracking-[0.08em] ${COLOUR[p.status]}`}>{p.status}{p.status === 'accepted' && p.signed_name ? ` by ${p.signed_name}` : ''}</td>
                <td className="whitespace-nowrap px-4 py-3 text-right text-xs font-medium uppercase tracking-[0.08em]">
                  {p.status !== 'accepted' && p.status !== 'declined' && <button onClick={() => setDraft({ ...p })} className="ml-3 text-ink-700">Edit</button>}
                  {p.status !== 'draft' && <a href={`/api/proposal/${p.public_token}/pdf`} target="_blank" rel="noopener noreferrer" className="ml-3 text-ink-700">PDF</a>}
                  {p.status !== 'accepted' && p.status !== 'declined' && <button onClick={() => send(p)} disabled={busy === p.id} className="ml-3 text-ink-700">Send</button>}
                  <button onClick={() => copyLink(p)} className="ml-3 text-ink-700">Link</button>
                  {p.status === 'accepted' && <a href="/admin/invoices" className="ml-3 text-success">Invoice</a>}
                  <button onClick={() => remove(p)} className="ml-3 text-ink-500 hover:text-error">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  )
}

// Admin -> Proposals.
export default function ProposalsPage() {
  return <div className="flex min-h-screen"><AdminNav /><Suspense fallback={<main className="flex-1 p-10 text-sm text-ink-500">Loading...</main>}><ProposalsAdmin /></Suspense></div>
}
