'use client'

import { useEffect } from 'react'
import { useLocale } from '@/app/components/LocaleProvider'

// TODO: replace with your real Calendly scheduling link once you have a
// Calendly account set up — e.g. https://calendly.com/qasimimran/consultation
const CALENDLY_URL = 'https://calendly.com/YOUR-USERNAME/consultation'

export default function CalendlyEmbed() {
  const { tx } = useLocale()
  useEffect(() => {
    if (document.querySelector('script[src*="calendly.com/assets/external/widget.js"]')) return
    const script = document.createElement('script')
    script.src = 'https://assets.calendly.com/assets/external/widget.js'
    script.async = true
    document.body.appendChild(script)
  }, [])

  const isConfigured = !CALENDLY_URL.includes('YOUR-USERNAME')

  if (!isConfigured) {
    return (
      <div className="border border-dashed border-ink-100 p-8 text-center text-sm text-ink-300">
        Calendly isn't connected yet. Set <code className="font-mono text-xs">{tx("CALENDLY_URL")}</code> in{' '}
        <code className="font-mono text-xs">{tx("CalendlyEmbed.tsx")}</code> to your real scheduling link to enable this.
      </div>
    )
  }

  return (
    <div
      className="calendly-inline-widget"
      data-url={CALENDLY_URL}
      style={{ minWidth: '320px', height: '700px' }}
    />
  )
}
