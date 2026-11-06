'use client'

import { Suspense, useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { adminApi } from '@/lib/adminApi'
import WorkField from './WorkField'
import { siteConfig } from '@/site.config'

// A private link you send to a client so they can submit a testimonial. Submissions arrive hidden;
// press Show to publish one. A new link replaces the old one, which stops working.
const newCode = () => Array.from(crypto.getRandomValues(new Uint8Array(18)), (b) => 'abcdefghijkmnpqrstuvwxyz23456789'[b % 32]).join('')

function InvitePanelBody({initialWork}: {initialWork: string}) {
  const [code, setCode] = useState<string | null>(null)
  const [loaded, setLoaded] = useState(false)
  const [copied, setCopied] = useState(false)
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    adminApi.get('private_settings', 1, 'testimonial_invite_code')
      .then((row) => setCode(row?.testimonial_invite_code || null))
      .catch(() => setCode(null))
      .finally(() => setLoaded(true))
  }, [])

  const save = async (value: string | null) => {
    setBusy(true)
    try {
      await adminApi.update('private_settings', 1, { testimonial_invite_code: value, updated_at: new Date().toISOString() })
      setCode(value)
    } catch {
      alert('Could not update the link. Check your database setup and try again.')
    }
    setBusy(false)
  }

  const [work, setWork] = useState(initialWork)
  const [signed, setSigned] = useState<{ work: string; code: string; token?: string; error?: boolean }>()
  useEffect(() => {
    if (!work || !code) return
    let current = true
    fetch('/api/admin/testimonial-invite?work=' + encodeURIComponent(work), {cache:'no-store'})
      .then(async response => { if (!response.ok) throw new Error(); return response.json() })
      .then(data => { if (current) setSigned({work, code, token:data.token}) })
      .catch(() => { if (current) setSigned({work, code, error:true}) })
    return () => { current = false }
  }, [work, code])
  const result = signed?.work === work && signed.code === code ? signed : undefined
  const link = work ? (result?.token ? siteConfig.url + '/testimonial?' + new URLSearchParams({code: result.token, work}) : '') : code ? `${siteConfig.url}/testimonial?code=${code}` : ''

  return (
    <section className="mb-10 border border-ink-100 bg-paper-raised p-6">
      <p className="text-xs font-medium uppercase tracking-[0.08em] text-ink-900">Request a testimonial</p>
      <p className="mt-2 text-sm text-ink-500">Choose the client, campaign or design, then send the same link to everyone who worked with you. Each person submits their own testimonial. Approve each one with Show to display it on your website.</p>
      <div className="mt-4"><WorkField value={work} onChange={setWork} /></div>
      {result?.error && <p role="alert">Could not create a link for this work. Select it again or refresh.</p>}
      {!loaded ? (
        <p className="mt-4 text-sm text-ink-500">Loading...</p>
      ) : code ? (
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <input readOnly value={link} aria-label="Testimonial link" onFocus={(e) => e.target.select()} className="min-w-0 flex-1 border border-ink-100 px-3 py-2.5 font-mono text-xs text-ink-700" />
          <button type="button" disabled={!link} onClick={() => { navigator.clipboard.writeText(link); setCopied(true); setTimeout(() => setCopied(false), 1500) }} className="bg-ink-900 px-4 py-2.5 text-xs font-medium uppercase tracking-[0.08em] text-paper hover:bg-accent-600">
            {copied ? 'Copied' : 'Copy link'}
          </button>
          <button type="button" disabled={busy} onClick={() => confirm('Make a new link? All previous testimonial links will stop working.') && save(newCode())} className="border border-ink-100 px-4 py-2.5 text-xs font-medium uppercase tracking-[0.08em] text-ink-700 hover:border-ink-900">Replace all links</button>
          <button type="button" disabled={busy} onClick={() => confirm('Turn the link off? It will stop working until you make a new one.') && save(null)} className="px-2 py-2.5 text-xs font-medium uppercase tracking-[0.08em] text-ink-500 hover:text-error">Turn off</button>
        </div>
      ) : (
        <button type="button" disabled={busy} onClick={() => save(newCode())} className="mt-4 bg-ink-900 px-4 py-2.5 text-xs font-medium uppercase tracking-[0.08em] text-paper hover:bg-accent-600">Create a link</button>
      )}
    </section>
  )
}

function InviteFromSearch() {
  const work = useSearchParams().get('work') || ''
  return <InvitePanelBody key={work} initialWork={work} />
}

export default function InvitePanel() {
  return <Suspense fallback={<p>Loading testimonial link…</p>}><InviteFromSearch /></Suspense>
}
