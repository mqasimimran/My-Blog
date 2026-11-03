'use client'

import { useState } from 'react'
import { useLocale } from '@/app/components/LocaleProvider'
import Stars from '@/app/components/Stars'

// Shown on a buyer's download page: review the product you bought.
export default function ReviewForm({ token, defaultName }: { token: string; defaultName: string }) {
  const { tx } = useLocale()
  const [rating, setRating] = useState(0), [name, setName] = useState(defaultName), [body, setBody] = useState('')
  const [state, setState] = useState<'idle' | 'sending' | 'done' | 'error'>('idle'), [error, setError] = useState('')
  async function submit(e: React.FormEvent) {
    e.preventDefault(); if (!rating) return setError(tx('Choose a star rating.'))
    setState('sending'); setError('')
    const res = await fetch('/api/reviews', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ token, rating, name, body }) }).catch(() => null)
    const d = res ? await res.json().catch(() => ({})) : {}
    if (res?.ok) setState('done'); else { setState('error'); setError(d.error || tx('Something went wrong. Try again in a moment.')) }
  }
  if (state === 'done') return <p className="mt-12 border border-ink-100 bg-paper-raised p-6 text-ink-900" role="status">{tx('Thank you for your review! It will appear on the product page once it’s approved.')}</p>
  return (
    <form onSubmit={submit} className="mt-12 space-y-4 border border-ink-100 bg-paper-raised p-6" aria-labelledby="review-heading">
      <h2 id="review-heading" className="text-xl font-medium text-ink-900">{tx('How was it? Leave a review')}</h2>
      <Stars value={rating} size={30} onChange={setRating} label={tx('Your rating')} />
      <div className="grid gap-4 sm:grid-cols-2"><div><label htmlFor="rv-name" className="mb-1.5 block text-sm text-ink-700">{tx('Your name (shown with the review)')}</label><input id="rv-name" required maxLength={60} value={name} onChange={(e) => setName(e.target.value)} className="h-11 w-full border border-ink-500 bg-paper px-3" /></div></div>
      <div><label htmlFor="rv-body" className="mb-1.5 block text-sm text-ink-700">{tx('Your review (optional)')}</label><textarea id="rv-body" rows={3} maxLength={2000} value={body} onChange={(e) => setBody(e.target.value)} className="w-full border border-ink-500 bg-paper px-3 py-2" /></div>
      <button type="submit" disabled={state === 'sending'} className="h-11 bg-ink-900 px-5 text-sm font-medium text-paper hover:bg-accent-600 hover:text-on-accent disabled:opacity-60">{state === 'sending' ? tx('Sending...') : tx('Post review')}</button>
      {error && <p role="alert" className="text-sm text-error">{error}</p>}
    </form>
  )
}
