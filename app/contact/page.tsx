'use client'

import { useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import CalendlyEmbed from '@/app/components/CalendlyEmbed'
import { ArrowUpRight, GithubLogo, LinkedinLogo } from '@phosphor-icons/react'

import { siteConfig } from '@/site.config'
import SplitText from '@/app/components/ui/SplitText'
import { useLocale } from '@/app/components/LocaleProvider'
function ContactForm() {
  const { tx, locale } = useLocale()
  const searchParams = useSearchParams()
  const prefillSubject = searchParams.get('subject') || ''
  const prefillMessage = searchParams.get('message') || ''

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState<{ type: 'success' | 'error' | null, message: string }>({ type: null, message: '' })

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)
    setSubmitStatus({ type: null, message: '' })

    // Save the form reference BEFORE the await so it doesn't become null
    const form = e.currentTarget
    const formData = new FormData(form)

    const name = formData.get('name') as string
    const email = formData.get('email') as string
    const subject = formData.get('subject') as string
    const message = formData.get('message') as string
    const website = formData.get('website') as string // honeypot

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, subject, message, website }),
      })
      const data = await res.json()

      if (res.ok) {
        setSubmitStatus({ type: 'success', message: 'Message sent. I will get back to you soon.' })
        form.reset()
      } else {
        setSubmitStatus({ type: 'error', message: data.error || 'Something went wrong.' })
      }
    } catch (error: any) {
      console.error('Caught Exception:', error)
      setSubmitStatus({ type: 'error', message: `Error: ${error?.message || 'Check console for details'}` })
    } finally {
      setIsSubmitting(false)
    }
  }

  const fieldClass =
    'w-full border border-ink-500 bg-paper-raised px-4 text-base text-ink-900 outline-none transition-colors duration-200 placeholder:text-ink-500 focus:border-accent-600'
  const labelClass = 'mb-2 block text-sm font-medium text-ink-900'

  return (
    <main className="pb-24">
      <div className="container-page grid gap-16 pt-12 md:pt-20 lg:grid-cols-12 lg:gap-12">
        {/* Details */}
        <div className="lg:col-span-5">
          <h1 className="type-display text-ink-900"><SplitText text={tx("Get in touch")} /></h1>
          <p className="type-lead mt-6 max-w-[40ch]">{locale === 'ur' && siteConfig.urdu.contactIntro ? siteConfig.urdu.contactIntro : siteConfig.contact.intro}</p>

          <dl className="mt-12 space-y-6">
            <div>
              <dt className="type-meta">{tx("Email")}</dt>
              <dd className="mt-1.5">
                <a href={`mailto:${siteConfig.email}`} className="link-draw text-lg font-medium text-ink-900">{siteConfig.email}</a>
              </dd>
            </div>
            <div>
              <dt className="type-meta">{tx("Location")}</dt>
              <dd className="mt-1.5 text-lg text-ink-900">{siteConfig.location}</dd>
            </div>
            <div>
              <dt className="type-meta">{tx("Elsewhere")}</dt>
              <dd className="mt-2.5 flex flex-wrap gap-x-6 gap-y-2">
                <a href={siteConfig.social.linkedin} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-[15px] text-ink-900 transition-colors duration-200 hover:text-accent-600">
                  <LinkedinLogo size={18} aria-hidden /> LinkedIn
                </a>
                <a href={siteConfig.social.github} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-[15px] text-ink-900 transition-colors duration-200 hover:text-accent-600">
                  <GithubLogo size={18} aria-hidden /> GitHub
                </a>
              </dd>
            </div>
          </dl>
        </div>

        {/* Form */}
        <div className="lg:col-span-7 lg:col-start-6 lg:pl-12 xl:col-span-6 xl:col-start-7 xl:pl-0">
          <form onSubmit={handleSubmit} suppressHydrationWarning className="space-y-6 border border-ink-100 bg-paper-raised p-6 md:p-10">
            {/* Honeypot field: hidden from real visitors via CSS, not just "display:none"
                (some bots skip display:none fields), but genuinely off-screen and
                unreachable by tab order so a human never notices or fills it in. */}
            <div style={{ position: 'absolute', width: 1, height: 1, overflow: 'hidden', clipPath: 'inset(50%)', whiteSpace: 'nowrap' }} aria-hidden="true">
              <label htmlFor="website">{tx("Leave this field empty")}</label>
              <input type="text" id="website" name="website" tabIndex={-1} autoComplete="off" />
            </div>

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div>
                <label htmlFor="name" className={labelClass}>{tx("Full name")}</label>
                <input type="text" id="name" name="name" required autoComplete="name" suppressHydrationWarning className={`h-12 ${fieldClass}`} />
              </div>
              <div>
                <label htmlFor="email" className={labelClass}>{tx("Email address")}</label>
                <input type="email" id="email" name="email" required autoComplete="email" suppressHydrationWarning className={`h-12 ${fieldClass}`} />
              </div>
            </div>

            <div>
              <label htmlFor="subject" className={labelClass}>{tx("Subject")}</label>
              <input type="text" id="subject" name="subject" required defaultValue={prefillSubject} suppressHydrationWarning className={`h-12 ${fieldClass}`} />
            </div>

            <div>
              <label htmlFor="message" className={labelClass}>{tx("Your message")}</label>
              <textarea id="message" name="message" rows={6} required defaultValue={prefillMessage} suppressHydrationWarning className={`resize-y py-3 ${fieldClass}`} />
            </div>

            <div className="flex flex-col items-start gap-4 pt-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className="group inline-flex h-12 items-center gap-2 bg-ink-900 px-6 text-sm font-medium tracking-tight text-paper transition-[background-color,color,transform] duration-300 ease-[var(--ease-smooth)] hover:bg-accent-600 hover:text-on-accent active:translate-y-px disabled:opacity-60"
              >
                {isSubmitting ? tx('Sending...') : tx('Send message')}
                <ArrowUpRight size={16} weight="bold" aria-hidden className="transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
              </button>

              {submitStatus.type && (
                <p role={submitStatus.type === 'error' ? 'alert' : 'status'} className={`text-sm font-medium ${submitStatus.type === 'success' ? 'text-success' : 'text-error'}`}>
                  {submitStatus.message}
                </p>
              )}
            </div>
          </form>
        </div>
      </div>

      {/* Prefer to talk it through? */}
      <section className="container-page mt-24 border-t border-ink-100 pt-16 md:mt-32 md:pt-20">
        <h2 className="type-h2 text-ink-900"><SplitText text={tx("Prefer to talk it through?")} /></h2>
        <p className="type-lead mt-4 max-w-[48ch]">{tx("Book a short call directly, no back-and-forth over email required.")}</p>
        <div className="mt-10">
          <CalendlyEmbed />
        </div>
      </section>
    </main>
  )
}

export default function ContactPage() {
  return (
    <Suspense fallback={
      <main className="container-page pb-24 pt-20">
        <div className="h-14 w-72 bg-ink-50 motion-safe:animate-pulse" />
      </main>
    }>
      <ContactForm />
    </Suspense>
  )
}