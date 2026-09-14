import TechMarquee from '@/app/components/TechMarquee'
import ProjectFilters from '@/app/components/ProjectFilters'
import Link from 'next/link'

export default function AboutPage() {
  return (
    <main className="min-h-screen flex flex-col bg-white">
      
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-slate-100 to-white flex flex-col justify-between pt-16 md:pt-20">
        <div className="max-w-7xl mx-auto px-6 pb-16 md:pb-20 grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center w-full">
          
          {/* Left Column: Bio & Socials */}
          <div className="space-y-8">
            <h1 className="text-4xl sm:text-5xl lg:text-7xl font-light tracking-wide text-gray-900 uppercase">
              About Me
            </h1>
            
            <div className="space-y-6 text-gray-600 leading-relaxed max-w-lg text-sm sm:text-base">
              <p>
                I am a Software Engineer and Graphic Designer bridging the gap between highly functional code and minimalist aesthetic design. Currently pursuing a BS in Computer Science, my focus lies in crafting seamless digital experiences.
              </p>
              <p>
                From engineering robust game mechanics in Unity and building scalable web architecture with Next.js, to designing complete brand identities utilizing the Adobe Suite, I thrive at the intersection of logic and creativity.
              </p>
            </div>

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

          {/* Right Column: Profile Image with Responsive Height */}
          <div className="relative h-[400px] sm:h-[500px] lg:h-[600px] w-full rounded-lg overflow-hidden shadow-2xl">
            <img 
              src="/profile.jpg" 
              alt="Portrait" 
              className="absolute inset-0 w-full h-full object-cover object-center"
            />
          </div>

        </div>

        {/* Infinite Auto-Scrolling Tech Stack Ticker */}
        <TechMarquee />
      </section>

      {/* Interactive Filtered Portfolio Section */}
      <ProjectFilters />

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
            <Link 
              href="/contact" 
              className="inline-flex items-center gap-2 bg-[#aa002a] text-white text-xs font-bold tracking-[0.2em] uppercase px-8 py-4 rounded hover:bg-white hover:text-gray-900 transition-colors"
            >
              Get In Touch <span>↗</span>
            </Link>
          </div>
        </div>
      </section>

    </main>
  )
}