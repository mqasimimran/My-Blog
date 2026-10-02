import TechMarquee from '@/app/components/TechMarquee'
import ProjectFilters from '@/app/components/ProjectFilters'
import FeaturedDesigns from '@/app/components/FeaturedDesigns'
import FeaturedBlogPosts from '@/app/components/FeaturedBlogPosts'
import Testimonials from '@/app/components/Testimonials'
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
    <main className="min-h-screen flex flex-col bg-white">
      
      {/* Hero Section */}
      <section className="bg-white flex flex-col justify-between pt-16 md:pt-20 overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 pb-0 md:pb-0 grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-end w-full">
          
          {/* Left Column: Bio & Socials */}
          <div className="space-y-8 pb-16 md:pb-20 min-w-0">
            <AvailabilityBadge />

            <div>
              <p className="text-sm font-bold tracking-[0.2em] uppercase text-gray-400 mb-3">Hi, I'm Qasim</p>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-gray-900 leading-[1.2] break-words">
                I'm <RoleCycler />
              </h1>
            </div>
            
            <div className="space-y-6 text-gray-600 leading-relaxed max-w-lg text-sm sm:text-base">
              <p>
                I am a Software Engineer and Graphic Designer bridging the gap between highly functional code and minimalist aesthetic design. Currently pursuing a BS in Computer Science, my focus lies in crafting seamless digital experiences.
              </p>
              <p>
                From engineering robust game mechanics in Unity and building scalable web architecture with Next.js, to designing complete brand identities utilizing the Adobe Suite, I thrive at the intersection of logic and creativity. I've also sharpened that eye for detail through a Software Quality Engineering internship at Big Brains Learning, focused on UI/UX testing and boundary-value analysis.
              </p>
            </div>

            <MagneticButton>
              <Link href="/projects" className="inline-block text-sm font-bold uppercase tracking-widest text-gray-900 border-b-2 border-[#aa002a] pb-1 hover:text-[#aa002a] transition-colors">
                View My Work →
              </Link>
            </MagneticButton>

            {/* Social Links with Maroon Hover Accent */}
            <div className="flex flex-wrap items-center gap-3 text-xs font-bold tracking-[0.2em] text-gray-800 uppercase pt-4">
              <a href="https://youtube.com/@qasimdevelops" target="_blank" rel="noopener noreferrer" className="hover:text-[#aa002a] transition-colors">YouTube</a>
              <span className="text-gray-300">/</span>
              <a href="https://linkedin.com/in/muhammadqasimimran" target="_blank" rel="noopener noreferrer" className="hover:text-[#aa002a] transition-colors">LinkedIn</a>
              <span className="text-gray-300">/</span>
              <a href="https://instagram.com/muhammadqasimimrann" target="_blank" rel="noopener noreferrer" className="hover:text-[#aa002a] transition-colors">IG: Personal</a>
              <span className="text-gray-300">/</span>
              <a href="https://instagram.com/qasimdevelops" target="_blank" rel="noopener noreferrer" className="hover:text-[#aa002a] transition-colors">IG: Dev</a>
              <span className="text-gray-300">/</span>
              <a href="https://muhammadqasimimran1.myportfolio.com/" target="_blank" rel="noopener noreferrer" className="hover:text-[#aa002a] transition-colors">Portfolio</a>
            </div>
          </div>

          {/* Right Column: Frameless photo, bleeding off the bottom edge —
              swap /profile.jpg for a transparent-background PNG cutout to
              get the fully "floating" look; with a rectangular photo this
              will render as a rectangle without a border, not a cutout. */}
          <div className="relative h-[380px] sm:h-[480px] lg:h-[560px] w-full flex items-end justify-center lg:justify-end">
            <Image 
              src="/profile.jpg" 
              alt="Portrait" 
              width={560}
              height={640}
              priority
              className="w-auto h-full max-w-full object-contain object-bottom"
            />
          </div>

        </div>

        {/* Infinite Auto-Scrolling Tech Stack Ticker */}
        <TechMarquee />
      </section>

      {/* "Right Now" widget — hidden unless set in /admin/settings */}
      <NowWidget />

      {/* Interactive Filtered Portfolio Section */}
      <Reveal><ProjectFilters /></Reveal>

      {/* Featured Design pieces (from the /design gallery, marked featured in admin) */}
      <Reveal><FeaturedDesigns /></Reveal>

      {/* Featured blog posts (from /blog, marked featured in admin) */}
      <Reveal><FeaturedBlogPosts /></Reveal>

      {/* Testimonials (add real ones via /admin/testimonials — hidden until you do) */}
      <Reveal><Testimonials /></Reveal>

      {/* Newsletter signup */}
      <Reveal><NewsletterSignup /></Reveal>

      {/* NEW: Final CTA to drive engagement */}
      <section className="bg-gray-900 text-white py-24 px-6 mt-auto">
        <div className="max-w-3xl mx-auto text-center space-y-8">
          <h2 className="text-3xl md:text-5xl font-light tracking-wide uppercase">
            Let's Build Something
          </h2>
          <p className="text-gray-400 text-sm md:text-base leading-relaxed max-w-xl mx-auto">
            Whether you are looking for a software engineer to architect your next web application, or a technical designer for interactive 3D experiences, my inbox is always open.
          </p>
          <div className="pt-4">
            <MagneticButton>
              <Link 
                href="/contact" 
                className="inline-flex items-center gap-2 bg-[#aa002a] text-white text-xs font-bold tracking-[0.2em] uppercase px-8 py-4 rounded hover:bg-white hover:text-gray-900 transition-colors"
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