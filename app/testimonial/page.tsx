'use client'

import { Suspense, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { CheckCircle } from '@phosphor-icons/react'
import SplitText from '@/app/components/ui/SplitText'
import { siteConfig } from '@/site.config'
import { useLocale, useFirstName } from '@/app/components/LocaleProvider'

function TestimonialForm() {
  const { tx } = useLocale()
  const first = useFirstName()
  const code = useSearchParams().get('code') || ''
  const [sending, setSending] = useState(false)
  const [done, setDone] = useState(false)
  const [error, setError] = useState('')

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setSending(true)
    setError('')
    const data = new FormData(e.currentTarget)
    data.set('code', code)
    try {
      const res = await fetch('/api/testimonials/submit', { method: 'POST', body: data })
      const json = await res.json()
      if (res.ok) setDone(true)
      else setError(json.error || 'Something went wrong. Please try again.')
    } catch {
      setError('Something went wrong. Please try again.')
    }
    setSending(false)
  }

  const field = 'w-full border border-ink-500 bg-paper-raised px-4 text-base text-ink-900 outline-none transition-colors duration-200 placeholder:text-ink-500 focus:border-accent-600'
  const label = 'mb-2 block text-sm font-medium text-ink-900'

  if (!code) {
    return (
      <main className="container-page pb-24 pt-20">
        <h1 className="type-display text-ink-900"><SplitText text={tx("Share your experience")} /></h1>
        <p className="type-lead mt-6 max-w-[48ch]">This page needs a personal link. If {siteConfig.firstName} asked you for a testimonial, please use the link they sent you.</p>
      </main>
    )
  }

  if (done) {
    return (
      <main className="container-page pb-24 pt-20">
        <CheckCircle size={56} weight="light" aria-hidden className="text-success" />
        <h1 className="type-h2 mt-8 text-ink-900">{tx("Thank you")}</h1>
        <p className="type-lead mt-5 max-w-[48ch]">Your words mean a lot. {siteConfig.firstName} will review them before they appear on the site.</p>
      </main>
    )
  }

  return (
    <main className="container-page pb-24 pt-12 md:pt-20">
      <h1 className="type-display max-w-[14ch] text-ink-900"><SplitText text={tx("Share your experience")} /></h1>
      <p className="type-lead mt-6 max-w-[52ch]">{tx('A few honest sentences about working with {name}. It will appear on the site once it\u2019s been reviewed.').replace('{name}', first)}</p>

      <form onSubmit={submit} className="mt-12 max-w-2xl space-y-6 border border-ink-100 bg-paper-raised p-6 md:p-10">
        <div style={{ position: 'absolute', width: 1, height: 1, overflow: 'hidden', clipPath: 'inset(50%)', whiteSpace: 'nowrap' }} aria-hidden="true">
          <label htmlFor="t-website">{tx("Leave this field empty")}</label>
          <input id="t-website" name="website" type="text" tabIndex={-1} autoComplete="off" />
        </div>
        <div className="grid gap-6 sm:grid-cols-2">
          <div>
            <label htmlFor="t-name" className={label}>{tx("Your name")}</label>
            <input id="t-name" name="name" required maxLength={80} autoComplete="name" className={`h-12 ${field}`} />
          </div>
          <div>
            <label htmlFor="t-role" className={label}>{tx("Role and company (optional)")}</label>
            <input id="t-role" name="role" maxLength={100} placeholder={tx("e.g. Founder, Studio Name")} className={`h-12 ${field}`} />
          </div>
        </div>
        <div>
          <label htmlFor="t-quote" className={label}>{tx("Your testimonial")}</label>
          <textarea id="t-quote" name="quote" required minLength={20} maxLength={600} rows={5} className={`resize-y py-3 ${field}`} />
          <p className="type-meta mt-2">{tx("20 to 600 characters")}</p>
        </div>
        <div>
          <label htmlFor="t-photo" className={label}>{tx("Photo (optional)")}</label>
          <input id="t-photo" name="photo" type="file" accept="image/jpeg,image/png,image/webp" className="block w-full text-sm text-ink-700 file:mr-4 file:border-0 file:bg-ink-900 file:px-4 file:py-2.5 file:text-sm file:font-medium file:text-paper" />
          <p className="type-meta mt-2">{tx("A square photo of your face works best. JPG, PNG or WebP, up to 3 MB.")}</p>
        </div>
        <label className="flex items-start gap-3 text-[15px] text-ink-700">
          <input type="checkbox" name="consent" value="yes" required className="mt-1 h-4 w-4" />
          {tx("I agree that my name, role, words and photo can be shown on this website.")}
        </label>
        {error && <p role="alert" className="text-sm text-error">{error}</p>}
        <button type="submit" disabled={sending} className="h-12 bg-ink-900 px-6 text-sm font-medium tracking-tight text-paper transition-[background-color,color] duration-300 hover:bg-accent-600 hover:text-on-accent disabled:opacity-60">
          {sending ? tx('Sending...') : tx('Send testimonial')}
        </button>
      </form>
    </main>
  )
}

export default function TestimonialPage() {
  return (
    <Suspense fallback={<main className="container-page pb-24 pt-20"><div className="h-14 w-72 bg-ink-50 motion-safe:animate-pulse" /></main>}>
      <TestimonialForm />
    </Suspense>
  )
}
