'use client'

import { useEffect, useState } from 'react'

type Props = { title: string; content: string; slug?: string; onTitle: (t: string) => void; onExcerpt: (t: string) => void; onContent: (html: string) => void }

// AI writing help in the blog editor. Every suggestion is a draft for you to review.
export default function AiHelper({ title, content, slug, onTitle, onExcerpt, onContent }: Props) {
  const [enabled, setEnabled] = useState(false)
  const [busy, setBusy] = useState('')
  const [msg, setMsg] = useState('')
  const [titles, setTitles] = useState<string[]>([])
  const [bullets, setBullets] = useState<string | null>(null)
  const [social, setSocial] = useState<{ linkedin: string; instagram: string; x: string } | null>(null)
  useEffect(() => { fetch('/api/explain').then((r) => r.json()).then((d) => setEnabled(!!d.enabled)).catch(() => {}) }, [])
  if (!enabled) return null
  async function run(action: string, extra: object = {}) {
    setBusy(action); setMsg('')
    try {
      const res = await fetch('/api/admin/ai-write', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action, title, content, slug, ...extra }) })
      const d = await res.json(); if (!res.ok) { setMsg(d.error || 'Something went wrong.'); return null } return d
    } catch { setMsg('Something went wrong.'); return null } finally { setBusy('') }
  }
  async function altText() {
    const d = await run('alttext'); if (!d) return
    const n = Object.keys(d.alts).length
    if (!n) return setMsg(d.missing ? 'Couldn’t read those images (only your uploaded images can be described).' : 'Every image already has alt text.')
    const doc = new DOMParser().parseFromString(`<body>${content}</body>`, 'text/html')
    doc.querySelectorAll('img').forEach((img) => { const a = d.alts[img.getAttribute('src') || '']; if (a && !img.getAttribute('alt')) img.setAttribute('alt', a) })
    onContent(doc.body.innerHTML); setMsg(`Alt text added to ${n} image${n > 1 ? 's' : ''}. Check it reads well.`)
  }
  const btn = 'border border-ink-300 bg-paper px-3 py-2 text-xs font-medium uppercase tracking-[0.08em] text-ink-900 hover:border-ink-900 disabled:opacity-50'
  const name = (k: string) => (k === 'x' ? 'X' : k[0].toUpperCase() + k.slice(1))
  return (
    <div className="border border-ink-100 bg-paper-raised p-4">
      <p className="text-[10px] font-bold uppercase tracking-widest text-ink-900">AI helper <span className="font-normal normal-case tracking-normal text-ink-500">suggestions to review, never published automatically</span></p>
      <div className="mt-3 flex flex-wrap gap-2">
        <button type="button" disabled={!!busy} onClick={async () => { const d = await run('titles'); if (d) setTitles(d.titles) }} className={btn}>{busy === 'titles' ? 'Thinking...' : 'Suggest titles'}</button>
        <button type="button" disabled={!!busy} onClick={async () => { const d = await run('description'); if (d) { onExcerpt(d.description); setMsg('Google description written into the summary field.') } }} className={btn}>{busy === 'description' ? 'Writing...' : 'Write Google description'}</button>
        <button type="button" disabled={!!busy} onClick={() => setBullets(bullets === null ? '' : null)} className={btn}>Outline from bullets</button>
        <button type="button" disabled={!!busy} onClick={altText} className={btn}>{busy === 'alttext' ? 'Looking at images...' : 'Alt text for images'}</button>
        <button type="button" disabled={!!busy} onClick={async () => { const d = await run('social', { slug }); if (d) setSocial(d) }} className={btn}>{busy === 'social' ? 'Writing...' : 'Social posts'}</button>
      </div>
      {msg && <p role="status" className="mt-3 text-sm text-ink-700">{msg}</p>}
      {titles.length > 0 && <ul className="mt-3 space-y-1">{titles.map((t) => <li key={t}><button type="button" onClick={() => { onTitle(t); setTitles([]) }} className="text-start text-sm text-ink-900 underline decoration-ink-300 underline-offset-4 hover:text-accent-600">{t}</button></li>)}</ul>}
      {bullets !== null && (
        <div className="mt-3 space-y-2"><textarea aria-label="Your bullet points" rows={4} value={bullets} onChange={(e) => setBullets(e.target.value)} placeholder={'- what the post is about\n- the key points\n- what readers should do'} className="w-full border border-ink-300 bg-paper p-2 text-sm" />
          <button type="button" disabled={!!busy} onClick={async () => { const d = await run('outline', { bullets }); if (d) { onContent((content && content !== '<p></p>' ? content : '') + d.html); setBullets(null); setMsg('Outline added to the end of your post.') } }} className={btn}>{busy === 'outline' ? 'Drafting...' : 'Draft the outline'}</button></div>
      )}
      {social && (
        <div className="mt-4 grid gap-3 md:grid-cols-3">{(['linkedin', 'instagram', 'x'] as const).map((k) => (
          <div key={k}><div className="mb-1 flex items-center justify-between"><span className="text-[10px] font-bold uppercase tracking-widest text-ink-500">{name(k)}</span>
            <button type="button" onClick={() => { navigator.clipboard.writeText(social[k]); setMsg(`${name(k)} post copied.`) }} className="text-xs text-accent-600 underline">Copy</button></div>
            <textarea aria-label={`${name(k)} post`} rows={8} value={social[k]} onChange={(e) => setSocial({ ...social, [k]: e.target.value })} className="w-full border border-ink-300 bg-paper p-2 text-sm" />
            {k === 'x' && <p className={`text-end text-xs ${social.x.length > 280 ? 'text-error' : 'text-ink-500'}`}>{social.x.length}/280</p>}</div>))}</div>
      )}
    </div>
  )
}
