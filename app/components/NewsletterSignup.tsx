'use client'

import { useState } from 'react'
import { useLocale } from '@/app/components/LocaleProvider'

export default function NewsletterSignup() {
  const { tx } = useLocale()
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error' | 'duplicate'>('idle')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!email.trim()) return
    setStatus('loading')

    try {
      const res = await fetch('/api/newsletter/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim() }),
      })
      if (res.ok) {
        // The server treats "already subscribed" as success too, on
        // purpose, so this form can't be used to check whether a given
        // email is on the list.
        setStatus('success')
        setEmail('')
      } else {
        setStatus('error')
      }
    } catch (err) {
      console.error('Newsletter signup error:', err)
      setStatus('error')
    }
  }

  return (
    <section className="border-t border-ink-100">
      <div className="container-page section-y grid gap-10 lg:grid-cols-12 lg:items-end">
        <div className="lg:col-span-6">
          <h2 className="type-h3 text-ink-900 md:text-[1.75rem]">{tx("Get new posts by email")}</h2>
          <p className="mt-3 max-w-[44ch] text-base leading-relaxed text-ink-700">{tx("No spam. Just an email when something new goes up.")}</p>
        </div>

        <div className="lg:col-span-5 lg:col-start-8">
          {status === 'success' ? (
            <p role="status" className="text-base font-medium text-ink-900">{tx("You’re in. Thanks for subscribing.")}</p>
          ) : status === 'duplicate' ? (
            <p role="status" className="text-base text-ink-700">{tx("That email is already subscribed.")}</p>
          ) : (
            <form onSubmit={handleSubmit} noValidate={false}>
              <label htmlFor="newsletter-email" className="mb-2 block text-sm font-medium text-ink-900">
                {tx("Email address")}
              </label>
              <div className="flex flex-col gap-3 sm:flex-row">
                <input
                  id="newsletter-email"
                  type="email"
                  required
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={tx("name@example.com")}
                  suppressHydrationWarning
                  className="h-12 w-full flex-1 border border-ink-500 bg-paper-raised px-4 text-base text-ink-900 outline-none transition-colors duration-200 placeholder:text-ink-500 focus:border-accent-600"
                />
                <button
                  type="submit"
                  disabled={status === 'loading'}
                  className="h-12 shrink-0 bg-ink-900 px-6 text-sm font-medium tracking-tight text-paper transition-[background-color,color,transform] duration-300 ease-[var(--ease-smooth)] hover:bg-accent-600 hover:text-on-accent active:translate-y-px disabled:opacity-60"
                >
                  {status === 'loading' ? 'Subscribing...' : 'Subscribe'}
                </button>
              </div>
              {status === 'error' && (
                <p role="alert" className="mt-3 text-sm text-error">{tx("Something went wrong. Try again in a moment.")}</p>
              )}
            </form>
          )}
        </div>
      </div>
    </section>
  )
}
