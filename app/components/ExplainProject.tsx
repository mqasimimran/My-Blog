'use client'

import { useEffect, useState } from 'react'
import { Sparkle } from '@phosphor-icons/react'
import { useLocale } from '@/app/components/LocaleProvider'

type Mode = 'recruiter' | 'engineer' | 'simple'

// "Explain it to me": the case study rewritten for a recruiter, an engineer, or in plain language.
// Hidden when no AI key is set.
export default function ExplainProject({ slug }: { slug: string }) {
  const { tx, locale } = useLocale()
  const [enabled, setEnabled] = useState(false)
  const [mode, setMode] = useState<Mode | null>(null)
  const [text, setText] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  useEffect(() => { fetch('/api/explain').then((r) => r.json()).then((d) => setEnabled(!!d.enabled)).catch(() => {}) }, [])
  if (!enabled) return null

  async function pick(m: Mode) {
    setMode(m); setError('')
    if (text[`${m}:${locale}`]) return
    setLoading(true)
    try {
      const res = await fetch('/api/explain', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ slug, mode: m, locale }) })
      const d = await res.json()
      if (res.ok) setText((t) => ({ ...t, [`${m}:${locale}`]: d.text }))
      else setError(d.error || tx('Something went wrong. Try again in a moment.'))
    } catch { setError(tx('Something went wrong. Try again in a moment.')) }
    setLoading(false)
  }
  const modes: [Mode, string][] = [['recruiter', tx('For recruiters')], ['engineer', tx('For engineers')], ['simple', tx('In simple words')]]
  const current = mode ? text[`${mode}:${locale}`] : ''

  return (
    <section className="mt-14 border border-ink-100 bg-paper-raised p-6 md:p-8" aria-labelledby="explain-heading">
      <p id="explain-heading" className="flex items-center gap-2 text-sm font-medium text-ink-900"><Sparkle size={16} weight="fill" aria-hidden className="text-accent-600" /> {tx('Explain this project')}</p>
      <div role="tablist" aria-label={tx('Explain this project')} className="mt-4 flex flex-wrap gap-2">
        {modes.map(([m, label]) => (
          <button key={m} role="tab" aria-selected={mode === m} onClick={() => pick(m)}
            className={`border px-4 py-2 text-sm transition-colors ${mode === m ? 'border-ink-900 bg-ink-900 text-paper' : 'border-ink-100 text-ink-700 hover:border-ink-500'}`}>{label}</button>
        ))}
      </div>
      <div aria-live="polite" className="mt-5">
        {loading && <p className="text-sm text-ink-500">{tx('Thinking...')}</p>}
        {error && <p role="alert" className="text-sm text-error">{error}</p>}
        {!loading && current && current.split(/\n\s*\n/).map((para, i) => <p key={i} className="mt-3 text-[16px] leading-relaxed text-ink-700 first:mt-0">{para}</p>)}
        {!loading && current && <p className="mt-4 text-xs text-ink-500">{tx('Written by AI from this case study.')}</p>}
      </div>
    </section>
  )
}
