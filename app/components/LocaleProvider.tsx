'use client'

import { createContext, useCallback, useContext } from 'react'
import { useRouter } from 'next/navigation'
import { translate, tr, isRtl, type Key, type Locale } from '@/lib/i18n'
import { siteConfig } from '@/site.config'

type Ctx = { locale: Locale; t: (key: Key, vars?: Record<string, string>) => string; tx: (text: string) => string; setLocale: (l: Locale) => void }
const LocaleContext = createContext<Ctx>({ locale: 'en', t: (k, v) => translate('en', k, v), tx: (x) => x, setLocale: () => {} })

// Gives every browser-side component the visitor's language. The choice is saved in a cookie so the
// server renders the right language straight away on every later visit.
export default function LocaleProvider({ locale, children }: { locale: Locale; children: React.ReactNode }) {
  const router = useRouter()
  const setLocale = useCallback((l: Locale) => {
    document.cookie = `lang=${l}; path=/; max-age=31536000; samesite=lax`
    document.documentElement.lang = l
    document.documentElement.dir = isRtl(l) ? 'rtl' : 'ltr'
    router.refresh()
  }, [router])
  const t = useCallback((key: Key, vars?: Record<string, string>) => translate(locale, key, vars), [locale])
  const tx = useCallback((text: string) => tr(locale, text), [locale])
  return <LocaleContext.Provider value={{ locale, t, tx, setLocale }}>{children}</LocaleContext.Provider>
}

export const useLocale = () => useContext(LocaleContext)

/** The person's first name in the visitor's language (for phrases like "Ask about Qasim"). */
export const useFirstName = () => (useContext(LocaleContext).locale === 'ur' && siteConfig.urdu.firstName) || siteConfig.firstName
