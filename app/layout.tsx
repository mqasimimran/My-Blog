import './globals.css'
import { GeistSans } from 'geist/font/sans'
import localFont from 'next/font/local'
import Navbar from './Navbar'
import Script from 'next/script'
import ReadingProgress from '@/app/components/ReadingProgress'
import { Analytics } from '@vercel/analytics/next'
import ConsoleEasterEgg from '@/app/components/ConsoleEasterEgg'
import CommandPalette from '@/app/components/CommandPalette'
import WhatsAppButton from '@/app/components/WhatsAppButton'
import SiteFooter from '@/app/components/SiteFooter'
import ScrollAnimator from '@/app/components/ScrollAnimator'
import PublicOnly from '@/app/components/PublicOnly'
import AccentStyle from '@/app/components/AccentStyle'
import LocaleProvider from '@/app/components/LocaleProvider'
import { getLocale, getPathname } from '@/lib/locale'
import { tr } from '@/lib/i18n'
import AssistantWidget from '@/app/components/AssistantWidget'
import CursorBadge from '@/app/components/CursorBadge'

// Headline face (condensed). The font file lives in the project (app/fonts), so it needs no
// install step and no Google request. Anton is under the SIL Open Font License (app/fonts/Anton-OFL.txt).
// Geist Mono is only used for small details (prices, numbers), so it isn't preloaded: it no longer
// competes with the page's main content on slow connections, and loads when first needed.
const GeistMono = localFont({
  src: '../node_modules/geist/dist/fonts/geist-mono/GeistMono-Variable.woff2',
  variable: '--font-geist-mono',
  weight: '100 900',
  display: 'swap',
  preload: false,
  fallback: ['ui-monospace', 'SFMono-Regular', 'Menlo', 'monospace'],
})

const anton = localFont({
  src: './fonts/anton-latin-400-normal.woff2',
  variable: '--font-anton',
  display: 'swap',
})
import type { Metadata } from 'next'

import { siteConfig, SITE_URL } from '@/site.config'
import RegisterServiceWorker from '@/app/components/RegisterServiceWorker'
import ErrorReporter from '@/app/components/ErrorReporter'
const SITE_DESCRIPTION = siteConfig.description

const baseMetadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${siteConfig.name} - ${siteConfig.jobTitle}`,
    template: `%s | ${siteConfig.name}`,
  },
  description: SITE_DESCRIPTION,
  alternates: {
    // Every page points at its own address as the main (canonical) one; detail pages set theirs too.
    canonical: './',
    types: {
      'application/rss+xml': '/feed.xml',
    },
  },
  openGraph: {
    type: 'website',
    url: SITE_URL,
    title: `${siteConfig.name} - ${siteConfig.jobTitle}`,
    description: SITE_DESCRIPTION,
    siteName: siteConfig.name,
    images: [{ url: '/profile.png', width: 1080, height: 1080, alt: siteConfig.name }],
  },
  twitter: {
    card: 'summary_large_image',
    title: `${siteConfig.name} - ${siteConfig.jobTitle}`,
    description: SITE_DESCRIPTION,
    images: ['/profile.png'],
  },
}

// Each page points at its own address (canonical) and at its twin in the other language (hreflang),
// so Google shows the Urdu page to Urdu searchers. The address comes from proxy.ts.
export async function generateMetadata(): Promise<Metadata> {
  const [locale, path] = await Promise.all([getLocale(), getPathname()])
  const ur = path === '/' ? '/ur' : `/ur${path}`
  const urBio = Array.isArray(siteConfig.urdu?.bio) ? siteConfig.urdu.bio[0] : undefined
  return {
    ...baseMetadata,
    ...(locale === 'ur' && urBio ? { description: urBio } : {}),
    alternates: { ...baseMetadata.alternates, canonical: locale === 'ur' ? ur : path, languages: { en: path, ur, 'x-default': path } },
    openGraph: { ...baseMetadata.openGraph, locale: locale === 'ur' ? 'ur_PK' : 'en_US', alternateLocale: locale === 'ur' ? 'en_US' : 'ur_PK' },
  }
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const locale = await getLocale()
  return (
    <html data-scroll-behavior="smooth" lang={locale} dir={locale === 'ur' ? 'rtl' : 'ltr'} className={`${GeistSans.variable} ${GeistMono.variable} ${anton.variable}`} suppressHydrationWarning>
      <head>
        {/* Site-wide Person structured data — helps Google associate this
            site with you specifically (knowledge panel, rich results) */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'Person',
              name: siteConfig.name,
              url: SITE_URL,
              jobTitle: siteConfig.jobTitle,
              sameAs: [
                siteConfig.social.linkedin,
                siteConfig.social.github,
                siteConfig.social.youtube,
                siteConfig.social.instagramPersonal,
              ],
            }),
          }}
        />

        {/* Privacy-friendly analytics (Plausible or Umami) — only loads if
            you've set the relevant env var. Neither requires a cookie
            banner, unlike Google Analytics. See handoff notes for setup. */}
        {process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN && (
          <script
            defer
            data-domain={process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN}
            src="https://plausible.io/js/script.js"
          ></script>
        )}
        {process.env.NEXT_PUBLIC_UMAMI_WEBSITE_ID && (
          <script
            defer
            src={process.env.NEXT_PUBLIC_UMAMI_SCRIPT_URL || 'https://cloud.umami.is/script.js'}
            data-website-id={process.env.NEXT_PUBLIC_UMAMI_WEBSITE_ID}
          ></script>
        )}

        {/* Applies the saved theme before first paint, so there's no flash
            of light mode before React hydrates and DarkModeToggle checks
            localStorage. Deliberately a plain inline script, not a
            component — this must run synchronously, before paint. */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('theme');if(t==='dark'||(!t&&window.matchMedia('(prefers-color-scheme: dark)').matches)){document.documentElement.classList.add('dark')}}catch(e){}})()`,
          }}
        />

        {/* Google AdSense Verification Script */}
        <script 
          async 
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-7791595581454811"
          crossOrigin="anonymous"
        ></script>
      </head>
      <body
        className="bg-paper text-ink-900 font-sans antialiased"
        suppressHydrationWarning
      >
        <LocaleProvider locale={locale}>
        
        {/* The login session provider lives in app/admin/layout.tsx: only the admin area uses it, so
            public pages never ask the server who is logged in. */}
        <>
          {/* Sticky Reading Progress Bar for Blog Posts */}
          <ReadingProgress />

          <AccentStyle />
          <a href="#main" className="skip-link">{tr(locale, 'Skip to content')}</a>

          {/* Public navigation; the admin area has its own (app/admin/AdminNav.tsx) */}
          <PublicOnly>
            <Navbar />
            {/* Spacer: the nav floats (position: fixed), so this keeps pages starting below it */}
            <div aria-hidden className="h-12" />
          </PublicOnly>

          <div id="main" tabIndex={-1} className="min-h-[100dvh] outline-none">
            {children}
          </div>

          <PublicOnly><SiteFooter /></PublicOnly>
          <ScrollAnimator />
          <PublicOnly><CursorBadge /></PublicOnly>
          <PublicOnly><div aria-hidden className="frame-rails z-rails" /></PublicOnly>
        </>

        <Analytics />
        <ConsoleEasterEgg />
        <CommandPalette />
        <PublicOnly><WhatsAppButton /></PublicOnly>
        <PublicOnly><AssistantWidget /></PublicOnly>
        <RegisterServiceWorker />
        <ErrorReporter />
        
        </LocaleProvider>
      </body>
    </html>
  )
}