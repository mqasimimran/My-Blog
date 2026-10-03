'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'

// TODO: swap in the real file (same path, or update this) and give it a
// real title/description once you have an actual asset to give away.
const ASSET_PATH = '/lead-magnets/placeholder.pdf'
const ASSET_TITLE = 'Free Resource'
const ASSET_DESCRIPTION = 'Enter your email to get instant access.'

export default function LeadMagnet() {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!email.trim()) return
    setStatus('loading')

    // Reuses the same newsletter_subscribers table as the newsletter signup
    // — a duplicate-email error is fine here, it just means they're already
    // on the list, so we unlock the download either way.
    const { error } = await supabase.from('newsletter_subscribers').insert([{ email: email.trim().toLowerCase() }])

    if (error && error.code !== '23505') {
      console.error('Lead magnet signup error:', error)
      setStatus('error')
      return
    }

    setStatus('success')
  }

  return (
    <section className="bg-paper border border-ink-100 rounded-none p-8 sm:p-10 max-w-xl mx-auto text-center font-sans">
      <h2 className="text-xl font-medium text-ink-900 mb-2">{ASSET_TITLE}</h2>
      <p className="text-sm text-ink-500 mb-6">{ASSET_DESCRIPTION}</p>

      {status === 'success' ? (
        <a
          href={ASSET_PATH}
          download
          className="inline-flex items-center gap-2 bg-accent-600 text-white text-xs font-bold uppercase tracking-widest px-6 py-3 rounded-none hover:bg-gray-900 transition-colors"
        >
          Download Now ↓
        </a>
      ) : (
        <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@email.com"
            className="flex-1 border border-ink-100 rounded-none px-4 py-3 text-sm outline-none focus:border-accent-600 transition-colors"
          />
          <button
            type="submit"
            disabled={status === 'loading'}
            className="bg-accent-600 text-white text-xs font-bold uppercase tracking-widest px-6 py-3 rounded-none hover:bg-gray-900 transition-colors disabled:opacity-60"
          >
            {status === 'loading' ? 'Unlocking...' : 'Get It Free'}
          </button>
        </form>
      )}
      {status === 'error' && (
        <p className="text-xs text-red-500 mt-3">Something went wrong — try again in a moment.</p>
      )}
    </section>
  )
}
