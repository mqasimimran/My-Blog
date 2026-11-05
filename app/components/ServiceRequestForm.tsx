'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { CheckCircle } from '@phosphor-icons/react'
import { useLocale } from '@/app/components/LocaleProvider'
import { estimate, parsePrice, type Selection, type ServiceOption } from '@/lib/serviceOptions'

// "Request this package": a short brief that arrives in Admin -> Leads (through the contact form API,
// so it gets the same spam protection and email notification).
type Pkg = { tier: string; price: string | null }
export default function ServiceRequestForm({ serviceName, packages, serviceId, packageList = [], options = [] }: { serviceName: string; packages: string[]; serviceId?: string; packageList?: Pkg[]; options?: ServiceOption[] }) {
  const [sel, setSel] = useState<Selection>({})
  const [usdToPkr, setUsdToPkr] = useState(0)
  useEffect(() => { fetch('/api/exchange-rate').then((r) => r.json()).then((d) => setUsdToPkr(Number(d.usdToPkr) || 0)).catch(() => {}) }, [])
  const { tx } = useLocale()
  const params = useSearchParams()
  const [f, setF] = useState({ name: '', email: '', pkg: packages[0] || '', details: '', budget: '', deadline: '', website: '' })
  const [state, setState] = useState<'idle' | 'sending' | 'done' | 'error'>('idle')
  const requested = params.get('package')
  const [previousPackage, setPreviousPackage] = useState<string | null>(null)
  if (requested !== previousPackage) {
    setPreviousPackage(requested)
    if (requested && packages.includes(requested)) setF({ ...f, pkg: requested })
  }
  const field = 'w-full border border-ink-500 bg-paper px-4 text-base text-ink-900 outline-none focus:border-accent-600'
  const pkg = packageList.find((p) => p.tier === f.pkg)
  const est = estimate(parsePrice(pkg?.price), `${serviceName}: ${f.pkg} package`, options, sel)
  const fmt = (n: number) => `$${n.toLocaleString('en-US', { maximumFractionDigits: 2 })}`

  async function submit(e: React.FormEvent) {
    e.preventDefault(); setState('sending')
    const chosen = est.items.map((i) => `- ${i.description}${i.quantity > 1 ? ` x${i.quantity}` : ''}: ${fmt(i.quantity * i.unit_price)}`)
    const message = [`Package: ${serviceName}${f.pkg ? ` (${f.pkg})` : ''}`, ...(chosen.length ? ['Chosen options:', ...chosen, `Estimate: ${fmt(est.total)}`] : []), ...est.answers, `Budget: ${f.budget || 'not given'}`, `Deadline: ${f.deadline || 'not given'}`, '', f.details].join('\n')
    try {
      const res = await fetch('/api/contact', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: f.name, email: f.email, subject: `Package request: ${serviceName}${f.pkg ? ` - ${f.pkg}` : ''}`, message, website: f.website, ...(serviceId ? { request: { serviceId, tier: f.pkg, selection: sel } } : {}) }) })
      setState(res.ok ? 'done' : 'error')
    } catch { setState('error') }
  }

  return (
    <section id="request" className="container-page mt-20 scroll-mt-28" aria-labelledby="request-heading">
      <div className="max-w-3xl border border-ink-900 bg-paper-raised p-6 md:p-10">
        <h2 id="request-heading" className="type-h2 text-ink-900">{tx('Request this package')}</h2>
        {state === 'done' ? (
          <p className="mt-6 flex items-start gap-3 text-lg text-ink-900"><CheckCircle size={26} weight="fill" aria-hidden className="shrink-0 text-success" />{tx('Thanks! I’ve got your brief and will reply with next steps, usually within a day.')}</p>
        ) : (
          <form onSubmit={submit} className="mt-6 space-y-5">
            <div style={{ position: 'absolute', width: 1, height: 1, overflow: 'hidden', clipPath: 'inset(50%)' }} aria-hidden="true"><input tabIndex={-1} autoComplete="off" value={f.website} onChange={(e) => setF({ ...f, website: e.target.value })} /></div>
            <div className="grid gap-5 sm:grid-cols-2">
              <div><label htmlFor="sr-name" className="mb-2 block text-sm font-medium text-ink-900">{tx('Your name')}</label><input id="sr-name" required value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} className={`h-12 ${field}`} /></div>
              <div><label htmlFor="sr-email" className="mb-2 block text-sm font-medium text-ink-900">{tx('Email')}</label><input id="sr-email" type="email" required value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} className={`h-12 ${field}`} /></div>
            </div>
            {packages.length > 0 && <div><label htmlFor="sr-pkg" className="mb-2 block text-sm font-medium text-ink-900">{tx('Package')}</label><select id="sr-pkg" value={f.pkg} onChange={(e) => setF({ ...f, pkg: e.target.value })} className={`h-12 ${field}`}>{packages.map((p) => <option key={p}>{p}</option>)}</select></div>}
            {options.length > 0 && (
              <fieldset className="space-y-4 border-t border-ink-100 pt-5">
                <legend className="text-sm font-medium text-ink-900">{tx('Customise it')}</legend>
                {options.map((o) => (
                  <div key={o.id}>
                    {o.type === 'addon' && <label className="flex items-start gap-3 text-[15px] text-ink-900"><input type="checkbox" checked={sel[o.id] === true} onChange={(e) => setSel({ ...sel, [o.id]: e.target.checked })} className="mt-1 h-4 w-4" /><span className="flex-1" dir="auto">{o.label}{o.note && <span className="block text-sm text-ink-500">{o.note}</span>}</span><span className="font-mono text-sm text-ink-700">+{fmt(o.price)}</span></label>}
                    {o.type === 'quantity' && <label className="block text-[15px] text-ink-900"><span className="flex justify-between" dir="auto"><span>{o.label}</span><span className="font-mono text-sm text-ink-700">{fmt(o.unitPrice)} {tx('each extra')}</span></span>
                      <span className="mt-2 flex items-center gap-3"><input type="range" min={o.min} max={o.max} value={Number(sel[o.id] ?? o.default)} onChange={(e) => setSel({ ...sel, [o.id]: Number(e.target.value) })} className="flex-1" aria-label={o.label} /><span className="w-16 text-end font-mono">{Number(sel[o.id] ?? o.default)}{o.unit ? ` ${o.unit}` : ''}</span></span></label>}
                    {o.type === 'choice' && <div><p className="text-[15px] text-ink-900" dir="auto">{o.label}</p><div role="radiogroup" aria-label={o.label} className="mt-2 flex flex-wrap gap-2">{o.choices.map((c, k) => (
                      <button key={k} type="button" role="radio" aria-checked={Number(sel[o.id] ?? 0) === k} onClick={() => setSel({ ...sel, [o.id]: k })} className={`border px-3 py-2 text-sm ${Number(sel[o.id] ?? 0) === k ? 'border-ink-900 bg-ink-900 text-paper' : 'border-ink-100 text-ink-700 hover:border-ink-500'}`}>{c.label}{c.price ? ` (+${fmt(c.price)})` : c.percent ? ` (${c.percent > 0 ? '+' : ''}${c.percent}%)` : ''}</button>))}</div></div>}
                    {o.type === 'question' && <label className="block text-[15px] text-ink-900"><span dir="auto">{o.label}{o.required ? ' *' : ''}</span><input required={!!o.required} value={String(sel[o.id] ?? '')} onChange={(e) => setSel({ ...sel, [o.id]: e.target.value })} className={`mt-2 h-11 ${field}`} /></label>}
                  </div>
                ))}
              </fieldset>
            )}
            {est.total > 0 && (
              <div className="border border-ink-900 bg-paper p-4" aria-live="polite">
                <div className="flex items-baseline justify-between"><span className="text-sm font-medium text-ink-900">{tx('Estimate')}</span><span className="font-display text-3xl text-ink-900">{fmt(est.total)}</span></div>
                {usdToPkr > 0 && <p className="text-end font-mono text-sm text-ink-500">≈ Rs {Math.round(est.total * usdToPkr).toLocaleString('en-US')}</p>}
                <ul className="mt-3 space-y-1 border-t border-ink-100 pt-3 text-sm text-ink-700">{est.items.map((i, k) => <li key={k} className="flex justify-between gap-3"><span dir="auto">{i.description}{i.quantity > 1 ? ` \u00d7 ${i.quantity}` : ''}</span><span className="font-mono">{fmt(i.quantity * i.unit_price)}</span></li>)}</ul>
                <p className="mt-3 text-xs text-ink-500">{tx('An estimate. The final price is confirmed in your proposal.')}</p>
              </div>
            )}
            <div><label htmlFor="sr-details" className="mb-2 block text-sm font-medium text-ink-900">{tx('Tell me about your project')}</label><textarea id="sr-details" required rows={5} minLength={10} value={f.details} onChange={(e) => setF({ ...f, details: e.target.value })} className={`resize-y py-3 ${field}`} /></div>
            <div className="grid gap-5 sm:grid-cols-2">
              <div><label htmlFor="sr-budget" className="mb-2 block text-sm font-medium text-ink-900">{tx('Budget (optional)')}</label><input id="sr-budget" value={f.budget} onChange={(e) => setF({ ...f, budget: e.target.value })} className={`h-12 ${field}`} /></div>
              <div><label htmlFor="sr-deadline" className="mb-2 block text-sm font-medium text-ink-900">{tx('Deadline (optional)')}</label><input id="sr-deadline" value={f.deadline} onChange={(e) => setF({ ...f, deadline: e.target.value })} className={`h-12 ${field}`} /></div>
            </div>
            <button type="submit" disabled={state === 'sending'} className="h-12 bg-ink-900 px-6 text-sm font-medium text-paper hover:bg-accent-600 hover:text-on-accent disabled:opacity-60">{state === 'sending' ? tx('Sending...') : tx('Send request')}</button>
            {state === 'error' && <p role="alert" className="text-sm text-error">{tx('Something went wrong. Try again in a moment.')}</p>}
          </form>
        )}
      </div>
    </section>
  )
}
