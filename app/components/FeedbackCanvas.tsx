'use client'

import { useRef, useState } from 'react'
import { CheckCircle } from '@phosphor-icons/react'

export type FComment = { id: string; x: number; y: number; body: string; author_name: string | null; from_owner: boolean; resolved: boolean; created_at: string }

// A design with numbered comment pins. Click the image to place a comment at that spot. Positions are
// stored in percent, so pins stay put at any screen size. Shared by the client page and the admin.
export default function FeedbackCanvas({ imageUrl, comments, canAdd, onAdd, onResolve, ownerName }: {
  imageUrl: string; comments: FComment[]; canAdd: boolean; onAdd: (x: number, y: number, body: string) => Promise<boolean>; onResolve?: (c: FComment) => void; ownerName: string
}) {
  const box = useRef<HTMLDivElement>(null)
  const [draft, setDraft] = useState<{ x: number; y: number } | null>(null)
  const [text, setText] = useState('')
  const [busy, setBusy] = useState(false)
  const [active, setActive] = useState<string | null>(null)
  const place = (e: React.MouseEvent) => {
    if (!canAdd || !box.current) return
    const r = box.current.getBoundingClientRect()
    setDraft({ x: Math.round(((e.clientX - r.left) / r.width) * 1000) / 10, y: Math.round(((e.clientY - r.top) / r.height) * 1000) / 10 }); setText('')
  }
  const send = async (e: React.FormEvent) => {
    e.preventDefault(); if (!draft || !text.trim()) return
    setBusy(true); if (await onAdd(draft.x, draft.y, text.trim())) { setDraft(null); setText('') } setBusy(false)
  }
  return (
    <div className="grid gap-8 lg:grid-cols-12">
      <div className="lg:col-span-8">
        <div ref={box} onClick={place} className={`relative select-none border border-ink-100 ${canAdd ? 'cursor-crosshair' : ''}`} role="img" aria-label="Design with comment pins">
          <img src={imageUrl} alt="Design for review" draggable={false} className="block w-full" />
          {comments.map((c, i) => (
            <button key={c.id} type="button" onClick={(e) => { e.stopPropagation(); setActive(c.id) }} aria-label={`Comment ${i + 1}`}
              style={{ left: `${c.x}%`, top: `${c.y}%` }} className={`absolute grid h-7 w-7 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border-2 border-white text-xs font-bold shadow ${c.resolved ? 'bg-ink-500 text-white' : c.from_owner ? 'bg-ink-900 text-white' : 'bg-accent-600 text-white'} ${active === c.id ? 'ring-2 ring-ink-900' : ''}`}>{i + 1}</button>
          ))}
          {draft && (
            <form onClick={(e) => e.stopPropagation()} onSubmit={send} style={{ left: `${Math.min(draft.x, 70)}%`, top: `${draft.y}%` }} className="absolute z-10 mt-4 w-64 border border-ink-900 bg-paper p-3 shadow-lg">
              <label htmlFor="fb-text" className="text-xs font-medium text-ink-900">Comment on this spot</label>
              <textarea id="fb-text" autoFocus rows={3} value={text} onChange={(e) => setText(e.target.value)} className="mt-1 w-full border border-ink-300 p-2 text-sm outline-none focus:border-accent-600" />
              <div className="mt-2 flex gap-2"><button type="submit" disabled={busy || !text.trim()} className="bg-ink-900 px-3 py-1.5 text-xs font-medium text-paper disabled:opacity-50">{busy ? 'Saving...' : 'Add comment'}</button><button type="button" onClick={() => setDraft(null)} className="px-2 text-xs text-ink-500">Cancel</button></div>
            </form>
          )}
        </div>
        {canAdd && <p className="mt-2 text-sm text-ink-500">Click anywhere on the design to leave a comment there.</p>}
      </div>
      <ol className="space-y-3 lg:col-span-4" aria-label="Comments">
        {comments.length === 0 && <li className="text-sm text-ink-500">No comments yet.</li>}
        {comments.map((c, i) => (
          <li key={c.id} onMouseEnter={() => setActive(c.id)} className={`border p-3 text-sm ${active === c.id ? 'border-ink-900' : 'border-ink-100'} ${c.resolved ? 'opacity-60' : ''}`}>
            <div className="flex items-center justify-between gap-2">
              <span className="font-medium text-ink-900"><span className={`me-2 inline-grid h-5 w-5 place-items-center rounded-full text-[10px] text-white ${c.resolved ? 'bg-ink-500' : c.from_owner ? 'bg-ink-900' : 'bg-accent-600'}`}>{i + 1}</span>{c.from_owner ? ownerName : c.author_name || 'Client'}</span>
              {c.resolved ? <span className="flex items-center gap-1 text-xs text-success"><CheckCircle size={14} weight="fill" aria-hidden /> Resolved</span> : onResolve && <button onClick={() => onResolve(c)} className="text-xs text-ink-500 underline hover:text-ink-900">Resolve</button>}
            </div>
            <p className="mt-1.5 whitespace-pre-line text-ink-700">{c.body}</p>
          </li>
        ))}
      </ol>
    </div>
  )
}
