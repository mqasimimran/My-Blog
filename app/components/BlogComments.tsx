'use client'

import { useEffect, useState } from 'react'
import { useLocale } from '@/app/components/LocaleProvider'
import { dateLocale } from '@/lib/i18n'
import { siteConfig } from '@/site.config'

type C = { id: string; parent_id: string | null; name: string; body: string; from_owner: boolean; created_at: string }

// Comments under a blog post: no account needed. New comments appear once approved.
export default function BlogComments({ slug }: { slug: string }) {
  const { tx, locale } = useLocale()
  const [list, setList] = useState<C[]>([])
  const [replyTo, setReplyTo] = useState<C | null>(null)
  const [f, setF] = useState({ name: '', email: '', body: '', website: '' })
  const [state, setState] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle')
  const [error, setError] = useState('')
  useEffect(() => { fetch(`/api/comments?slug=${encodeURIComponent(slug)}`).then((r) => r.json()).then((d) => setList(d.comments || [])).catch(() => {}); try { setF((x) => ({ ...x, name: localStorage.getItem('comment-name') || '' })) } catch {} }, [slug])
  const top = list.filter((c) => !c.parent_id)
  const when = (d: string) => new Date(d).toLocaleDateString(dateLocale(locale), { year: 'numeric', month: 'short', day: 'numeric' })

  async function submit(e: React.FormEvent) {
    e.preventDefault(); setState('sending'); setError('')
    try { localStorage.setItem('comment-name', f.name) } catch {}
    const res = await fetch('/api/comments', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ slug, ...f, parentId: replyTo?.id }) })
    const d = await res.json().catch(() => ({}))
    if (res.ok) { setState('sent'); setF({ ...f, body: '' }); setReplyTo(null) } else { setState('error'); setError(d.error || tx('Something went wrong. Try again in a moment.')) }
  }
  const item = (c: C) => (
    <div className={`border-s-2 ps-4 ${c.from_owner ? 'border-accent-600' : 'border-ink-100'}`}>
      <p className="text-sm"><span className="font-medium text-ink-900" dir="auto">{c.name}</span>{c.from_owner && <span className="ms-2 bg-ink-900 px-1.5 py-0.5 text-[10px] uppercase tracking-[0.08em] text-paper">{tx('Author')}</span>}<span className="ms-2 text-ink-500">{when(c.created_at)}</span></p>
      <p className="mt-1.5 whitespace-pre-line break-words text-[16px] leading-relaxed text-ink-700" dir="auto">{c.body}</p>
      <button type="button" onClick={() => { setReplyTo(c); setState('idle'); document.getElementById('comment-body')?.focus() }} className="mt-1 text-xs font-medium text-ink-500 hover:text-ink-900">{tx('Reply')}</button>
    </div>
  )
  return (
    <section className="mx-auto mt-16 max-w-3xl" aria-labelledby="comments-heading">
      <h2 id="comments-heading" className="text-2xl font-medium tracking-tight text-ink-900">{tx('Comments')}{list.length > 0 && <span className="ms-2 text-ink-500">({list.length})</span>}</h2>
      <ul className="mt-6 space-y-6">
        {top.map((c) => (
          <li key={c.id}>{item(c)}
            {list.some((r) => r.parent_id === c.id) && <ul className="ms-6 mt-4 space-y-4">{list.filter((r) => r.parent_id === c.id).map((r) => <li key={r.id}>{item(r)}</li>)}</ul>}
          </li>
        ))}
        {top.length === 0 && <li className="text-ink-500">{tx('No comments yet. Be the first.')}</li>}
      </ul>
      <form onSubmit={submit} className="mt-10 space-y-4 border border-ink-100 bg-paper-raised p-6">
        <p className="font-medium text-ink-900">{replyTo ? <>{tx('Replying to')} <span dir="auto">{replyTo.name}</span> <button type="button" onClick={() => setReplyTo(null)} className="ms-2 text-sm font-normal text-ink-500 underline">{tx('Cancel')}</button></> : tx('Leave a comment')}</p>
        <div style={{ position: 'absolute', width: 1, height: 1, overflow: 'hidden', clipPath: 'inset(50%)' }} aria-hidden="true"><input tabIndex={-1} autoComplete="off" value={f.website} onChange={(e) => setF({ ...f, website: e.target.value })} /></div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div><label htmlFor="comment-name" className="mb-1.5 block text-sm text-ink-700">{tx('Name')}</label><input id="comment-name" required maxLength={60} value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} className="h-11 w-full border border-ink-500 bg-paper px-3 outline-none focus:border-accent-600" /></div>
          <div><label htmlFor="comment-email" className="mb-1.5 block text-sm text-ink-700">{tx('Email (optional, never shown)')}</label><input id="comment-email" type="email" value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} className="h-11 w-full border border-ink-500 bg-paper px-3 outline-none focus:border-accent-600" /></div>
        </div>
        <div><label htmlFor="comment-body" className="mb-1.5 block text-sm text-ink-700">{tx('Comment')}</label><textarea id="comment-body" required rows={4} maxLength={3000} value={f.body} onChange={(e) => setF({ ...f, body: e.target.value })} className="w-full border border-ink-500 bg-paper px-3 py-2 outline-none focus:border-accent-600" /></div>
        <button type="submit" disabled={state === 'sending'} className="h-11 bg-ink-900 px-5 text-sm font-medium text-paper hover:bg-accent-600 hover:text-on-accent disabled:opacity-60">{state === 'sending' ? tx('Sending...') : tx('Post comment')}</button>
        {state === 'sent' && <p role="status" className="text-sm text-success">{tx('Thanks! Your comment will appear once it\u2019s approved.')}</p>}
        {state === 'error' && <p role="alert" className="text-sm text-error">{error}</p>}
        <p className="text-xs text-ink-500">{tx('Comments are checked by')} {siteConfig.firstName} {tx('before they appear.')}</p>
      </form>
    </section>
  )
}
