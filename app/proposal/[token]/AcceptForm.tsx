'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

// Accept (type your name + agree) or decline a proposal.
export default function AcceptForm({ token, clientName }: { token: string; clientName: string }) {
  const router = useRouter()
  const [name, setName] = useState('')
  const [agree, setAgree] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [declining, setDeclining] = useState(false)
  const [reason, setReason] = useState('')

  async function post(path: 'accept' | 'decline', body: object) {
    setBusy(true); setError('')
    try {
      const res = await fetch(`/api/proposal/${token}/${path}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
      const d = await res.json()
      if (res.ok) router.refresh(); else setError(d.error || 'Something went wrong. Please try again.')
    } catch { setError('Something went wrong. Please try again.') }
    setBusy(false)
  }

  if (declining) return (
    <form onSubmit={(e) => { e.preventDefault(); post('decline', { reason }) }} className="space-y-4">
      <label htmlFor="pr-reason" className="block text-sm font-medium text-ink-900">Anything you&rsquo;d like to share? (optional)</label>
      <textarea id="pr-reason" rows={3} value={reason} onChange={(e) => setReason(e.target.value)} className="w-full border border-ink-500 bg-paper px-4 py-3 text-base outline-none focus:border-accent-600" />
      <div className="flex gap-4"><button type="submit" disabled={busy} className="h-11 border border-ink-900 px-5 text-sm font-medium text-ink-900">Decline proposal</button><button type="button" onClick={() => setDeclining(false)} className="text-sm text-ink-500 underline">Back</button></div>
      {error && <p role="alert" className="text-sm text-error">{error}</p>}
    </form>
  )
  return (
    <form onSubmit={(e) => { e.preventDefault(); post('accept', { name, agree }) }} className="space-y-5">
      <div>
        <label htmlFor="pr-name" className="block text-sm font-medium text-ink-900">Type your full name to sign</label>
        <input id="pr-name" required autoComplete="name" value={name} onChange={(e) => setName(e.target.value)} placeholder={clientName} className="mt-2 h-12 w-full border border-ink-500 bg-paper px-4 font-serif text-xl italic outline-none focus:border-accent-600" />
      </div>
      <label className="flex items-start gap-3 text-[15px] text-ink-700"><input type="checkbox" checked={agree} onChange={(e) => setAgree(e.target.checked)} className="mt-1 h-4 w-4" /> I have read this proposal and agree to its terms.</label>
      <div className="flex flex-wrap items-center gap-4">
        <button type="submit" disabled={busy || !agree || name.trim().length < 2} className="h-12 bg-ink-900 px-6 text-sm font-medium text-paper hover:bg-accent-600 hover:text-on-accent disabled:opacity-50">{busy ? 'Accepting...' : 'Accept and sign'}</button>
        <button type="button" onClick={() => setDeclining(true)} className="text-sm text-ink-500 underline underline-offset-4 hover:text-ink-900">Decline</button>
      </div>
      {error && <p role="alert" className="text-sm text-error">{error}</p>}
    </form>
  )
}
