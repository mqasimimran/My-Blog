import { cookies, headers } from 'next/headers'
import { translate, tr, type Key, type Locale } from '@/lib/i18n'

// The visitor's language comes from the "lang" cookie set by the language switch.
// The address decides (/ur/... = Urdu, set by proxy.ts); the cookie is only a fallback.
export async function getLocale(): Promise<Locale> {
  const fromUrl = (await headers()).get('x-locale')
  if (fromUrl === 'ur' || fromUrl === 'en') return fromUrl
  return (await cookies()).get('lang')?.value === 'ur' ? 'ur' : 'en'
}

/** The page's address without the /ur prefix (set by proxy.ts), e.g. '/blog/my-post'. */
export async function getPathname(): Promise<string> {
  return (await headers()).get('x-pathname') || '/'
}

/** For server components: const t = await getT(); t('nav.home') */
export async function getT() {
  const locale = await getLocale()
  return Object.assign((key: Key, vars?: Record<string, string>) => translate(locale, key, vars), { locale, tx: (text: string) => tr(locale, text) })
}
