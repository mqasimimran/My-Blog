'use client'

import type { ServiceOption } from '@/lib/serviceOptions'

const inp = 'border-b border-ink-100 bg-transparent py-1.5 text-sm text-ink-900 outline-none focus:border-ink-900'
const newId = () => Math.random().toString(36).slice(2, 9)

// Options customers can pick on this service's page (live estimate). Prices are in USD, added to the
// chosen package's price.
export default function OptionsEditor({ value, onChange }: { value: ServiceOption[]; onChange: (v: ServiceOption[]) => void }) {
  const set = (i: number, patch: Partial<ServiceOption>) => onChange(value.map((o, k) => (k === i ? ({ ...o, ...patch } as ServiceOption) : o)))
  const add = (o: ServiceOption) => onChange([...value, o])
  return (
    <div className="space-y-3 border-t border-ink-100 pt-6">
      <p className="text-[10px] font-bold tracking-widest uppercase text-ink-900">Customer options (live price estimate)</p>
      <p className="text-xs text-ink-500">Prices in USD, added to the chosen package. Shown as an estimate; the final price goes in your proposal.</p>
      {value.map((o, i) => (
        <div key={o.id} className="space-y-2 border border-ink-100 p-3">
          <div className="flex items-center gap-3"><span className="text-[10px] font-bold uppercase tracking-widest text-accent-600">{o.type}</span>
            <input aria-label="Option label" value={o.label} onChange={(e) => set(i, { label: e.target.value })} placeholder="Label shown to customers" className={`${inp} flex-1`} />
            <button type="button" aria-label="Move up" disabled={i === 0} onClick={() => { const v = [...value]; [v[i - 1], v[i]] = [v[i], v[i - 1]]; onChange(v) }} className="text-ink-500 disabled:opacity-30">↑</button>
            <button type="button" aria-label="Remove option" onClick={() => onChange(value.filter((_, k) => k !== i))} className="text-ink-500 hover:text-error">✕</button></div>
          {o.type === 'addon' && <div className="flex flex-wrap gap-3 text-xs text-ink-500"><label>Price $ <input type="number" min="0" value={o.price} onChange={(e) => set(i, { price: Number(e.target.value) })} className={`${inp} w-24`} /></label><label className="flex-1">Note <input value={o.note || ''} onChange={(e) => set(i, { note: e.target.value })} className={`${inp} w-full`} /></label></div>}
          {o.type === 'quantity' && <div className="flex flex-wrap gap-3 text-xs text-ink-500">{(['unitPrice', 'min', 'default', 'max'] as const).map((k) => <label key={k}>{k === 'unitPrice' ? 'Price per extra $' : k === 'default' ? 'Included' : k[0].toUpperCase() + k.slice(1)} <input type="number" min="0" value={o[k]} onChange={(e) => set(i, { [k]: Number(e.target.value) })} className={`${inp} w-20`} /></label>)}<label>Unit <input value={o.unit || ''} onChange={(e) => set(i, { unit: e.target.value })} placeholder="pages" className={`${inp} w-24`} /></label></div>}
          {o.type === 'choice' && <div className="space-y-2">{o.choices.map((c, k) => (
            <div key={k} className="flex flex-wrap items-center gap-3 text-xs text-ink-500"><input aria-label="Choice" value={c.label} onChange={(e) => set(i, { choices: o.choices.map((x, j) => (j === k ? { ...x, label: e.target.value } : x)) })} placeholder="e.g. Express (7 days)" className={`${inp} flex-1`} />
              <label>+$ <input type="number" value={c.price || 0} onChange={(e) => set(i, { choices: o.choices.map((x, j) => (j === k ? { ...x, price: Number(e.target.value) } : x)) })} className={`${inp} w-20`} /></label>
              <label>or % <input type="number" value={c.percent || 0} onChange={(e) => set(i, { choices: o.choices.map((x, j) => (j === k ? { ...x, percent: Number(e.target.value) } : x)) })} className={`${inp} w-16`} /></label>
              <button type="button" aria-label="Remove choice" onClick={() => set(i, { choices: o.choices.filter((_, j) => j !== k) })} className="hover:text-error">✕</button></div>))}
            <button type="button" onClick={() => set(i, { choices: [...o.choices, { label: '' }] })} className="text-xs font-medium uppercase tracking-[0.08em] text-ink-900">+ Add choice</button></div>}
          {o.type === 'question' && <label className="flex items-center gap-2 text-xs text-ink-500"><input type="checkbox" checked={!!o.required} onChange={(e) => set(i, { required: e.target.checked })} /> Required</label>}
        </div>
      ))}
      <div className="flex flex-wrap gap-2 text-xs">
        <button type="button" onClick={() => add({ id: newId(), type: 'addon', label: '', price: 0 })} className="border border-ink-100 px-3 py-1.5 hover:border-ink-900">+ Add-on</button>
        <button type="button" onClick={() => add({ id: newId(), type: 'quantity', label: '', unitPrice: 0, min: 1, default: 1, max: 10 })} className="border border-ink-100 px-3 py-1.5 hover:border-ink-900">+ Quantity</button>
        <button type="button" onClick={() => add({ id: newId(), type: 'choice', label: '', choices: [{ label: 'Standard' }, { label: 'Express', percent: 30 }] })} className="border border-ink-100 px-3 py-1.5 hover:border-ink-900">+ Choice</button>
        <button type="button" onClick={() => add({ id: newId(), type: 'question', label: '' })} className="border border-ink-100 px-3 py-1.5 hover:border-ink-900">+ Question</button>
      </div>
    </div>
  )
}
