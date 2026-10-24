import TechMarquee from '@/app/components/TechMarquee'
import ProjectFilters from '@/app/components/ProjectFilters'
import FeaturedDesigns from '@/app/components/FeaturedDesigns'
import FeaturedBlogPosts from '@/app/components/FeaturedBlogPosts'
import Testimonials from '@/app/components/Testimonials'
import CertificationsWall from '@/app/components/CertificationsWall'
import LogosStrip from '@/app/components/LogosStrip'
import NewsletterSignup from '@/app/components/NewsletterSignup'
import AvailabilityBadge from '@/app/components/AvailabilityBadge'
import NowWidget from '@/app/components/NowWidget'
import HomeStats from '@/app/components/HomeStats'
import BlurLens from '@/app/components/BlurLens'
import LatestVideos from '@/app/components/LatestVideos'
import RoleCycler from '@/app/components/RoleCycler'
import Reveal from '@/app/components/Reveal'
import MagneticButton from '@/app/components/MagneticButton'
import Link from 'next/link'
import Image from 'next/image'

import { siteConfig } from '@/site.config'
import { getT } from '@/lib/locale'

export default async function HomePage() {
  const { tx } = await getT()
  const t = await getT()
  const ur = t.locale === 'ur'
  return (
    <main className="min-h-screen flex flex-col">
      {/* Hero Section — note: the photo is anchored to THIS section's own
          height (absolute, bottom:0). The tech ticker below is a SEPARATE
          sibling <section>, not nested in here — nesting it would grow this
          section's height and push the photo past the divider line. */}
      <section className="relative pt-16 md:pt-20 overflow-hidden" style={{ minHeight: 560 }}>

        {/* Desktop: frameless photo bleeding to the right edge, anchored to
            the bottom of the hero — relies on /profile.png having a
            transparent background for the "floating" cutout look. */}
        <div className="hero-photo hidden lg:flex absolute top-0 bottom-0 end-[max(0px,calc((100vw-1360px)/2+1px))] items-end justify-end" style={{ width: '46%' }}>
          <Image
            src="/profile.png"
            alt={tx("Portrait")}
            width={806}
            height={1050}
            priority
            className="h-full w-auto max-w-full object-contain object-bottom"
          />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-6 h-full flex items-end" style={{ minHeight: 560 }}>
          <div className="hero-enter space-y-8 pb-16 md:pb-20 lg:max-w-[46%] min-w-0">
            <AvailabilityBadge />

            <div>
              <p className="text-ink-500 text-sm font-bold tracking-[0.2em] uppercase mb-3">
                {ur ? siteConfig.urdu.greeting : siteConfig.hero.greeting}
              </p>
              <BlurLens>
                <h1 className="type-display text-ink-900 break-words">
                {t('home.iam')} <RoleCycler />{ur && <> {t('home.iamEnd')}</>}
              </h1>
              </BlurLens>
            </div>

            <div className="text-ink-700 space-y-6 leading-relaxed max-w-lg text-sm sm:text-base">
              {(ur ? siteConfig.urdu.bio : siteConfig.hero.bio).map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </div>

            <MagneticButton>
              <Link
                href="/projects"
                className="text-ink-900 border-accent-600 hover:text-accent-600 inline-block text-sm font-bold uppercase tracking-widest pb-1 transition-colors border-b-2"
              >
                {t('home.viewWork')}
              </Link>
            </MagneticButton>

            {/* Social Links with Maroon Hover Accent */}
            <div className="text-ink-900 flex flex-wrap items-center gap-3 text-xs font-bold tracking-[0.2em] uppercase pt-4">
              <a href={siteConfig.social.youtube} target="_blank" rel="noopener noreferrer" className="hover:text-accent-600 transition-colors">{tx("YouTube")}</a>
              <span className="text-ink-300">/</span>
              <a href={siteConfig.social.linkedin} target="_blank" rel="noopener noreferrer" className="hover:text-accent-600 transition-colors">{tx("LinkedIn")}</a>
              <span className="text-ink-300">/</span>
              <a href={siteConfig.social.instagramPersonal} target="_blank" rel="noopener noreferrer" className="hover:text-accent-600 transition-colors">{tx("IG: Personal")}</a>
              <span className="text-ink-300">/</span>
              <a href={siteConfig.social.instagramDev} target="_blank" rel="noopener noreferrer" className="hover:text-accent-600 transition-colors">{tx("IG: Dev")}</a>
              <span className="text-ink-300">/</span>
              <a href={siteConfig.social.portfolio} target="_blank" rel="noopener noreferrer" className="hover:text-accent-600 transition-colors">{tx("Portfolio")}</a>
            </div>

            {/* Mobile/tablet: photo falls back in-flow below the bio since
                there's no room to bleed it off the edge at this width.
                The negative bottom margin cancels this column's own
                pb-16/md:pb-20, pulling the photo flush against the hero's
                bottom edge — same zero-gap divider treatment as desktop. */}
            <div className="lg:hidden pt-8 -mb-16 md:-mb-20 flex justify-center">
              <Image
                src="/profile.png"
                alt={tx("Portrait")}
                width={560}
                height={729}
                className="w-auto max-h-[360px] max-w-full object-contain"
              />
            </div>
          </div>
        </div>
      </section>

      <TechMarquee />

      {/* Client / event logos */}
      <LogosStrip />

      {/* "Right now" note: hidden unless set in /admin/settings */}
      <NowWidget />

      {/* Numbers that count up, from the site's real content */}
      <HomeStats />

      <Reveal><ProjectFilters /></Reveal>
      <Reveal><FeaturedDesigns /></Reveal>
      <Reveal><FeaturedBlogPosts /></Reveal>
      <LatestVideos />
      <Reveal><CertificationsWall /></Reveal>
      <Reveal><Testimonials /></Reveal>
      <Reveal><NewsletterSignup /></Reveal>
    </main>
  )
}
