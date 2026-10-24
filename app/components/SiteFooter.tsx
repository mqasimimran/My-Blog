import Link from 'next/link'
import { GithubLogo, InstagramLogo, LinkedinLogo, YoutubeLogo } from '@phosphor-icons/react/dist/ssr'
import { ButtonLink } from '@/app/components/ui/Button'
import { siteConfig } from '@/site.config'
import FitText from '@/app/components/ui/FitText'
import { getT } from '@/lib/locale'
import type { Key } from '@/lib/i18n'

const EXPLORE: { href: string; label: Key }[] = [
  { href: '/projects', label: 'nav.projects' },
  { href: '/design', label: 'nav.design' },
  { href: '/blog', label: 'nav.blog' },
  { href: '/resume', label: 'nav.resume' },
  { href: '/roadmap', label: 'footer.roadmap' },
  { href: '/media-kit', label: 'footer.mediaKit' },
]

const SOCIAL = [
  { href: siteConfig.social.linkedin, label: 'LinkedIn', Icon: LinkedinLogo },
  { href: siteConfig.social.github, label: 'GitHub', Icon: GithubLogo },
  { href: siteConfig.social.youtube, label: 'YouTube', Icon: YoutubeLogo },
  { href: siteConfig.social.instagramPersonal, label: 'Instagram', Icon: InstagramLogo },
  { href: siteConfig.social.instagramDev, label: 'Instagram (dev)', Icon: InstagramLogo },
]

// Follows the page theme (light or dark) like every other section. It does not
// invert into a black block on a light page.
export default async function SiteFooter() {
  const { tx } = await getT()
  const t = await getT()
  return (
    <footer className="relative border-t border-ink-100">
      <div className="container-page grid gap-16 py-20 md:grid-cols-12 md:py-28">
        <div className="md:col-span-6">
          <p className="type-h2 max-w-[14ch] text-ink-900">{t('footer.cta')}</p>
          <div className="mt-8 flex flex-wrap items-center gap-x-8 gap-y-4">
            <ButtonLink href="/contact">{t('nav.contact')}</ButtonLink>
            <a href={`mailto:${siteConfig.email}`} className="link-draw text-sm font-medium text-ink-700">
              {siteConfig.email}
            </a>
          </div>
        </div>

        <nav aria-label={tx("Footer")} className="md:col-span-3">
          <p className="mb-5 text-sm font-medium text-ink-500">{t('footer.explore')}</p>
          <ul className="space-y-3 text-sm">
            {EXPLORE.map((l) => (
              <li key={l.href}>
                <Link href={l.href} className="text-ink-900 transition-colors duration-200 hover:text-accent-600">
                  {t(l.label)}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="md:col-span-3">
          <p className="mb-5 text-sm font-medium text-ink-500">{t('footer.elsewhere')}</p>
          <ul className="space-y-3 text-sm">
            {SOCIAL.map(({ href, label, Icon }) => (
              <li key={label}>
                <a
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2.5 text-ink-900 transition-colors duration-200 hover:text-accent-600"
                >
                  <Icon size={18} weight="regular" aria-hidden />
                  {label}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* The name across the footer, measured to fill the width exactly */}
      <div aria-hidden className="container-page select-none pb-6">
        <FitText text={siteConfig.name} className="font-display uppercase leading-[0.85] text-ink-900" />
      </div>

      <div className="border-t border-ink-100">
        <div className="container-page flex flex-wrap items-center justify-between gap-x-6 gap-y-2 py-6 text-xs text-ink-500">
          <p>
            &copy; {new Date().getFullYear()} {siteConfig.name}. {t('footer.rights')}
          </p>
          <div className="flex items-center gap-6">
            <a href="/feed.xml" className="transition-colors duration-200 hover:text-accent-600">{t('footer.rss')}</a>
            <Link href="/privacy" className="transition-colors duration-200 hover:text-accent-600">
              {t('footer.privacy')}
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
