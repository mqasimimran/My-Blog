'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function NewsletterSignup() {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error' | 'duplicate'>('idle')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!email.trim()) return
    setStatus('loading')

    const { error } = await supabase.from('newsletter_subscribers').insert([{ email: email.trim().toLowerCase() }])

    if (error) {
      if (error.code === '23505') {
        setStatus('duplicate')
      } else {
        console.error('Newsletter signup error:', error)
        setStatus('error')
      }
    } else {
      setStatus('success')
      setEmail('')
    }
  }

  return (
    <section className="bg-gray-50 border-t border-b border-gray-100 py-16 px-6 font-sans">
      <div className="max-w-xl mx-auto text-center">
        <h2 className="text-2xl font-light tracking-wide uppercase text-gray-900 mb-2">
          Get New Posts By Email
        </h2>
        <p className="text-sm text-gray-500 mb-6">
          No spam — just an email when something new goes up.
        </p>

        {status === 'success' ? (
          <p className="text-sm font-medium text-[#aa002a]">You're in — thanks for subscribing.</p>
        ) : status === 'duplicate' ? (
          <p className="text-sm text-gray-500">That email is already subscribed.</p>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@email.com"
              className="flex-1 border border-gray-300 rounded px-4 py-3 text-sm outline-none focus:border-[#aa002a] transition-colors"
            />
            <button
              type="submit"
              disabled={status === 'loading'}
              className="bg-[#aa002a] text-white text-xs font-bold uppercase tracking-widest px-6 py-3 rounded hover:bg-gray-900 transition-colors disabled:opacity-60"
            >
              {status === 'loading' ? 'Subscribing...' : 'Subscribe'}
            </button>
          </form>
        )}
        {status === 'error' && (
          <p className="text-xs text-red-500 mt-3">Something went wrong — try again in a moment.</p>
        )}
      </div>
    </section>
  )
}
