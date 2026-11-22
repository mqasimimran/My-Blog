import TechMarquee from '@/app/components/TechMarquee'
import ProjectFilters from '@/app/components/ProjectFilters'
import FeaturedDesigns from '@/app/components/FeaturedDesigns'
import FeaturedBlogPosts from '@/app/components/FeaturedBlogPosts'
import Testimonials from '@/app/components/Testimonials'
import LogosStrip from '@/app/components/LogosStrip'
import NewsletterSignup from '@/app/components/NewsletterSignup'
import NowWidget from '@/app/components/NowWidget'
import HomeStats from '@/app/components/HomeStats'
import LatestVideos from '@/app/components/LatestVideos'
import RoleCycler from '@/app/components/RoleCycler'
import Reveal from '@/app/components/Reveal'
import HomeHeroBackdrop from '@/app/components/HomeHeroBackdrop'

import { siteConfig } from '@/site.config'
import { getT } from '@/lib/locale'
import Link from 'next/link'
import type { Metadata } from 'next'
import { GithubLogo, InstagramLogo, LinkedinLogo, YoutubeLogo } from '@phosphor-icons/react/dist/ssr'

const SOCIAL = [
  { href: siteConfig.social.linkedin, label: 'LinkedIn', Icon: LinkedinLogo },
  { href: siteConfig.social.github, label: 'GitHub', Icon: GithubLogo },
  { href: siteConfig.social.youtube, label: 'YouTube', Icon: YoutubeLogo },
  { href: siteConfig.social.instagramPersonal, label: 'IG: Personal', Icon: InstagramLogo },
  { href: siteConfig.social.instagramDev, label: 'IG: Dev', Icon: InstagramLogo },
]

export const metadata: Metadata = { title: { absolute: `${siteConfig.name} — Developer & Designer` } }

export default async function HomePage() {
  const t = await getT()
  const ur = t.locale === 'ur'
  return (
    <main className="min-h-screen flex flex-col">
      <section className="cinematic-hero">
        <HomeHeroBackdrop />
        <div className="cinematic-shade" aria-hidden />
        <div className="cinematic-content">
          <p className="cinematic-eyebrow">{ur ? siteConfig.urdu.name : siteConfig.name}</p>
          <h1 className={`cinematic-title ${ur ? 'cinematic-title-ur' : ''}`}>
            {t('home.iam')} <RoleCycler />{ur && <> {t('home.iamEnd')}</>}
          </h1>
          <p className="cinematic-intro">
            {ur ? 'میں ویب ایپس، یونٹی گیمز اور برانڈز اور تقریبات کے لیے بصری ڈیزائن بناتا ہوں۔' : 'I build web apps and Unity games, and create visual designs for brands and events.'}
          </p>
          <div className="cinematic-actions">
            <Link href="#featured-work" className="cinematic-primary">{t('home.viewWork').replace(/\s*[→↗]\s*$/, '')} <span aria-hidden>↗</span></Link>
            <Link href="/contact" className="cinematic-secondary">{t('nav.contact')}</Link>
          </div>
          <nav aria-label={ur ? 'سوشل میڈیا' : 'Social profiles'} className="cinematic-socials">
            {SOCIAL.filter(link => link.href).map(({ href, label, Icon }) => (
              <a key={label} href={href} target="_blank" rel="noopener noreferrer" aria-label={t.tx(label)} title={t.tx(label)}>
                <Icon size={22} aria-hidden /><span className="sr-only">{t.tx(label)}</span>
              </a>
            ))}
          </nav>
        </div>
        <a href="#featured-work" className="cinematic-scroll">{ur ? 'میرا کام دیکھیں' : 'Explore the work'} <span aria-hidden>↓</span></a>
      </section>

      <LogosStrip />
      <div id="featured-work" className="scroll-mt-24"><Reveal><ProjectFilters /></Reveal></div>
      <Reveal><FeaturedDesigns /></Reveal>
      <Reveal><Testimonials /></Reveal>

      <TechMarquee />

      {/* "Right now" note: hidden unless set in /admin/settings */}
      <NowWidget />

      {/* Numbers that count up, from the site's real content */}
      <HomeStats />

      <Reveal><FeaturedBlogPosts /></Reveal>
      <LatestVideos />
      <Reveal><NewsletterSignup /></Reveal>
    </main>
  )
}
