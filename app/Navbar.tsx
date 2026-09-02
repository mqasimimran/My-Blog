"use client"

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useState, useMemo } from 'react'


export default function Navbar() {
  const pathname = usePathname()
  const router = useRouter()
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  const isActive = (path: string) => pathname === path

  // Your actual blog posts and key projects
  const searchableItems = [
    // Key Projects
    { title: "Bilingual AI Urdu Teaching Assistant", type: "Project", url: "/resume" },
    { title: "Brain Tumor MRI Classifier", type: "Project", url: "/resume" },
    { title: "Agentic LinkedIn Automator with Playwright", type: "Project", url: "/resume" },
    
    // Your exact blog folder slugs
    { title: "Beyond The Code My Journey Of Fundraising", type: "Blog", url: "/blog/Beyond-the-Code-My-Journey-of-Fundraising" },
    { title: "My Experience With The Amal Brain Declutter Project", type: "Blog", url: "/blog/My-Experience-with-the-Amal-Brain-Declutter-Project" },
    { title: "The Code Of Asthetics", type: "Blog", url: "/blog/the-code-of-ashetics" },
    { title: "The Daily Obstacle Course My Journey", type: "Blog", url: "/blog/the-daily-obstacle-course-my-journey" },
    { title: "The Full Stack Creators Toolkit", type: "Blog", url: "/blog/The-Full-Stack-Creators-Toolkit" },
    
    // Tech Stack & Hardware
    { title: "Unity 3D Physics and Character Controllers", type: "Tech Stack", url: "/tech-stack" },
    { title: "PC Specs: Ryzen 5 7500F & RX 6750 XT", type: "Hardware", url: "/tech-stack" }
  ]

  // Filter items instantly as the user types (with fixed 'title' property)
  const filteredSuggestions = useMemo(() => {
    if (!searchQuery.trim()) return []
    return searchableItems.filter(item => 
      item.title.toLowerCase().includes(searchQuery.toLowerCase())
    ).slice(0, 5) // Limit to top 5 matches
  }, [searchQuery])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      router.push(`/blog?q=${encodeURIComponent(searchQuery)}`)
      setIsSearchOpen(false)
      setSearchQuery('')
    }
  }

  const handleSelectSuggestion = (url: string) => {
    router.push(url)
    setIsSearchOpen(false)
    setSearchQuery('')
  }

  return (
    <header className="px-8 py-6 bg-white border-b border-gray-100 sticky top-0 z-50">
      <nav className="max-w-[1400px] mx-auto flex items-center justify-between">
        
        <div className="w-6 hidden lg:block"></div>

        <div className="hidden lg:flex items-center gap-10 text-[11px] font-bold tracking-[0.15em] uppercase">
          <Link href="/" className={`${isActive('/') ? 'text-[#d9534f]' : 'text-gray-500 hover:text-[#d9534f]'} transition-colors`}>Home</Link>
          <Link href="/about" className={`${isActive('/about') ? 'text-[#d9534f]' : 'text-gray-500 hover:text-[#d9534f]'} transition-colors`}>About</Link>
          <Link href="/shop" className={`${isActive('/shop') ? 'text-[#d9534f]' : 'text-gray-500 hover:text-[#d9534f]'} transition-colors`}>Shop</Link>
          <Link href="/blog" className={`${isActive('/blog') ? 'text-[#d9534f]' : 'text-gray-500 hover:text-[#d9534f]'} transition-colors`}>Blog</Link>
          <Link href="/contact" className={`${isActive('/contact') ? 'text-[#d9534f]' : 'text-gray-500 hover:text-[#d9534f]'} transition-colors`}>Contacts</Link>
          <Link href="/tech-stack" className={`${isActive('/tech-stack') ? 'text-[#d9534f]' : 'text-gray-500 hover:text-[#d9534f]'} transition-colors`}>Tech Stack</Link>
          <Link href="/resume" className={`${isActive('/resume') ? 'text-[#d9534f]' : 'text-gray-500 hover:text-[#d9534f]'} transition-colors`}>Resume</Link>
        </div>

        {/* Right side search bar with autocomplete dropdown */}
        <div className="flex items-center gap-4 text-gray-600 relative ml-auto lg:ml-0">
          {isSearchOpen ? (
            <div className="relative">
              <form onSubmit={handleSearch} className="flex items-center border-b border-gray-300 pb-1 mr-2">
                <input 
                  type="text" 
                  autoFocus
                  placeholder="Search articles or projects..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="bg-transparent text-xs outline-none w-48 md:w-64 placeholder-gray-400"
                />
                <button type="button" onClick={() => { setIsSearchOpen(false); setSearchQuery(''); }} className="ml-2 text-gray-400 hover:text-[#d9534f]">✕</button>
              </form>

              {/* Autocomplete Dropdown Results */}
              {filteredSuggestions.length > 0 && (
                <div className="absolute right-0 mt-2 w-72 bg-white border border-gray-200 rounded-md shadow-lg py-2 z-50">
                  {filteredSuggestions.map((item, index) => (
                    <button
                      key={index}
                      onClick={() => handleSelectSuggestion(item.url)}
                      className="w-full text-left px-4 py-2 hover:bg-gray-50 transition-colors flex flex-col"
                    >
                      <span className="text-xs font-medium text-gray-900 truncate">{item.title}</span>
                      <span className="text-[10px] tracking-wider uppercase text-gray-400">{item.type}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <button onClick={() => setIsSearchOpen(true)} className="hover:text-[#d9534f] transition-colors p-1">
              <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-4.35-4.35m1.85-5.15a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>
          )}

        
        </div>

      </nav>
    </header>
  )
}