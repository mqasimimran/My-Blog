'use client'

import { use, useEffect, useState } from 'react'
import { CheckCircle } from '@phosphor-icons/react'
import FeedbackCanvas, { type FComment } from '@/app/components/FeedbackCanvas'
import { siteConfig } from '@/site.config'

type Board = { title: string; client_name: string | null; image_url: string; status: 'open' | 'approved'; approved_name: string | null; approved_at: string | null }

// The client's design review page (by private link): comment by clicking the design, then approve.
export default function FeedbackPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = use(params)
  const [board, setBoard] = useState<Board | null>(null)
  const [comments, setComments] = useState<FComment[]>([])
  const [missing, setMissing] = useState(false)
  const [name, setName] = useState('')
  const [approveName, setApproveName] = useState('')
  const [error, setError] = useState('')
  const load = () => fetch(`/api/feedback/${token}/comments`).then(async (r) => { if (!r.ok) { setMissing(true); return } const d = await r.json(); setBoard(d.board); setComments(d.comments) })
  useEffect(() => { load(); try { setName(localStorage.getItem('feedback-name') || '') } catch {} }, [token])
  if (missing) return <main className="container-page pb-24 pt-20"><h1 className="type-h2 text-ink-900">This review link isn&rsquo;t working</h1></main>
  if (!board) return <main className="container-page pb-24 pt-20"><div className="h-96 bg-ink-50 motion-safe:animate-pulse" /></main>
  const add = async (x: number, y: number, body: string) => {
    setError(''); try { localStorage.setItem('feedback-name', name) } catch {}
    const res = await fetch(`/api/feedback/${token}/comments`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ x, y, body, name }) })
    const d = await res.json(); if (res.ok) { setComments(d.comments); return true } setError(d.error || 'Could not save.'); return false
  }
  const approve = async (e: React.FormEvent) => {
    e.preventDefault(); setError('')
    const res = await fetch(`/api/feedback/${token}/approve`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: approveName }) })
    if (res.ok) load(); else setError((await res.json()).error || 'Could not approve.')
  }
  return (
    <main className="container-page pb-24 pt-10 md:pt-14" dir="ltr" lang="en">
      <p className="type-meta">{siteConfig.name} &middot; Design review{board.client_name ? ` for ${board.client_name}` : ''}</p>
      <h1 className="mt-3 text-3xl font-medium tracking-tight text-ink-900">{board.title}</h1>
      {board.status === 'open' && <div className="mt-4 max-w-sm"><label htmlFor="fb-name" className="text-sm text-ink-700">Your name (shown on your comments)</label><input id="fb-name" value={name} onChange={(e) => setName(e.target.value)} className="mt-1 h-10 w-full border border-ink-300 bg-paper-raised px-3 text-sm" /></div>}
      {error && <p role="alert" className="mt-3 text-sm text-error">{error}</p>}
      <div className="mt-8"><FeedbackCanvas imageUrl={board.image_url} comments={comments} canAdd={board.status === 'open'} onAdd={add} ownerName={siteConfig.firstName} /></div>
      <section className="mt-12 max-w-xl border-t border-ink-900 pt-8">
        {board.status === 'approved' ? (
          <p className="flex items-center gap-2 text-lg text-ink-900"><CheckCircle size={24} weight="fill" aria-hidden className="text-success" /> Approved by {board.approved_name}{board.approved_at ? ` on ${new Date(board.approved_at).toLocaleDateString('en-US', { dateStyle: 'medium' })}` : ''}</p>
        ) : (
          <form onSubmit={approve} className="flex flex-wrap items-end gap-3">
            <div className="flex-1"><label htmlFor="fb-approve" className="block text-sm font-medium text-ink-900">Happy with it? Type your name to approve</label><input id="fb-approve" value={approveName} onChange={(e) => setApproveName(e.target.value)} className="mt-2 h-12 w-full border border-ink-500 bg-paper px-4" /></div>
            <button type="submit" disabled={approveName.trim().length < 2} className="h-12 bg-ink-900 px-6 text-sm font-medium text-paper hover:bg-accent-600 disabled:opacity-50">Approve design</button>
          </form>
        )}
      </section>
    </main>
  )
}
