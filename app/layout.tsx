import './globals.css'
import Link from 'next/link'
import Navbar from './Navbar'
import Script from 'next/script'
import ReadingProgress from '@/app/components/ReadingProgress'
import Providers from '@/app/components/Providers'
import type { Metadata } from 'next'

// TODO: replace with your real production domain once you know it for sure —
// this powers absolute URLs for Open Graph/Twitter card previews.
const SITE_URL = 'https://muhammadqasimimran.vercel.app'
const SITE_DESCRIPTION =
  'Software Engineer and Graphic Designer building Unity games, AI/ML projects, and web apps — bridging functional code with minimalist design.'

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: 'Muhammad Qasim Imran — Software Engineer & Graphic Designer',
    template: '%s | Muhammad Qasim Imran',
  },
  description: SITE_DESCRIPTION,
  alternates: {
    types: {
      'application/rss+xml': '/feed.xml',
    },
  },
  openGraph: {
    type: 'website',
    url: SITE_URL,
    title: 'Muhammad Qasim Imran — Software Engineer & Graphic Designer',
    description: SITE_DESCRIPTION,
    siteName: 'Muhammad Qasim Imran',
    images: [{ url: '/profile.jpg', width: 1080, height: 1080, alt: 'Muhammad Qasim Imran' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Muhammad Qasim Imran — Software Engineer & Graphic Designer',
    description: SITE_DESCRIPTION,
    images: ['/profile.jpg'],
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        {/* Google AdSense Verification Script */}
        <script 
          async 
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-7791595581454811"
          crossOrigin="anonymous"
        ></script>
      </head>
      <body className="bg-gray-50 text-gray-900 font-sans antialiased" suppressHydrationWarning>
        
        {/* 2. Wrap everything inside the body with Providers */}
        <Providers>
          {/* Sticky Reading Progress Bar for Blog Posts */}
          <ReadingProgress />

          <Navbar />

          <main className="min-h-screen">
            {children}
          </main>

          <footer className="bg-gray-900 text-white">
            <div className="max-w-7xl mx-auto px-6 py-14 grid grid-cols-1 sm:grid-cols-3 gap-10">

              <div>
                <div className="text-lg font-medium tracking-wide mb-3">Muhammad Qasim Imran</div>
                <p className="text-gray-400 text-sm leading-relaxed max-w-xs">
                  Software Engineer &amp; Graphic Designer, Lahore, Pakistan.
                </p>
              </div>

              <div>
                <div className="text-[10px] font-bold tracking-[0.2em] uppercase text-gray-500 mb-4">Explore</div>
                <div className="flex flex-col gap-2 text-sm text-gray-300">
                  <Link href="/projects" className="hover:text-[#aa002a] transition-colors">Projects</Link>
                  <Link href="/design" className="hover:text-[#aa002a] transition-colors">Design</Link>
                  <Link href="/blog" className="hover:text-[#aa002a] transition-colors">Blog</Link>
                  <Link href="/resume" className="hover:text-[#aa002a] transition-colors">Resume</Link>
                </div>
              </div>

              <div>
                <div className="text-[10px] font-bold tracking-[0.2em] uppercase text-gray-500 mb-4">Connect</div>
                <div className="flex flex-col gap-2 text-sm text-gray-300">
                  <a href="mailto:m.qasimimran01@gmail.com" className="hover:text-[#aa002a] transition-colors">m.qasimimran01@gmail.com</a>
                  <a href="https://linkedin.com/in/muhammadqasimimran" target="_blank" rel="noopener noreferrer" className="hover:text-[#aa002a] transition-colors">LinkedIn</a>
                  <a href="https://github.com/mqasimimran" target="_blank" rel="noopener noreferrer" className="hover:text-[#aa002a] transition-colors">GitHub</a>
                  <a href="https://youtube.com/@qasimdevelops" target="_blank" rel="noopener noreferrer" className="hover:text-[#aa002a] transition-colors">YouTube</a>
                </div>
              </div>

            </div>

            <div className="border-t border-white/10">
              <p className="max-w-7xl mx-auto px-6 py-6 text-center text-xs text-gray-500">
                © {new Date().getFullYear()} Muhammad Qasim Imran. All rights reserved.
              </p>
            </div>
          </footer>
        </Providers>
        
      </body>
    </html>
  )
}