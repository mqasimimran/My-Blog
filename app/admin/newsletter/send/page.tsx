'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import AdminNav from '@/app/admin/AdminNav'
import RichTextEditor from '@/components/RichTextEditor'
import { adminApi } from '@/lib/adminApi'
import { supabase } from '@/lib/supabase'
import { siteConfig } from '@/site.config'

type Campaign = { id: string; subject: string; recipients: number; failed: number; sent_at: string }
const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')

// Admin -> Newsletter -> Write a newsletter: compose, send yourself a test, then send to all subscribers.
export default function NewsletterSend() {
  const [subject, setSubject] = useState('')
  const [body, setBody] = useState('')
  const [editorKey, setEditorKey] = useState(0)
  const [testTo, setTestTo] = useState<string>(siteConfig.email)
  const [count, setCount] = useState<number | null>(null)
  const [history, setHistory] = useState<Campaign[]>([])
  const [busy, setBusy] = useState('')
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null)
  const load = async () => {
    try { setCount(((await adminApi.list('newsletter_subscribers')) as unknown[] || []).length) } catch { setCount(null) }
    try { setHistory(((await adminApi.list('newsletter_campaigns', { orderBy: 'sent_at', ascending: false })) as Campaign[]) || []) } catch { /* table appears after the SQL update */ }
  }
  useEffect(() => { load() }, [])

  async function insertLatest() {
    const { data } = await supabase.from('articles').select('title, slug, excerpt').eq('published', true).order('created_at', { ascending: false }).limit(3)
    if (!data?.length) return setMsg({ ok: false, text: 'No published posts yet.' })
    const html = '<h2>Latest posts</h2>' + data.map((a) => `<p><a href="${siteConfig.url}/blog/${a.slug}"><strong>${esc(a.title)}</strong></a>${a.excerpt ? `<br>${esc(a.excerpt)}` : ''}</p>`).join('')
    setBody((b) => (b && b !== '<p></p>' ? b : '') + html); setEditorKey((k) => k + 1)
  }
  async function send(test: boolean) {
    if (!test && !confirm(`Send "${subject}" to ${count} subscriber${count === 1 ? '' : 's'}? This can't be undone.`)) return
    setBusy(test ? 'test' : 'send'); setMsg(null)
    try {
      const res = await fetch('/api/admin/newsletter/send', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ subject, body, ...(test ? { testTo } : {}) }) })
      const d = await res.json()
      if (test) setMsg(res.ok ? { ok: true, text: `Test sent to ${testTo}. Check your inbox (and spam folder).` } : { ok: false, text: d.error })
      else { setMsg(res.ok ? { ok: true, text: `Sent to ${d.sent} subscribers.` } : { ok: false, text: d.error || 'Sending failed.' }); if (res.ok) { setSubject(''); setBody(''); setEditorKey((k) => k + 1) } load() }
    } catch { setMsg({ ok: false, text: 'Something went wrong.' }) }
    setBusy('')
  }
  const ready = subject.trim() && body.replace(/<[^>]+>/g, '').trim().length >= 5
  return (
    <div className="flex min-h-screen">
      <AdminNav />
      <main className="flex-1 px-6 py-10 md:px-12">
        <Link href="/admin/newsletter" className="text-sm text-ink-500 underline">&larr; Subscribers</Link>
        <h1 className="mt-3 text-4xl text-ink-900">Write a newsletter</h1>
        <p className="mt-2 text-sm text-ink-500">Goes to {count ?? '...'} subscriber{count === 1 ? '' : 's'}, from {siteConfig.mail.newsletterFrom.replace(/</g, '\u2039').replace(/>/g, '\u203a')}. Each email has the subscriber&rsquo;s own unsubscribe link.</p>
        <section className="mt-8 max-w-3xl space-y-5">
          <div><label htmlFor="nl-subject" className="mb-1.5 block text-[11px] font-medium uppercase tracking-[0.08em] text-ink-500">Subject</label>
            <input id="nl-subject" value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="e.g. 3 things I learned building my portfolio" className="w-full border border-ink-300 bg-paper-raised px-3 py-2.5 text-ink-900 outline-none focus:border-accent-600" /></div>
          <div><div className="mb-1.5 flex items-center justify-between"><span className="text-[11px] font-medium uppercase tracking-[0.08em] text-ink-500">Message</span>
              <button type="button" onClick={insertLatest} className="text-xs font-medium uppercase tracking-[0.08em] text-ink-900 hover:text-accent-600">+ Insert my latest posts</button></div>
            <RichTextEditor key={editorKey} content={body} onChange={setBody} /></div>
          <div className="flex flex-wrap items-end gap-3 border-t border-ink-100 pt-5">
            <div><label htmlFor="nl-test" className="mb-1.5 block text-[11px] font-medium uppercase tracking-[0.08em] text-ink-500">Send a test to</label>
              <input id="nl-test" type="email" value={testTo} onChange={(e) => setTestTo(e.target.value)} className="w-72 border border-ink-300 bg-paper-raised px-3 py-2.5 text-sm" /></div>
            <button onClick={() => send(true)} disabled={!ready || !!busy} className="border border-ink-900 px-5 py-2.5 text-xs font-medium uppercase tracking-[0.08em] text-ink-900 disabled:opacity-40">{busy === 'test' ? 'Sending...' : 'Send test'}</button>
            <button onClick={() => send(false)} disabled={!ready || !!busy || !count} className="bg-ink-900 px-5 py-2.5 text-xs font-medium uppercase tracking-[0.08em] text-paper hover:bg-accent-600 disabled:opacity-40">{busy === 'send' ? 'Sending...' : `Send to ${count ?? 0} subscribers`}</button>
          </div>
          {msg && <p role="status" className={`text-sm ${msg.ok ? 'text-success' : 'text-error'}`}>{msg.text}</p>}
        </section>
        <section className="mt-12 max-w-3xl">
          <h2 className="text-xs font-medium uppercase tracking-[0.08em] text-ink-900">Sent newsletters</h2>
          <ul className="mt-3 divide-y divide-ink-100 border-y border-ink-100 text-sm">
            {history.length === 0 && <li className="py-3 text-ink-500">Nothing sent yet.</li>}
            {history.map((c) => <li key={c.id} className="flex justify-between gap-4 py-3"><span className="text-ink-900">{c.subject}</span><span className="text-ink-500">{c.recipients} sent{c.failed ? `, ${c.failed} failed` : ''} &middot; {new Date(c.sent_at).toLocaleDateString()}</span></li>)}
          </ul>
        </section>
      </main>
    </div>
  )
}
