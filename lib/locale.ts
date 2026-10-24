import { cookies } from 'next/headers'
import { translate, tr, type Key, type Locale } from '@/lib/i18n'

// The visitor's language comes from the "lang" cookie set by the language switch.
export async function getLocale(): Promise<Locale> {
  return (await cookies()).get('lang')?.value === 'ur' ? 'ur' : 'en'
}

/** For server components: const t = await getT(); t('nav.home') */
export async function getT() {
  const locale = await getLocale()
  return Object.assign((key: Key, vars?: Record<string, string>) => translate(locale, key, vars), { locale, tx: (text: string) => tr(locale, text) })
}
