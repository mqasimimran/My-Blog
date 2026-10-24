'use client'

import { useEffect, useRef, useState } from 'react'
import { ChatCircleDots, PaperPlaneRight, X } from '@phosphor-icons/react'
import Link from 'next/link'
import { siteConfig } from '@/site.config'
import { useLocale, useFirstName } from '@/app/components/LocaleProvider'
import { useHideOnScroll } from '@/lib/useHideOnScroll'

// Turns URLs in a reply into links: pages on this site open in place, other sites in a new tab.
const SITE_HOST = siteConfig.url.replace(/^https?:\/\//, '').replace(/^www\./, '').replace(/\/.*$/, '')
function Linkified({ text }: { text: string }) {
  return (
    <>
      {text.split(/(https?:\/\/[^\s<>"')\]]+)/g).map((part, i) => {
        if (!/^https?:\/\//.test(part)) return part
        const trail = part.match(/[.,;:!?]+$/)?.[0] || ''
        const href = trail ? part.slice(0, -trail.length) : part
        let url: URL | null = null
        try { url = new URL(href) } catch {}
        const internal = !!url && url.hostname.replace(/^www\./, '') === SITE_HOST
        const cls = 'underline decoration-ink-300 underline-offset-2 hover:text-accent-600 break-all'
        return (
          <span key={i}>
            {internal && url ? <Link href={url.pathname + url.search + url.hash} className={cls}>{url.pathname === '/' ? SITE_HOST : url.pathname}</Link> : <a href={href} target="_blank" rel="noopener noreferrer" className={cls}>{href.replace(/^https?:\/\/(www\.)?/, '')}</a>}
            {trail}
          </span>
        )
      })}
    </>
  )
}

type Msg = { role: 'user' | 'assistant'; content: string }

// The "Ask about me" chat. Only appears when the assistant is switched on (ANTHROPIC_API_KEY).
export default function AssistantWidget() {
  const { tx } = useLocale()
  const [enabled, setEnabled] = useState(false)
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState<Msg[]>([])
  const [input, setInput] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const list = useRef<HTMLDivElement>(null)
  const { t } = useLocale()
  const hideFab = useHideOnScroll()
  const first = useFirstName()
  const suggestions = [t('assistant.q1', { name: first }), t('assistant.q2', { name: first }), t('assistant.q3')]

  useEffect(() => {
    fetch('/api/assistant').then((r) => r.json()).then((d) => setEnabled(!!d.enabled)).catch(() => {})
  }, [])
  useEffect(() => {
    list.current?.scrollTo({ top: list.current.scrollHeight, behavior: 'smooth' })
  }, [messages, busy])
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false)
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open])

  async function ask(question: string) {
    const q = question.trim()
    if (!q || busy) return
    const next: Msg[] = [...messages, { role: 'user', content: q }]
    setMessages(next)
    setInput('')
    setBusy(true)
    setError('')
    try {
      const res = await fetch('/api/assistant', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ messages: next }) })
      const data = await res.json()
      if (res.ok) setMessages([...next, { role: 'assistant', content: data.reply }])
      else setError(data.error || t('assistant.error'))
    } catch {
      setError(t('assistant.error'))
    }
    setBusy(false)
  }

  if (!enabled) return null

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? t('assistant.close') : t('assistant.open', { name: first })}
        aria-expanded={open}
        className={`fixed bottom-[76px] right-5 z-nav grid h-12 w-12 place-items-center bg-ink-900 text-paper transition-[background-color,color,opacity,translate] duration-300 hover:bg-accent-600 active:translate-y-px md:bottom-[84px] md:right-6 duration-300 ${hideFab && !open ? 'pointer-events-none translate-y-6 opacity-0' : ''}`}
      >
        {open ? <X size={22} aria-hidden /> : <ChatCircleDots size={24} aria-hidden />}
      </button>

      {open && (
        <div role="dialog" aria-label={t('assistant.open', { name: first })} className="fixed bottom-[136px] right-5 z-nav flex h-[min(520px,70vh)] w-[min(380px,calc(100vw-40px))] flex-col border border-ink-100 bg-paper-raised md:bottom-[144px] md:right-6">
          <div className="flex items-center justify-between border-b border-ink-100 px-4 py-3">
            <p className="font-display text-lg uppercase leading-none text-ink-900">{t('assistant.open', { name: first })}</p>
            <button onClick={() => setOpen(false)} aria-label={tx("Close")} className="grid h-8 w-8 place-items-center text-ink-500 hover:text-ink-900"><X size={18} aria-hidden /></button>
          </div>

          <div ref={list} className="flex-1 space-y-3 overflow-y-auto px-4 py-4" aria-live="polite">
            {messages.length === 0 && (
              <div>
                <p className="text-sm text-ink-700">{t('assistant.hello', { name: first })}</p>
                <div className="mt-4 flex flex-col items-start gap-2">
                  {suggestions.map((s) => (
                    <button key={s} onClick={() => ask(s)} className="border border-ink-100 px-3 py-2 text-left text-sm text-ink-900 transition-colors hover:border-ink-900">{s}</button>
                  ))}
                </div>
              </div>
            )}
            {messages.map((m, i) => (
              <div key={i} className={m.role === 'user' ? 'flex justify-end' : 'flex justify-start'}>
                <p className={`max-w-[85%] whitespace-pre-wrap px-3 py-2 text-sm leading-relaxed ${m.role === 'user' ? 'bg-ink-900 text-paper' : 'bg-ink-50 text-ink-900'}`}>{m.role === 'assistant' ? <Linkified text={m.content} /> : m.content}</p>
              </div>
            ))}
            {busy && <p className="text-sm text-ink-500">{t('assistant.thinking')}</p>}
            {error && <p role="alert" className="text-sm text-error">{error}</p>}
          </div>

          <form onSubmit={(e) => { e.preventDefault(); ask(input) }} className="flex border-t border-ink-100">
            <label htmlFor="assistant-q" className="sr-only">{tx("Your question")}</label>
            <input id="assistant-q" value={input} onChange={(e) => setInput(e.target.value)} maxLength={800} placeholder={t('assistant.placeholder')} className="min-w-0 flex-1 bg-transparent px-4 py-3 text-sm text-ink-900 outline-none placeholder:text-ink-500" />
            <button type="submit" disabled={busy || !input.trim()} aria-label={t('assistant.send')} className="grid w-12 place-items-center text-ink-900 hover:text-accent-600 disabled:opacity-40"><PaperPlaneRight size={18} aria-hidden /></button>
          </form>
          <p className="border-t border-ink-100 px-4 py-2 text-[11px] text-ink-500">{t('assistant.note')}</p>
        </div>
      )}
    </>
  )
}
