'use client'

import { useEffect, useState } from 'react'
import AdminNav from '@/app/admin/AdminNav'
import FeedbackCanvas, { type FComment } from '@/app/components/FeedbackCanvas'
import { adminApi } from '@/lib/adminApi'
import { adminStorage } from '@/lib/adminStorage'
import { siteConfig } from '@/site.config'

type Board = { id: string; title: string; client_name: string | null; client_email: string | null; image_url: string; status: string; approved_name: string | null; public_token: string; created_at: string }
const field = 'border border-ink-300 bg-paper-raised px-3 py-2.5 text-sm text-ink-900 outline-none focus:border-accent-600'

// Admin -> Design Feedback: upload a design, send the client the link, reply and resolve their comments.
export default function FeedbackAdmin() {
  const [boards, setBoards] = useState<Board[]>([])
  const [open, setOpen] = useState<Board | null>(null)
  const [comments, setComments] = useState<FComment[]>([])
  const [f, setF] = useState({ title: '', client_name: '', client_email: '' })
  const [file, setFile] = useState<File | null>(null)
  const [msg, setMsg] = useState('')
  const [busy, setBusy] = useState(false)
  const load = async () => { try { setBoards(((await adminApi.list('feedback_boards', { orderBy: 'created_at', ascending: false })) as Board[]) || []) } catch { setMsg('Could not load. Has the latest SQL update been run?') } }
  const loadComments = async (id: string) => setComments((((await adminApi.list('feedback_comments', { orderBy: 'created_at', ascending: true })) as any[]) || []).filter((c) => c.board_id === id))
  useEffect(() => { load() }, [])
  async function create(e: React.FormEvent) {
    e.preventDefault(); if (!f.title.trim() || !file) return setMsg('Add a title and the design image.')
    setBusy(true)
    const name = `feedback/${Math.random().toString(36).slice(2)}-${file.name.replace(/[^a-z0-9.]+/gi, '-').toLowerCase()}`
    const { error } = await adminStorage.from('blog-images').upload(name, file, { optimize: false })
    if (error) { setMsg('Upload failed: ' + error.message); setBusy(false); return }
    await adminApi.insert('feedback_boards', { title: f.title.trim(), client_name: f.client_name.trim() || null, client_email: f.client_email.trim() || null, image_url: adminStorage.from('blog-images').getPublicUrl(name).data.publicUrl })
    setF({ title: '', client_name: '', client_email: '' }); setFile(null); setBusy(false); setMsg('Created. Copy the link and send it to your client.'); load()
  }
  return (
    <div className="flex min-h-screen">
      <AdminNav />
      <main className="flex-1 px-6 py-10 md:px-12">
        <h1 className="text-4xl text-ink-900">Design Feedback</h1>
        <p className="mt-2 text-sm text-ink-500">Upload a design and send the client its private link. They click on the design to comment, and can approve it.</p>
        {msg && <p role="status" className="mt-4 text-sm text-ink-700">{msg}</p>}
        {!open && (
          <>
            <form onSubmit={create} className="mt-8 grid gap-3 border border-ink-100 bg-paper-raised p-5 md:grid-cols-5">
              <input aria-label="Title" placeholder="Title, e.g. Logo concepts v1" value={f.title} onChange={(e) => setF({ ...f, title: e.target.value })} className={`${field} md:col-span-2`} />
              <input aria-label="Client name" placeholder="Client name" value={f.client_name} onChange={(e) => setF({ ...f, client_name: e.target.value })} className={field} />
              <input aria-label="Client email" placeholder="Client email" value={f.client_email} onChange={(e) => setF({ ...f, client_email: e.target.value })} className={field} />
              <label className="flex cursor-pointer items-center justify-center border border-dashed border-ink-300 px-3 text-xs text-ink-700">{file ? file.name : 'Choose design image'}<input type="file" accept="image/*" className="sr-only" onChange={(e) => setFile(e.target.files?.[0] || null)} /></label>
              <button type="submit" disabled={busy} className="bg-ink-900 px-4 py-2.5 text-xs font-medium uppercase tracking-[0.08em] text-paper hover:bg-accent-600 md:col-span-5 md:justify-self-start">{busy ? 'Uploading...' : 'Create review'}</button>
            </form>
            <ul className="mt-8 divide-y divide-ink-100 border-y border-ink-100">
              {boards.length === 0 && <li className="py-4 text-sm text-ink-500">No reviews yet.</li>}
              {boards.map((b) => (
                <li key={b.id} className="flex flex-wrap items-center gap-4 py-3 text-sm">
                  <img src={b.image_url} alt="" className="h-12 w-16 object-cover" /><span className="flex-1 text-ink-900">{b.title}{b.client_name ? ` \u00b7 ${b.client_name}` : ''}</span>
                  <span className={`text-xs uppercase tracking-[0.08em] ${b.status === 'approved' ? 'text-success' : 'text-warning'}`}>{b.status === 'approved' ? `Approved by ${b.approved_name}` : 'Open'}</span>
                  <button onClick={() => { setOpen(b); loadComments(b.id) }} className="text-xs uppercase tracking-[0.08em] text-ink-700">Open</button>
                  <button onClick={() => { navigator.clipboard.writeText(`${siteConfig.url}/feedback/${b.public_token}`); setMsg('Link copied.') }} className="text-xs uppercase tracking-[0.08em] text-ink-700">Copy link</button>
                  <button onClick={async () => { if (confirm(`Delete "${b.title}" and its comments?`)) { await adminApi.remove('feedback_boards', b.id); load() } }} className="text-xs uppercase tracking-[0.08em] text-ink-500 hover:text-error">Delete</button>
                </li>))}
            </ul>
          </>
        )}
        {open && (
          <section className="mt-8">
            <button onClick={() => { setOpen(null); load() }} className="text-sm text-ink-500 underline">&larr; All reviews</button>
            <h2 className="mt-4 text-2xl font-medium text-ink-900">{open.title}</h2>
            <div className="mt-6"><FeedbackCanvas imageUrl={open.image_url} comments={comments} canAdd ownerName={`${siteConfig.firstName} (you)`}
              onAdd={async (x, y, body) => { await adminApi.insert('feedback_comments', { board_id: open.id, x, y, body, from_owner: true, author_name: siteConfig.firstName }); await loadComments(open.id); return true }}
              onResolve={async (c) => { await adminApi.update('feedback_comments', c.id, { resolved: true }); loadComments(open.id) }} /></div>
          </section>
        )}
      </main>
    </div>
  )
}
