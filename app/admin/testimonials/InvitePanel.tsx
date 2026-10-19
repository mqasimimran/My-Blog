'use client'

import { useEffect, useState } from 'react'
import { adminApi } from '@/lib/adminApi'
import { siteConfig } from '@/site.config'

// A private link you send to a client so they can submit a testimonial. Submissions arrive hidden;
// press Show to publish one. A new link replaces the old one, which stops working.
const newCode = () => Array.from(crypto.getRandomValues(new Uint8Array(18)), (b) => 'abcdefghijkmnpqrstuvwxyz23456789'[b % 32]).join('')

export default function InvitePanel() {
  const [code, setCode] = useState<string | null>(null)
  const [loaded, setLoaded] = useState(false)
  const [copied, setCopied] = useState(false)
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    adminApi.get('private_settings', 1, 'testimonial_invite_code')
      .then((row: any) => setCode(row?.testimonial_invite_code || null))
      .catch(() => setCode(null))
      .finally(() => setLoaded(true))
  }, [])

  const save = async (value: string | null) => {
    setBusy(true)
    try {
      await adminApi.update('private_settings', 1, { testimonial_invite_code: value, updated_at: new Date().toISOString() })
      setCode(value)
    } catch {
      alert('Could not update the link. Has the latest supabase/setup.sql been run?')
    }
    setBusy(false)
  }

  const link = code ? `${siteConfig.url}/testimonial?code=${code}` : ''

  return (
    <section className="mb-10 border border-ink-100 bg-paper-raised p-6">
      <p className="text-xs font-medium uppercase tracking-[0.08em] text-ink-900">Request a testimonial</p>
      <p className="mt-2 text-sm text-ink-500">Send this private link to a client. What they submit arrives here hidden; press Show to publish it.</p>
      {!loaded ? (
        <p className="mt-4 text-sm text-ink-500">Loading...</p>
      ) : code ? (
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <input readOnly value={link} aria-label="Testimonial link" onFocus={(e) => e.target.select()} className="min-w-0 flex-1 border border-ink-100 px-3 py-2.5 font-mono text-xs text-ink-700" />
          <button type="button" onClick={() => { navigator.clipboard.writeText(link); setCopied(true); setTimeout(() => setCopied(false), 1500) }} className="bg-ink-900 px-4 py-2.5 text-xs font-medium uppercase tracking-[0.08em] text-paper hover:bg-accent-600">
            {copied ? 'Copied' : 'Copy link'}
          </button>
          <button type="button" disabled={busy} onClick={() => confirm('Make a new link? The current one will stop working.') && save(newCode())} className="border border-ink-100 px-4 py-2.5 text-xs font-medium uppercase tracking-[0.08em] text-ink-700 hover:border-ink-900">New link</button>
          <button type="button" disabled={busy} onClick={() => confirm('Turn the link off? It will stop working until you make a new one.') && save(null)} className="px-2 py-2.5 text-xs font-medium uppercase tracking-[0.08em] text-ink-500 hover:text-error">Turn off</button>
        </div>
      ) : (
        <button type="button" disabled={busy} onClick={() => save(newCode())} className="mt-4 bg-ink-900 px-4 py-2.5 text-xs font-medium uppercase tracking-[0.08em] text-paper hover:bg-accent-600">Create a link</button>
      )}
    </section>
  )
}
