'use client'

import { useState } from 'react'
import { DownloadSimple } from '@phosphor-icons/react'
import { useLocale } from '@/app/components/LocaleProvider'
import { siteConfig } from '@/site.config'

// "Free download for an email": joins the newsletter, then shows the download straight away.
// Set it up in site.config.ts -> leadMagnet (hidden while fileUrl is empty).
export default function LeadMagnet() {
  const { tx } = useLocale()
  const lm = siteConfig.leadMagnet
  const [email, setEmail] = useState('')
  const [state, setState] = useState<'idle' | 'sending' | 'done' | 'error'>('idle')
  if (!lm.fileUrl) return null

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setState('sending')
    try {
      const res = await fetch('/api/newsletter/subscribe', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email }) })
      setState(res.ok || res.status === 409 ? 'done' : 'error')
    } catch { setState('error') }
  }

  return (
    <section className="mx-auto mt-16 max-w-3xl border border-ink-900 bg-paper-raised p-6 md:p-10" aria-labelledby="lm-heading">
      <p className="type-meta">{tx('Free download')}</p>
      <h2 id="lm-heading" className="mt-2 text-2xl font-medium tracking-tight text-ink-900">{lm.title}</h2>
      <p className="mt-2 text-ink-700">{lm.description}</p>
      {state === 'done' ? (
        <a href={lm.fileUrl} target="_blank" rel="noopener noreferrer" className="mt-6 inline-flex h-12 items-center gap-2 bg-ink-900 px-6 text-sm font-medium text-paper hover:bg-accent-600 hover:text-on-accent">
          <DownloadSimple size={18} aria-hidden /> {tx('Download now')}
        </a>
      ) : (
        <form onSubmit={submit} className="mt-6 flex flex-col gap-3 sm:flex-row">
          <label htmlFor="lm-email" className="sr-only">{tx('Email address')}</label>
          <input id="lm-email" type="email" required autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@email.com" className="h-12 flex-1 border border-ink-500 bg-paper px-4 text-base outline-none focus:border-accent-600" />
          <button type="submit" disabled={state === 'sending'} className="h-12 bg-ink-900 px-6 text-sm font-medium text-paper hover:bg-accent-600 hover:text-on-accent disabled:opacity-60">{state === 'sending' ? tx('Sending...') : tx('Get the download')}</button>
        </form>
      )}
      {state === 'error' && <p role="alert" className="mt-3 text-sm text-error">{tx('Something went wrong. Try again in a moment.')}</p>}
    </section>
  )
}
