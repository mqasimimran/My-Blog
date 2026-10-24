'use client'

import { useLocale } from '@/app/components/LocaleProvider'

// EN / Urdu switch in the navigation. Shows the language you can switch TO.
export default function LanguageToggle({ className = '' }: { className?: string }) {
  const { locale, setLocale, t } = useLocale()
  const next = locale === 'ur' ? 'en' : 'ur'
  return (
    <button
      type="button"
      onClick={() => setLocale(next)}
      aria-label={t('lang.switchLabel')}
      title={t('lang.switchLabel')}
      lang={next}
      className={`grid place-items-center text-sm font-medium text-ink-700 transition-colors duration-200 hover:bg-ink-50 hover:text-ink-900 ${className}`}
    >
      {t('lang.switch')}
    </button>
  )
}
