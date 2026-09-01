"use client"

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useState } from 'react'

export default function Navbar() {
  const pathname = usePathname()
  const router = useRouter()
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  const isActive = (path: string) => pathname === path

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      router.push(`/blog?q=${encodeURIComponent(searchQuery)}`)
      setIsSearchOpen(false)
      setSearchQuery('')
    }
  }

  return (
    <header className="px-8 py-6 bg-white border-b border-gray-100 sticky top-0 z-50">
      <nav className="max-w-[1400px] mx-auto flex items-center justify-between">
        
        <div className="w-6"></div>

        <div className="hidden lg:flex items-center gap-10 text-[11px] font-bold tracking-[0.15em] uppercase">
          <Link href="/" className={`${isActive('/') ? 'text-[#d9534f]' : 'text-gray-500 hover:text-[#d9534f]'} transition-colors`}>Home</Link>
          <Link href="/about" className={`${isActive('/about') ? 'text-[#d9534f]' : 'text-gray-500 hover:text-[#d9534f]'} transition-colors`}>About</Link>
          <Link href="/shop" className={`${isActive('/shop') ? 'text-[#d9534f]' : 'text-gray-500 hover:text-[#d9534f]'} transition-colors`}>Shop</Link>
          <Link href="/blog" className={`${isActive('/blog') ? 'text-[#d9534f]' : 'text-gray-500 hover:text-[#d9534f]'} transition-colors`}>Blog</Link>
          <Link href="/contact" className={`${isActive('/contact') ? 'text-[#d9534f]' : 'text-gray-500 hover:text-[#d9534f]'} transition-colors`}>Contacts</Link>
        </div>

        <div className="flex items-center text-gray-600 relative">
          {isSearchOpen ? (
            <form onSubmit={handleSearch} className="flex items-center border-b border-gray-300 pb-1 mr-2">
              <input 
                type="text" 
                autoFocus
                placeholder="Search articles..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-transparent text-xs outline-none w-32 md:w-48 placeholder-gray-400"
              />
              <button type="button" onClick={() => setIsSearchOpen(false)} className="ml-2 text-gray-400 hover:text-[#d9534f]">✕</button>
            </form>
          ) : (
            <button onClick={() => setIsSearchOpen(true)} className="hover:text-[#d9534f] transition-colors">
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