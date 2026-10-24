'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { CheckCircle } from '@phosphor-icons/react'
import { useLocale } from '@/app/components/LocaleProvider'

// "Request this package": a short brief that arrives in Admin -> Leads (through the contact form API,
// so it gets the same spam protection and email notification).
export default function ServiceRequestForm({ serviceName, packages }: { serviceName: string; packages: string[] }) {
  const { tx } = useLocale()
  const params = useSearchParams()
  const [f, setF] = useState({ name: '', email: '', pkg: packages[0] || '', details: '', budget: '', deadline: '', website: '' })
  const [state, setState] = useState<'idle' | 'sending' | 'done' | 'error'>('idle')
  useEffect(() => { const p = params.get('package'); if (p && packages.includes(p)) setF((x) => ({ ...x, pkg: p })) }, [params, packages])
  const field = 'w-full border border-ink-500 bg-paper px-4 text-base text-ink-900 outline-none focus:border-accent-600'

  async function submit(e: React.FormEvent) {
    e.preventDefault(); setState('sending')
    const message = [`Package: ${serviceName}${f.pkg ? ` (${f.pkg})` : ''}`, `Budget: ${f.budget || 'not given'}`, `Deadline: ${f.deadline || 'not given'}`, '', f.details].join('\n')
    try {
      const res = await fetch('/api/contact', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: f.name, email: f.email, subject: `Package request: ${serviceName}${f.pkg ? ` - ${f.pkg}` : ''}`, message, website: f.website }) })
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
