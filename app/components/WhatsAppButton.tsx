'use client'

import { WhatsappLogo } from '@phosphor-icons/react'
import { siteConfig } from '@/site.config'
import { useLocale } from '@/app/components/LocaleProvider'
import { useHideOnScroll } from '@/lib/useHideOnScroll'

// Number and default message live in site.config.ts
const WHATSAPP_NUMBER = siteConfig.whatsapp.number
const DEFAULT_MESSAGE = siteConfig.whatsapp.message

export default function WhatsAppButton() {
  const { t } = useLocale()
  const hideFab = useHideOnScroll()
  const href = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(DEFAULT_MESSAGE)}`

  // Neutral, not WhatsApp green: the site has one accent colour and uses it consistently.
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={t('whatsapp.label')}
      className={`fixed bottom-5 right-5 z-nav grid h-12 w-12 place-items-center border border-ink-100 bg-paper-raised text-ink-900 transition-[background-color,color,opacity,translate] duration-300 ease-[var(--ease-smooth)] hover:border-accent-600 hover:text-accent-600 active:translate-y-px md:bottom-6 md:right-6 duration-300 ${hideFab ? 'pointer-events-none translate-y-6 opacity-0' : ''}`}
    >
      <WhatsappLogo size={24} weight="regular" aria-hidden />
    </a>
  )
}
