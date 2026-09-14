"use client"

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useState, useMemo } from 'react'

export default function Navbar() {
  const pathname = usePathname()
  const router = useRouter()
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const isActive = (path: string) => pathname === path

  const searchableItems = [
    { title: "Bilingual AI Urdu Teaching Assistant", type: "Project", url: "/resume" },
    { title: "Brain Tumor MRI Classifier", type: "Project", url: "/resume" },
    { title: "Agentic LinkedIn Automator with Playwright", type: "Project", url: "/resume" },
    { title: "Beyond The Code My Journey Of Fundraising", type: "Blog", url: "/blog/Beyond-the-Code-My-Journey-of-Fundraising" },
    { title: "My Experience With The Amal Brain Declutter Project", type: "Blog", url: "/blog/My-Experience-with-the-Amal-Brain-Declutter-Project" },
    { title: "The Code Of Asthetics", type: "Blog", url: "/blog/the-code-of-ashetics" },
    { title: "The Daily Obstacle Course My Journey", type: "Blog", url: "/blog/the-daily-obstacle-course-my-journey" },
    { title: "The Full Stack Creators Toolkit", type: "Blog", url: "/blog/The-Full-Stack-Creators-Toolkit" },
    { title: "Unity 3D Physics and Character Controllers", type: "Tech Stack", url: "/tech-stack" },
    { title: "PC Specs: Ryzen 5 7500F & RX 6750 XT", type: "Hardware", url: "/tech-stack" }
  ]

  const filteredSuggestions = useMemo(() => {
    if (!searchQuery.trim()) return []
    return searchableItems.filter(item => 
      item.title.toLowerCase().includes(searchQuery.toLowerCase())
    ).slice(0, 5)
  }, [searchQuery])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      router.push(`/blog?q=${encodeURIComponent(searchQuery)}`)
      setIsSearchOpen(false)
      setSearchQuery('')
      setIsMobileMenuOpen(false)
    }
  }

  const handleSelectSuggestion = (url: string) => {
    router.push(url)
    setIsSearchOpen(false)
    setSearchQuery('')
    setIsMobileMenuOpen(false)
  }

  return (
    <header className="px-6 md:px-8 py-6 bg-white border-b border-gray-100 sticky top-0 z-50">
      <nav className="max-w-[1400px] mx-auto flex items-center justify-between">
        
        {/* Mobile Hamburger Button */}
        <div className="flex items-center lg:hidden">
          <button 
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="text-gray-700 hover:text-[#aa002a] focus:outline-none p-1"
            aria-label="Toggle Menu"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {isMobileMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        <div className="w-6 hidden lg:block"></div>

        {/* Desktop Navigation Links */}
        <div className="hidden lg:flex items-center gap-10 text-[11px] font-bold tracking-[0.15em] uppercase">
          <Link href="/" className={`${isActive('/') ? 'text-[#aa002a]' : 'text-gray-500 hover:text-[#aa002a]'} transition-colors`}>Home</Link>
          <Link href="/about" className={`${isActive('/about') ? 'text-[#aa002a]' : 'text-gray-500 hover:text-[#aa002a]'} transition-colors`}>About</Link>
          <Link href="/shop" className={`${isActive('/shop') ? 'text-[#aa002a]' : 'text-gray-500 hover:text-[#aa002a]'} transition-colors`}>Shop</Link>
          <Link href="/design" className={`${isActive('/design') ? 'text-[#aa002a]' : 'text-gray-500 hover:text-[#aa002a]'} transition-colors`}>Design</Link>
          <Link href="/blog" className={`${isActive('/blog') ? 'text-[#aa002a]' : 'text-gray-500 hover:text-[#aa002a]'} transition-colors`}>Blog</Link>
          <Link href="/projects" className={`${isActive('/projects') ? 'text-[#aa002a]' : 'text-gray-500 hover:text-[#aa002a]'} transition-colors`}>Projects</Link>

          <Link href="/tech-stack" className={`${isActive('/tech-stack') ? 'text-[#aa002a]' : 'text-gray-500 hover:text-[#aa002a]'} transition-colors`}>Tech Stack</Link>
          <Link href="/resume" className={`${isActive('/resume') ? 'text-[#aa002a]' : 'text-gray-500 hover:text-[#aa002a]'} transition-colors`}>Resume</Link>
                    <Link href="/contact" className={`${isActive('/contact') ? 'text-[#aa002a]' : 'text-gray-500 hover:text-[#aa002a]'} transition-colors`}>Contact</Link>
        </div>

        {/* Right side search bar with autocomplete dropdown */}
        <div className="flex items-center gap-4 text-gray-600 relative ml-auto lg:ml-0">
          {isSearchOpen ? (
            <div className="relative">
              <form onSubmit={handleSearch} className="flex items-center border-b border-gray-300 pb-1 mr-2">
                <input 
                  type="text" 
                  autoFocus
                  placeholder="Search..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="bg-transparent text-xs outline-none w-36 sm:w-48 md:w-64 placeholder-gray-400"
                />
                <button type="button" onClick={() => { setIsSearchOpen(false); setSearchQuery(''); }} className="ml-2 text-gray-400 hover:text-[#aa002a]">✕</button>
              </form>

              {filteredSuggestions.length > 0 && (
                <div className="absolute right-0 mt-2 w-64 sm:w-72 bg-white border border-gray-200 rounded-md shadow-lg py-2 z-50">
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
            <button onClick={() => setIsSearchOpen(true)} className="hover:text-[#aa002a] transition-colors p-1" aria-label="Open Search">
              <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-4.35-4.35m1.85-5.15a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>
          )}
        </div>

      </nav>

      {/* Mobile Dropdown Menu Drawer */}
      {isMobileMenuOpen && (
        <div className="lg:hidden absolute top-full left-0 w-full bg-white border-b border-gray-200 shadow-lg py-6 px-8 flex flex-col gap-4 text-xs font-bold tracking-[0.15em] uppercase z-40">
          <Link href="/" onClick={() => setIsMobileMenuOpen(false)} className={`${isActive('/') ? 'text-[#aa002a]' : 'text-gray-600'} py-1`}>Home</Link>
          <Link href="/about" onClick={() => setIsMobileMenuOpen(false)} className={`${isActive('/about') ? 'text-[#aa002a]' : 'text-gray-600'} py-1`}>About</Link>
          <Link href="/shop" onClick={() => setIsMobileMenuOpen(false)} className={`${isActive('/shop') ? 'text-[#aa002a]' : 'text-gray-600'} py-1`}>Shop</Link>
          <Link href="/design" onClick={() => setIsMobileMenuOpen(false)} className={`${isActive('/design') ? 'text-[#aa002a]' : 'text-gray-600'} py-1`}>Design</Link>
          <Link href="/blog" onClick={() => setIsMobileMenuOpen(false)} className={`${isActive('/blog') ? 'text-[#aa002a]' : 'text-gray-600'} py-1`}>Blog</Link>
          <Link href="/projects" onClick={() => setIsMobileMenuOpen(false)} className={`${isActive('/projects') ? 'text-[#aa002a]' : 'text-gray-600'} py-1`}>Projects</Link>
         
          <Link href="/tech-stack" onClick={() => setIsMobileMenuOpen(false)} className={`${isActive('/tech-stack') ? 'text-[#aa002a]' : 'text-gray-600'} py-1`}>Tech Stack</Link>
          <Link href="/resume" onClick={() => setIsMobileMenuOpen(false)} className={`${isActive('/resume') ? 'text-[#aa002a]' : 'text-gray-600'} py-1`}>Resume</Link>
           <Link href="/contact" onClick={() => setIsMobileMenuOpen(false)} className={`${isActive('/contact') ? 'text-[#aa002a]' : 'text-gray-600'} py-1`}>Contact</Link>
        </div>
      )}
    </header>
  )
}