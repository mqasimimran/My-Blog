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
import MagneticButton from '@/app/components/MagneticButton'
import RoleCycler from '@/app/components/RoleCycler'
import Reveal from '@/app/components/Reveal'
import Link from 'next/link'
import Image from 'next/image'

export default function AboutPage() {
  return (
    <main className="min-h-screen flex flex-col bg-paper">

      {/* Hero Section — note: the photo is anchored to THIS section's own
          height (absolute, bottom:0). The tech ticker below is a SEPARATE
          sibling <section>, not nested in here — nesting it would grow this
          section's height and push the photo past the divider line. */}
      <section className="relative pt-16 md:pt-20 overflow-hidden" style={{ minHeight: 560 }}>

        {/* Desktop: frameless photo bleeding to the right edge, anchored to
            the bottom of the hero — relies on /profile.png having a
            transparent background for the "floating" cutout look. */}
        <div className="hidden lg:flex absolute top-0 right-0 bottom-0 items-end justify-end" style={{ width: '46%' }}>
          <Image
            src="/profile.png"
            alt="Portrait"
            width={806}
            height={1050}
            priority
            className="h-full w-auto max-w-full object-contain object-bottom"
          />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-6 h-full flex items-end" style={{ minHeight: 560 }}>
          <div className="space-y-8 pb-16 md:pb-20 lg:max-w-[46%] min-w-0">
            <AvailabilityBadge />

            <div>
              <p className="text-ink-500 text-sm font-bold tracking-[0.2em] uppercase mb-3">
                Hi, I'm Qasim
              </p>
              <h1 className="font-display text-ink-900 text-3xl sm:text-4xl lg:text-5xl font-bold leading-[1.15] break-words">
                I'm <RoleCycler />
              </h1>
            </div>

            <div className="text-ink-700 space-y-6 leading-relaxed max-w-lg text-sm sm:text-base">
              <p>
                I am a Software Engineer and Graphic Designer bridging the gap between highly functional code and minimalist aesthetic design. Currently pursuing a BS in Computer Science, my focus lies in crafting seamless digital experiences.
              </p>
              <p>
                From engineering robust game mechanics in Unity and building scalable web architecture with Next.js, to designing complete brand identities utilizing the Adobe Suite, I thrive at the intersection of logic and creativity. I've also sharpened that eye for detail through a Software Quality Engineering internship at Big Brains Learning, focused on UI/UX testing and boundary-value analysis.
              </p>
            </div>

            <MagneticButton>
              <Link
                href="/projects"
                className="text-ink-900 border-accent-600 hover:text-accent-600 inline-block text-sm font-bold uppercase tracking-widest pb-1 transition-colors border-b-2"
              >
                View My Work →
              </Link>
            </MagneticButton>

            {/* Social Links with Maroon Hover Accent */}
            <div className="text-ink-900 flex flex-wrap items-center gap-3 text-xs font-bold tracking-[0.2em] uppercase pt-4">
              <a href="https://youtube.com/@qasimdevelops" target="_blank" rel="noopener noreferrer" className="hover:text-accent-600 transition-colors">YouTube</a>
              <span className="text-ink-300">/</span>
              <a href="https://linkedin.com/in/muhammadqasimimran" target="_blank" rel="noopener noreferrer" className="hover:text-accent-600 transition-colors">LinkedIn</a>
              <span className="text-ink-300">/</span>
              <a href="https://instagram.com/muhammadqasimimrann" target="_blank" rel="noopener noreferrer" className="hover:text-accent-600 transition-colors">IG: Personal</a>
              <span className="text-ink-300">/</span>
              <a href="https://instagram.com/qasimdevelops" target="_blank" rel="noopener noreferrer" className="hover:text-accent-600 transition-colors">IG: Dev</a>
              <span className="text-ink-300">/</span>
              <a href="https://muhammadqasimimran1.myportfolio.com/" target="_blank" rel="noopener noreferrer" className="hover:text-accent-600 transition-colors">Portfolio</a>
            </div>

            {/* Mobile/tablet: photo falls back in-flow below the bio since
                there's no room to bleed it off the edge at this width.
                The negative bottom margin cancels this column's own
                pb-16/md:pb-20, pulling the photo flush against the hero's
                bottom edge — same zero-gap divider treatment as desktop. */}
            <div className="lg:hidden pt-8 -mb-16 md:-mb-20 flex justify-center">
              <Image
                src="/profile.png"
                alt="Portrait"
                width={560}
                height={729}
                className="w-auto max-h-[360px] max-w-full object-contain"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Infinite Auto-Scrolling Tech Stack Ticker — its own section, so it
          can't stretch the hero section (and the photo pinned to it) past
          where the divider line sits. */}
      <TechMarquee />

      {/* Client/event logos — "work seen at" trust signal */}
      <LogosStrip />

      {/* "Right Now" widget — hidden unless set in /admin/settings */}
      <NowWidget />

      {/* Interactive Filtered Portfolio Section */}
      <Reveal><ProjectFilters /></Reveal>

      {/* Featured Design pieces (from the /design gallery, marked featured in admin) */}
      <Reveal><FeaturedDesigns /></Reveal>

      {/* Featured blog posts (from /blog, marked featured in admin) */}
      <Reveal><FeaturedBlogPosts /></Reveal>

      {/* Certifications wall (seed via seed-certifications.sql, manage via /admin/resume/certifications — hidden until any exist) */}
      <Reveal><CertificationsWall /></Reveal>

      {/* Testimonials (add real ones via /admin/testimonials — hidden until you do) */}
      <Reveal><Testimonials /></Reveal>

      {/* Newsletter signup */}
      <Reveal><NewsletterSignup /></Reveal>

      {/* Final CTA */}
      <section className="bg-[#0a0a0a] text-white py-24 px-6 mt-auto">
        <div className="max-w-3xl mx-auto text-center space-y-8">
          <h2 className="font-display text-3xl md:text-5xl font-semibold tracking-wide uppercase">
            Let's Build Something
          </h2>
          <p className="text-gray-400 text-sm md:text-base leading-relaxed max-w-xl mx-auto">
            Whether you are looking for a software engineer to architect your next web application, or a technical designer for interactive 3D experiences, my inbox is always open.
          </p>
          <div className="pt-4">
            <MagneticButton>
              <Link
                href="/contact"
                className="bg-accent-600 hover:bg-white hover:text-gray-900 inline-flex items-center gap-2 text-white text-xs font-bold tracking-[0.2em] uppercase px-8 py-4 rounded-none transition-colors"
              >
                Get In Touch <span>↗</span>
              </Link>
            </MagneticButton>
          </div>
        </div>
      </section>

    </main>
  )
}
