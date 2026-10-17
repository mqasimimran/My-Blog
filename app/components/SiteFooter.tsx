import Link from 'next/link'
import { GithubLogo, InstagramLogo, LinkedinLogo, YoutubeLogo } from '@phosphor-icons/react/dist/ssr'
import { ButtonLink } from '@/app/components/ui/Button'
import { siteConfig } from '@/site.config'
import FitText from '@/app/components/ui/FitText'

const EXPLORE = [
  { href: '/projects', label: 'Projects' },
  { href: '/design', label: 'Design' },
  { href: '/blog', label: 'Blog' },
  { href: '/resume', label: 'Resume' },
  { href: '/roadmap', label: 'Roadmap' },
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
export default function SiteFooter() {
  return (
    <footer className="border-t border-ink-100 bg-paper">
      <div className="container-page grid gap-16 py-20 md:grid-cols-12 md:py-28">
        <div className="md:col-span-6">
          <p className="type-h2 max-w-[14ch] text-ink-900">Let&rsquo;s build something.</p>
          <div className="mt-8 flex flex-wrap items-center gap-x-8 gap-y-4">
            <ButtonLink href="/contact">Contact</ButtonLink>
            <a href={`mailto:${siteConfig.email}`} className="link-draw text-sm font-medium text-ink-700">
              {siteConfig.email}
            </a>
          </div>
        </div>

        <nav aria-label="Footer" className="md:col-span-3">
          <p className="mb-5 text-sm font-medium text-ink-500">Explore</p>
          <ul className="space-y-3 text-sm">
            {EXPLORE.map((l) => (
              <li key={l.href}>
                <Link href={l.href} className="text-ink-900 transition-colors duration-200 hover:text-accent-600">
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="md:col-span-3">
          <p className="mb-5 text-sm font-medium text-ink-500">Elsewhere</p>
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
            &copy; {new Date().getFullYear()} {siteConfig.name}. All rights reserved.
          </p>
          <Link href="/privacy" className="transition-colors duration-200 hover:text-accent-600">
            Privacy Policy
          </Link>
        </div>
      </div>
    </footer>
  )
}
