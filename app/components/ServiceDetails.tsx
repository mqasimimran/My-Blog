'use client'

import { useState } from 'react'
import { CaretDown, Check } from '@phosphor-icons/react'
import { useLocale } from '@/app/components/LocaleProvider'

type S = { deliverables?: string | null; ideal_for?: string | null; process?: string | null; tools?: string | null; turnaround?: string | null; faq?: string | null }
const lines = (t?: string | null) => (t || '').split('\n').map((l) => l.trim().replace(/^[-*\u2022]\s*/, '')).filter(Boolean)

// Detailed sections for a service page (each appears only when filled in, in Admin -> Services).
export default function ServiceDetails({ service, part }: { service: S; part: 'intro' | 'faq' }) {
  const { tx } = useLocale()
  const [open, setOpen] = useState<number | null>(0)
  if (part === 'faq') {
    const faqs = (service.faq || '').trim().split(/\n\s*\n/).map((b) => {
      const q = b.match(/^\s*Q\s*:\s*(.+)$/im)?.[1]?.trim(), a = b.split(/^\s*A\s*:\s*/im)[1]?.trim()
      return q && a ? { q, a } : null
    }).filter(Boolean) as { q: string; a: string }[]
    if (!faqs.length) return null
    return (
      <section className="container-page mt-20" aria-labelledby="faq-heading">
        <h2 id="faq-heading" className="type-h2 text-ink-900">{tx('Questions')}</h2>
        <div className="mt-8 max-w-3xl border-t border-ink-100">
          {faqs.map((f, i) => (
            <div key={i} className="border-b border-ink-100">
              <button type="button" aria-expanded={open === i} onClick={() => setOpen(open === i ? null : i)} className="flex w-full items-center justify-between gap-4 py-5 text-start text-lg font-medium text-ink-900" dir="auto">
                {f.q}<CaretDown size={18} aria-hidden className={`shrink-0 transition-transform ${open === i ? 'rotate-180' : ''}`} />
              </button>
              {open === i && <p className="whitespace-pre-line pb-6 text-[16px] leading-relaxed text-ink-700" dir="auto">{f.a}</p>}
            </div>
          ))}
        </div>
      </section>
    )
  }
  const deliverables = lines(service.deliverables), steps = lines(service.process), tools = (service.tools || '').split(',').map((t) => t.trim()).filter(Boolean)
  if (!deliverables.length && !steps.length && !tools.length && !service.ideal_for && !service.turnaround) return null
  return (
    <section className="container-page mt-16 md:mt-20">
      <div className="grid gap-12 lg:grid-cols-12">
        {deliverables.length > 0 && (
          <div className="lg:col-span-6">
            <h2 className="type-meta">{tx('What you’ll get')}</h2>
            <ul className="mt-4 space-y-3">{deliverables.map((d) => <li key={d} className="flex gap-3 text-[17px] text-ink-900" dir="auto"><Check size={20} weight="bold" aria-hidden className="mt-0.5 shrink-0 text-accent-600" />{d}</li>)}</ul>
          </div>
        )}
        <div className="space-y-10 lg:col-span-5 lg:col-start-8">
          {service.ideal_for && <div><h2 className="type-meta">{tx('Who it’s for')}</h2><p className="mt-3 whitespace-pre-line text-[16px] leading-relaxed text-ink-700" dir="auto">{service.ideal_for}</p></div>}
          {service.turnaround && <div><h2 className="type-meta">{tx('Turnaround')}</h2><p className="mt-3 text-[16px] text-ink-900" dir="auto">{service.turnaround}</p></div>}
          {tools.length > 0 && <div><h2 className="type-meta">{tx('Tools I use')}</h2><ul className="mt-3 flex flex-wrap gap-2">{tools.map((t) => <li key={t} className="border border-ink-100 px-3 py-1.5 text-sm text-ink-700">{t}</li>)}</ul></div>}
        </div>
      </div>
      {steps.length > 0 && (
        <div className="mt-16">
          <h2 className="type-meta">{tx('How it works')}</h2>
          <ol className="mt-6 grid gap-px border border-ink-100 bg-ink-100 md:grid-cols-2 lg:grid-cols-4">
            {steps.map((st, i) => { const [title, ...rest] = st.split(':'); const detail = rest.join(':').trim(); return (
              <li key={i} className="bg-paper p-6" dir="auto">
                <span className="font-display text-4xl leading-none text-accent-600">{String(i + 1).padStart(2, '0')}</span>
                <p className="mt-4 font-medium text-ink-900">{detail ? title.trim() : st}</p>
                {detail && <p className="mt-1 text-sm text-ink-700">{detail}</p>}
              </li>) })}
          </ol>
        </div>
      )}
    </section>
  )
}
