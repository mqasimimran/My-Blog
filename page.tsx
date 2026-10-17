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
import RoleCycler from '@/app/components/RoleCycler'
import Reveal from '@/app/components/Reveal'
import { ButtonLink } from '@/app/components/ui/Button'
import Image from '@/components/SafeImage'

import { siteConfig } from '@/site.config'

export default function HomePage() {
  const { hero } = siteConfig

  return (
    <main className="flex flex-col">
      {/* Hero: name, headline, one sentence, two actions. The portrait stands on the line of the
          tools strip below it. Height is capped so very tall screens don't open up a void. */}
      <section className="container-page grid gap-y-8 lg:min-h-[min(calc(100dvh-80px),860px)] lg:grid-cols-12 lg:gap-x-10">
        <div className="flex flex-col justify-center pt-10 lg:col-span-7 lg:py-20">
          <div className="flex flex-wrap items-center gap-x-8 gap-y-3">
            <p className="text-sm font-medium text-ink-500">{hero.greeting}</p>
            <AvailabilityBadge />
          </div>

          {/* RoleCycler sizes itself to the longest role, so cycling never shifts the page. */}
          <h1 className="mt-6 text-[clamp(2.25rem,1.1rem+3.9vw,3.5rem)] font-semibold leading-[1.04] tracking-[-0.045em] text-ink-900">
            I&rsquo;m <RoleCycler />
          </h1>

          <p className="type-lead mt-6 max-w-[40ch]">{hero.tagline}</p>

          <div className="mt-10 flex flex-wrap items-center gap-x-8 gap-y-4">
            <ButtonLink href="/projects">View my work</ButtonLink>
            <ButtonLink href="/contact" variant="text">Contact</ButtonLink>
          </div>
        </div>

        <div className="flex items-end justify-center lg:col-span-5 lg:justify-end">
          <Image
            src={hero.image}
            alt={siteConfig.name}
            width={806}
            height={1050}
            priority
            sizes="(max-width: 1024px) 80vw, 40vw"
            className="h-auto max-h-[420px] w-auto max-w-full object-contain object-bottom lg:max-h-[min(76dvh,700px)]"
          />
        </div>
      </section>

      <TechMarquee />

      {/* Client / event logos */}
      <LogosStrip />

      {/* "Right now" note: hidden unless set in /admin/settings */}
      <NowWidget />

      <Reveal><ProjectFilters /></Reveal>
      <Reveal><FeaturedDesigns /></Reveal>
      <Reveal><FeaturedBlogPosts /></Reveal>
      <Reveal><CertificationsWall /></Reveal>
      <Reveal><Testimonials /></Reveal>
      <Reveal><NewsletterSignup /></Reveal>
    </main>
  )
}
