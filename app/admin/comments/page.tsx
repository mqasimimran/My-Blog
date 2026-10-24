'use client'

import { useEffect, useState } from 'react'
import AdminNav from '@/app/admin/AdminNav'
import { adminApi } from '@/lib/adminApi'
import { siteConfig } from '@/site.config'

type C = { id: string; article_slug: string; parent_id: string | null; name: string; email: string | null; body: string; status: 'pending' | 'approved'; from_owner: boolean; created_at: string }

// Admin -> Blog Comments: approve, delete or reply to comments (replies appear straight away).
export default function CommentsAdmin() {
  const [list, setList] = useState<C[]>([])
  const [tab, setTab] = useState<'pending' | 'approved'>('pending')
  const [reply, setReply] = useState<{ to: C; text: string } | null>(null)
  const [msg, setMsg] = useState('')
  const load = async () => { try { setList(((await adminApi.list('post_comments', { orderBy: 'created_at', ascending: false })) as C[]) || []) } catch { setMsg('Could not load. Has the latest SQL update been run?') } }
  useEffect(() => { load() }, [])
  const shown = list.filter((c) => c.status === tab)
  const pending = list.filter((c) => c.status === 'pending').length
  async function sendReply() {
    if (!reply?.text.trim()) return
    await adminApi.insert('post_comments', { article_slug: reply.to.article_slug, parent_id: reply.to.parent_id || reply.to.id, name: siteConfig.name, body: reply.text.trim(), status: 'approved', from_owner: true })
    if (reply.to.status === 'pending') await adminApi.update('post_comments', reply.to.id, { status: 'approved' })
    setReply(null); setMsg('Reply posted.'); load()
  }
  return (
    <div className="flex min-h-screen">
      <AdminNav />
      <main className="flex-1 px-6 py-10 md:px-12">
        <h1 className="text-4xl text-ink-900">Blog Comments</h1>
        <p className="mt-2 text-sm text-ink-500">New comments wait here until you approve them. Emails are only visible to you.</p>
        {msg && <p role="status" className="mt-4 text-sm text-ink-700">{msg}</p>}
        <div role="tablist" className="mt-6 flex gap-2">{(['pending', 'approved'] as const).map((t) => <button key={t} role="tab" aria-selected={tab === t} onClick={() => setTab(t)} className={`px-4 py-2 text-xs font-medium uppercase tracking-[0.08em] ${tab === t ? 'bg-ink-900 text-paper' : 'border border-ink-100 text-ink-700'}`}>{t === 'pending' ? `Waiting (${pending})` : 'Approved'}</button>)}</div>
        <ul className="mt-6 space-y-3">
          {shown.length === 0 && <li className="text-sm text-ink-500">{tab === 'pending' ? 'Nothing waiting.' : 'No approved comments yet.'}</li>}
          {shown.map((c) => (
            <li key={c.id} className="border border-ink-100 bg-paper-raised p-4 text-sm">
              <p><span className="font-medium text-ink-900">{c.name}</span>{c.email && <a href={`mailto:${c.email}`} className="ms-2 text-ink-500 underline">{c.email}</a>}<span className="ms-2 text-ink-500">on <a href={`/blog/${c.article_slug}`} target="_blank" rel="noopener noreferrer" className="underline">{c.article_slug}</a> &middot; {new Date(c.created_at).toLocaleString()}</span>{c.parent_id && <span className="ms-2 text-xs text-ink-500">(reply)</span>}</p>
              <p className="mt-2 whitespace-pre-line text-ink-700">{c.body}</p>
              <div className="mt-3 flex gap-4 text-xs font-medium uppercase tracking-[0.08em]">
                {c.status === 'pending' && <button onClick={async () => { await adminApi.update('post_comments', c.id, { status: 'approved' }); load() }} className="text-success">Approve</button>}
                {!c.from_owner && <button onClick={() => setReply({ to: c, text: '' })} className="text-ink-700">Reply</button>}
                <button onClick={async () => { if (confirm('Delete this comment (and its replies)?')) { await adminApi.remove('post_comments', c.id); load() } }} className="text-ink-500 hover:text-error">Delete</button>
              </div>
              {reply?.to.id === c.id && (
                <div className="mt-3 space-y-2"><textarea aria-label="Your reply" rows={3} value={reply.text} onChange={(e) => setReply({ ...reply, text: e.target.value })} className="w-full border border-ink-300 p-2" />
                  <button onClick={sendReply} className="bg-ink-900 px-4 py-2 text-xs font-medium uppercase tracking-[0.08em] text-paper">{c.status === 'pending' ? 'Approve and reply' : 'Post reply'}</button></div>
              )}
            </li>))}
        </ul>
      </main>
    </div>
  )
}
