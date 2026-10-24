'use client'

import { useEffect, useState } from 'react'
import AdminNav from '@/app/admin/AdminNav'
import { adminApi } from '@/lib/adminApi'
import { invoiceTotals, money, type Invoice, type InvoiceItem } from '@/lib/invoice'
import { siteConfig } from '@/site.config'

type Draft = Omit<Invoice, 'id' | 'public_token' | 'sent_at' | 'paid_at' | 'created_at'> & { id?: string }

const field = 'w-full border border-ink-300 bg-paper-raised px-3 py-2.5 text-sm text-ink-900 outline-none focus:border-accent-600'
const label = 'mb-1.5 block text-[11px] font-medium uppercase tracking-[0.08em] text-ink-500'
const today = () => new Date().toISOString().slice(0, 10)
const inDays = (n: number) => new Date(Date.now() + n * 86400000).toISOString().slice(0, 10)
const STATUS_COLOUR: Record<string, string> = { draft: 'text-ink-500', sent: 'text-warning', paid: 'text-success', cancelled: 'text-ink-500 line-through' }

// Admin -> Invoices: create, send and track invoices for clients.
export default function InvoicesPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [loading, setLoading] = useState(true)
  const [draft, setDraft] = useState<Draft | null>(null)
  const [msg, setMsg] = useState('')
  const [busy, setBusy] = useState('')

  const load = async () => {
    try { setInvoices(((await adminApi.list('invoices', { orderBy: 'created_at', ascending: false })) as Invoice[]) || []) }
    catch { setMsg('Could not load invoices. Has the latest SQL update been run?') }
    setLoading(false)
  }
  useEffect(() => { load() }, [])

  async function startNew() {
    setMsg('')
    let number = `INV-${new Date().getFullYear()}-001`
    try { number = (await (await fetch('/api/admin/invoices/next-number')).json()).number || number } catch {}
    setDraft({ number, client_name: '', client_email: '', client_address: '', currency: 'USD', items: [{ description: '', quantity: 1, unit_price: 0 }], discount: 0, tax_percent: 0, notes: '', status: 'draft', issue_date: today(), due_date: inDays(14) })
  }
  const edit = (inv: Invoice) => { setMsg(''); setDraft({ ...inv, items: inv.items?.length ? inv.items : [{ description: '', quantity: 1, unit_price: 0 }] }) }
  const setItem = (i: number, patch: Partial<InvoiceItem>) => draft && setDraft({ ...draft, items: draft.items.map((it, k) => (k === i ? { ...it, ...patch } : it)) })

  async function save() {
    if (!draft) return
    if (!draft.client_name.trim()) return setMsg('Add the client\u2019s name.')
    const items = draft.items.filter((it) => it.description.trim()).map((it) => ({ description: it.description.trim(), quantity: Number(it.quantity) || 0, unit_price: Number(it.unit_price) || 0 }))
    if (!items.length) return setMsg('Add at least one item with a description.')
    setBusy('save')
    const row = { number: draft.number.trim(), client_name: draft.client_name.trim(), client_email: draft.client_email?.trim() || null, client_address: draft.client_address?.trim() || null,
      currency: draft.currency, items, discount: Number(draft.discount) || 0, tax_percent: Number(draft.tax_percent) || 0, notes: draft.notes?.trim() || null,
      status: draft.status, issue_date: draft.issue_date, due_date: draft.due_date || null }
    try {
      if (draft.id) await adminApi.update('invoices', draft.id, row)
      else await adminApi.insert('invoices', row)
      setDraft(null); setMsg('Saved.'); await load()
    } catch (e: any) { setMsg(/duplicate|unique/i.test(e?.message || '') ? 'That invoice number is already used.' : 'Could not save the invoice.') }
    setBusy('')
  }

  async function send(inv: Invoice) {
    if (!confirm(`Email ${inv.number} to ${inv.client_email || 'the client'}?`)) return
    setBusy(inv.id); setMsg('')
    const res = await fetch(`/api/admin/invoices/${inv.id}/send`, { method: 'POST' })
    const data = await res.json().catch(() => ({}))
    setMsg(res.ok ? `${inv.number} sent to ${inv.client_email}.` : data.error || 'Could not send.')
    setBusy(''); load()
  }
  async function setStatus(inv: Invoice, status: Invoice['status']) {
    await adminApi.update('invoices', inv.id, { status, paid_at: status === 'paid' ? new Date().toISOString() : null }); load()
  }
  async function remove(inv: Invoice) { if (confirm(`Delete ${inv.number}? This can't be undone.`)) { await adminApi.remove('invoices', inv.id); load() } }
  const copyLink = (inv: Invoice) => { navigator.clipboard.writeText(`${siteConfig.url}/invoice/${inv.public_token}`); setMsg(`Link to ${inv.number} copied.`) }

  const totals = draft ? invoiceTotals(draft) : null
  return (
    <div className="flex min-h-screen">
      <AdminNav />
      <main className="flex-1 px-6 py-10 md:px-12">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-4xl text-ink-900">Invoices</h1>
            <p className="mt-2 text-sm text-ink-500">Create an invoice, email it as a PDF, and mark it paid. Clients get a private link with your payment details.</p>
          </div>
          {!draft && <button onClick={startNew} className="bg-ink-900 px-6 py-3 text-xs font-medium uppercase tracking-[0.08em] text-paper hover:bg-accent-600">+ New invoice</button>}
        </div>
        {msg && <p role="status" className="mt-6 text-sm text-ink-700">{msg}</p>}

        {draft && totals && (
          <section className="mt-8 border border-ink-100 bg-paper-raised p-6">
            <div className="grid gap-4 md:grid-cols-4">
              <div><label htmlFor="i-num" className={label}>Invoice number</label><input id="i-num" value={draft.number} onChange={(e) => setDraft({ ...draft, number: e.target.value })} className={`${field} font-mono`} /></div>
              <div><label htmlFor="i-cur" className={label}>Currency</label><select id="i-cur" value={draft.currency} onChange={(e) => setDraft({ ...draft, currency: e.target.value as 'USD' | 'PKR' })} className={field}><option value="USD">USD ($)</option><option value="PKR">PKR (Rs)</option></select></div>
              <div><label htmlFor="i-iss" className={label}>Issue date</label><input id="i-iss" type="date" value={draft.issue_date} onChange={(e) => setDraft({ ...draft, issue_date: e.target.value })} className={field} /></div>
              <div><label htmlFor="i-due" className={label}>Due date</label><input id="i-due" type="date" value={draft.due_date || ''} onChange={(e) => setDraft({ ...draft, due_date: e.target.value })} className={field} /></div>
              <div className="md:col-span-2"><label htmlFor="i-cn" className={label}>Client name</label><input id="i-cn" value={draft.client_name} onChange={(e) => setDraft({ ...draft, client_name: e.target.value })} className={field} /></div>
              <div className="md:col-span-2"><label htmlFor="i-ce" className={label}>Client email</label><input id="i-ce" type="email" value={draft.client_email || ''} onChange={(e) => setDraft({ ...draft, client_email: e.target.value })} className={field} /></div>
              <div className="md:col-span-4"><label htmlFor="i-ca" className={label}>Client address (optional)</label><textarea id="i-ca" rows={2} value={draft.client_address || ''} onChange={(e) => setDraft({ ...draft, client_address: e.target.value })} className={`${field} resize-y`} /></div>
            </div>

            <p className={`${label} mt-8`}>Items</p>
            <div className="space-y-2">
              {draft.items.map((it, i) => (
                <div key={i} className="grid grid-cols-12 items-center gap-2">
                  <input aria-label={`Item ${i + 1} description`} placeholder="What you did, e.g. Logo design" value={it.description} onChange={(e) => setItem(i, { description: e.target.value })} className={`${field} col-span-12 md:col-span-6`} />
                  <input aria-label={`Item ${i + 1} quantity`} type="number" min="0" step="any" value={it.quantity} onChange={(e) => setItem(i, { quantity: e.target.value as unknown as number })} className={`${field} col-span-3 md:col-span-1`} />
                  <input aria-label={`Item ${i + 1} unit price`} type="number" min="0" step="any" value={it.unit_price} onChange={(e) => setItem(i, { unit_price: e.target.value as unknown as number })} className={`${field} col-span-4 md:col-span-2`} />
                  <span className="col-span-4 text-right font-mono text-sm tabular-nums text-ink-700 md:col-span-2">{money((Number(it.quantity) || 0) * (Number(it.unit_price) || 0), draft.currency)}</span>
                  <button type="button" aria-label={`Remove item ${i + 1}`} onClick={() => setDraft({ ...draft, items: draft.items.filter((_, k) => k !== i) })} className="col-span-1 text-sm text-ink-500 hover:text-error">\u2715</button>
                </div>
              ))}
            </div>
            <button type="button" onClick={() => setDraft({ ...draft, items: [...draft.items, { description: '', quantity: 1, unit_price: 0 }] })} className="mt-3 text-xs font-medium uppercase tracking-[0.08em] text-ink-900 hover:text-accent-600">+ Add item</button>

            <div className="mt-8 grid gap-6 md:grid-cols-2">
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div><label htmlFor="i-dis" className={label}>Discount ({draft.currency === 'PKR' ? 'Rs' : '$'})</label><input id="i-dis" type="number" min="0" step="any" value={draft.discount} onChange={(e) => setDraft({ ...draft, discount: e.target.value as unknown as number })} className={field} /></div>
                  <div><label htmlFor="i-tax" className={label}>Tax (%)</label><input id="i-tax" type="number" min="0" step="any" value={draft.tax_percent} onChange={(e) => setDraft({ ...draft, tax_percent: e.target.value as unknown as number })} className={field} /></div>
                </div>
                <div><label htmlFor="i-notes" className={label}>Notes (optional)</label><textarea id="i-notes" rows={3} placeholder="e.g. Thanks for your business! Payment within 14 days." value={draft.notes || ''} onChange={(e) => setDraft({ ...draft, notes: e.target.value })} className={`${field} resize-y`} /></div>
              </div>
              <div className="self-end space-y-2 text-sm">
                <div className="flex justify-between text-ink-500"><span>Subtotal</span><span className="font-mono tabular-nums">{money(totals.subtotal, draft.currency)}</span></div>
                {totals.discount > 0 && <div className="flex justify-between text-ink-500"><span>Discount</span><span className="font-mono tabular-nums">-{money(totals.discount, draft.currency)}</span></div>}
                {totals.tax > 0 && <div className="flex justify-between text-ink-500"><span>Tax</span><span className="font-mono tabular-nums">{money(totals.tax, draft.currency)}</span></div>}
                <div className="flex justify-between border-t border-ink-900 pt-2 text-lg font-medium text-ink-900"><span>Total</span><span className="font-mono tabular-nums">{money(totals.total, draft.currency)}</span></div>
              </div>
            </div>
            <div className="mt-8 flex gap-4">
              <button onClick={save} disabled={busy === 'save'} className="bg-ink-900 px-6 py-3 text-xs font-medium uppercase tracking-[0.08em] text-paper hover:bg-accent-600 disabled:opacity-60">{busy === 'save' ? 'Saving...' : 'Save invoice'}</button>
              <button onClick={() => setDraft(null)} className="px-4 py-3 text-xs font-medium uppercase tracking-[0.08em] text-ink-500 hover:text-ink-900">Cancel</button>
            </div>
          </section>
        )}

        <div className="mt-10 overflow-x-auto border border-ink-100 bg-paper-raised">
          <table className="w-full text-left text-sm">
            <thead><tr><th className="px-4 py-3">Number</th><th className="px-4 py-3">Client</th><th className="px-4 py-3 text-right">Total</th><th className="px-4 py-3">Due</th><th className="px-4 py-3">Status</th><th className="px-4 py-3" /></tr></thead>
            <tbody>
              {loading ? <tr><td colSpan={6} className="px-4 py-6 text-ink-500">Loading...</td></tr>
                : invoices.length === 0 ? <tr><td colSpan={6} className="px-4 py-6 text-ink-500">No invoices yet. Create your first one above.</td></tr>
                : invoices.map((inv) => (
                  <tr key={inv.id}>
                    <td className="px-4 py-3 font-mono text-ink-900">{inv.number}</td>
                    <td className="px-4 py-3">{inv.client_name}</td>
                    <td className="px-4 py-3 text-right font-mono tabular-nums">{money(invoiceTotals(inv).total, inv.currency)}</td>
                    <td className="px-4 py-3">{inv.due_date || '\u2014'}</td>
                    <td className="px-4 py-3">
                      <select aria-label={`Status of ${inv.number}`} value={inv.status} onChange={(e) => setStatus(inv, e.target.value as Invoice['status'])} className={`bg-transparent text-xs font-medium uppercase tracking-[0.08em] outline-none ${STATUS_COLOUR[inv.status]}`}>
                        <option value="draft">Draft</option><option value="sent">Sent</option><option value="paid">Paid</option><option value="cancelled">Cancelled</option>
                      </select>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-right text-xs font-medium uppercase tracking-[0.08em]">
                      <button onClick={() => edit(inv)} className="ml-3 text-ink-700 hover:text-ink-900">Edit</button>
                      <a href={`/api/admin/invoices/${inv.id}/pdf`} target="_blank" rel="noopener noreferrer" className="ml-3 text-ink-700 hover:text-ink-900">PDF</a>
                      <button onClick={() => send(inv)} disabled={busy === inv.id} className="ml-3 text-ink-700 hover:text-ink-900 disabled:opacity-50">{busy === inv.id ? 'Sending...' : 'Send'}</button>
                      <button onClick={() => copyLink(inv)} className="ml-3 text-ink-700 hover:text-ink-900">Link</button>
                      <button onClick={() => remove(inv)} className="ml-3 text-ink-500 hover:text-error">Delete</button>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  )
}
