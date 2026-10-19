'use client'

import { useEffect, useState } from 'react'
import AdminNav from '@/app/admin/AdminNav'
import { adminApi } from '@/lib/adminApi'
import { discountLabel, type DiscountKind } from '@/lib/discount'

type Code = { id: string; code: string; kind: DiscountKind; value: number; active: boolean; expires_at: string | null; max_uses: number | null; used_count: number }

const field = 'w-full border border-ink-300 bg-paper-raised px-3 py-2.5 text-sm text-ink-900 outline-none focus:border-accent-600'
const label = 'mb-1.5 block text-[11px] font-medium uppercase tracking-[0.08em] text-ink-500'

export default function DiscountCodesPage() {
  const [codes, setCodes] = useState<Code[]>([])
  const [loading, setLoading] = useState(true)
  const [form, setForm] = useState({ code: '', kind: 'percent' as DiscountKind, value: '', maxUses: '', expires: '' })
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  const load = async () => {
    try { setCodes(((await adminApi.list('discount_codes', { orderBy: 'created_at', ascending: false })) as Code[]) || []) }
    catch { setError('Could not load codes. Has the latest SQL update been run?') }
    setLoading(false)
  }
  useEffect(() => { load() }, [])

  async function create(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    const code = form.code.trim().toUpperCase()
    const value = Number(form.value)
    if (!/^[A-Z0-9_-]{3,30}$/.test(code)) return setError('Codes are 3 to 30 letters, numbers, - or _.')
    if (!(value > 0) || (form.kind === 'percent' && value > 100)) return setError(form.kind === 'percent' ? 'Enter a percentage from 1 to 100.' : 'Enter an amount above 0.')
    setSaving(true)
    try {
      await adminApi.insert('discount_codes', {
        code, kind: form.kind, value,
        max_uses: form.maxUses ? Math.max(1, Math.floor(Number(form.maxUses))) : null,
        expires_at: form.expires ? new Date(form.expires + 'T23:59:59').toISOString() : null,
      })
      setForm({ code: '', kind: 'percent', value: '', maxUses: '', expires: '' })
      await load()
    } catch (err: any) {
      setError(/duplicate|unique/i.test(err?.message || '') ? 'That code already exists.' : 'Could not create the code.')
    }
    setSaving(false)
  }

  const toggle = async (c: Code) => { await adminApi.update('discount_codes', c.id, { active: !c.active }); load() }
  const remove = async (c: Code) => { if (confirm(`Delete ${c.code}? Orders that used it keep their record.`)) { await adminApi.remove('discount_codes', c.id); load() } }

  return (
    <div className="flex min-h-screen">
      <AdminNav />
      <main className="flex-1 px-6 py-10 md:px-12">
        <h1 className="text-4xl text-ink-900">Discount Codes</h1>
        <p className="mt-2 text-sm text-ink-500">Buyers enter a code at checkout. The discount is checked and counted on the server when the order is placed.</p>

        <form onSubmit={create} className="mt-8 grid gap-4 border border-ink-100 bg-paper-raised p-6 md:grid-cols-6 md:items-end">
          <div className="md:col-span-2"><label htmlFor="d-code" className={label}>Code</label><input id="d-code" value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} placeholder="WELCOME10" className={`${field} font-mono uppercase`} /></div>
          <div><label htmlFor="d-kind" className={label}>Type</label><select id="d-kind" value={form.kind} onChange={(e) => setForm({ ...form, kind: e.target.value as DiscountKind })} className={field}><option value="percent">% off</option><option value="amount">$ off</option></select></div>
          <div><label htmlFor="d-value" className={label}>{form.kind === 'percent' ? 'Percent' : 'Amount ($)'}</label><input id="d-value" type="number" min="0" step="any" value={form.value} onChange={(e) => setForm({ ...form, value: e.target.value })} className={field} /></div>
          <div><label htmlFor="d-max" className={label}>Max uses</label><input id="d-max" type="number" min="1" value={form.maxUses} onChange={(e) => setForm({ ...form, maxUses: e.target.value })} placeholder="Unlimited" className={field} /></div>
          <div><label htmlFor="d-exp" className={label}>Expires</label><input id="d-exp" type="date" value={form.expires} onChange={(e) => setForm({ ...form, expires: e.target.value })} className={field} /></div>
          <div className="md:col-span-6 flex items-center gap-4">
            <button type="submit" disabled={saving} className="bg-ink-900 px-6 py-3 text-xs font-medium uppercase tracking-[0.08em] text-paper hover:bg-accent-600 disabled:opacity-60">{saving ? 'Creating...' : 'Create code'}</button>
            {error && <p role="alert" className="text-sm text-error">{error}</p>}
          </div>
        </form>

        <div className="mt-10 overflow-x-auto border border-ink-100 bg-paper-raised">
          <table className="w-full text-left text-sm">
            <thead><tr><th className="px-4 py-3">Code</th><th className="px-4 py-3">Discount</th><th className="px-4 py-3">Used</th><th className="px-4 py-3">Expires</th><th className="px-4 py-3">Status</th><th className="px-4 py-3" /></tr></thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={6} className="px-4 py-6 text-ink-500">Loading...</td></tr>
              ) : codes.length === 0 ? (
                <tr><td colSpan={6} className="px-4 py-6 text-ink-500">No codes yet. Create one above.</td></tr>
              ) : codes.map((c) => {
                const expired = !!c.expires_at && new Date(c.expires_at) < new Date()
                const usedUp = c.max_uses != null && c.used_count >= c.max_uses
                return (
                  <tr key={c.id}>
                    <td className="px-4 py-3 font-mono text-ink-900">{c.code}</td>
                    <td className="px-4 py-3">{discountLabel(c.kind, Number(c.value))}</td>
                    <td className="px-4 py-3 font-mono tabular-nums">{c.used_count}{c.max_uses != null ? ` / ${c.max_uses}` : ''}</td>
                    <td className="px-4 py-3">{c.expires_at ? new Date(c.expires_at).toLocaleDateString() : 'Never'}</td>
                    <td className="px-4 py-3">
                      <button onClick={() => toggle(c)} className={`text-xs font-medium uppercase tracking-[0.08em] ${c.active && !expired && !usedUp ? 'text-success' : 'text-ink-500'}`}>
                        {!c.active ? 'Off' : expired ? 'Expired' : usedUp ? 'Used up' : 'Active'}
                      </button>
                    </td>
                    <td className="px-4 py-3 text-right"><button onClick={() => remove(c)} className="text-xs font-medium uppercase tracking-[0.08em] text-ink-500 hover:text-error">Delete</button></td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  )
}
