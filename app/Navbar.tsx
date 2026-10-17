"use client"

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useState, useMemo, useEffect, useRef } from 'react'
import { List, MagnifyingGlass, X } from '@phosphor-icons/react'
import { supabase } from '@/lib/supabase'
import DarkModeToggle from '@/app/components/DarkModeToggle'
import { siteConfig } from '@/site.config'

type SearchItem = { title: string; type: string; url: string }

// Labels and order are part of the site's structure. Do not rename without a reason.
const NAV = [
  { href: '/', label: 'Home' },
  { href: '/about', label: 'My Journey' },
  { href: '/shop', label: 'Shop' },
  { href: '/design', label: 'Design' },
  { href: '/blog', label: 'Blog' },
  { href: '/projects', label: 'Projects' },
  { href: '/tech-stack', label: 'Tech Stack' },
  { href: '/resume', label: 'Resume' },
  { href: '/services', label: 'Services' },
  { href: '/contact', label: 'Contact' },
]

export default function Navbar() {
  const pathname = usePathname()
  const router = useRouter()
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [searchableItems, setSearchableItems] = useState<SearchItem[]>([])
  const searchRef = useRef<HTMLInputElement>(null)

  // "/blog/some-post" still highlights Blog; "/" only matches the home page itself.
  const isActive = (path: string) => (path === '/' ? pathname === '/' : pathname === path || pathname.startsWith(path + '/'))

  // Pull live titles from Supabase so search never goes stale when new
  // content is published. Fetched once, when the search box is first opened.
  useEffect(() => {
    if (!isSearchOpen || searchableItems.length > 0) return

    async function fetchSearchableItems() {
      const [projectsRes, articlesRes, designsRes, servicesRes] = await Promise.all([
        supabase.from('projects').select('title, slug'),
        supabase.from('articles').select('title, slug').eq('published', true),
        supabase.from('designs').select('id, title, category'),
        supabase.from('services').select('name, slug').eq('active', true),
      ])

      const items: SearchItem[] = [
        ...(projectsRes.data || []).map((p) => ({ title: p.title, type: 'Project', url: `/projects/${p.slug}` })),
        ...(articlesRes.data || []).map((a) => ({ title: a.title, type: 'Blog', url: `/blog/${a.slug}` })),
        ...(designsRes.data || []).map((d) => ({ title: d.title, type: 'Design', url: `/design?item=${d.id}` })),
        ...(servicesRes.data || []).map((s) => ({ title: s.name, type: 'Service', url: s.slug ? `/services/${s.slug}` : '/services' })),
      ]
      setSearchableItems(items)
    }

    fetchSearchableItems()
  }, [isSearchOpen, searchableItems.length])

  const filteredSuggestions = useMemo(() => {
    if (!searchQuery.trim()) return []
    return searchableItems.filter((item) => item.title.toLowerCase().includes(searchQuery.toLowerCase())).slice(0, 6)
  }, [searchQuery, searchableItems])

  const closeAll = () => {
    setIsSearchOpen(false)
    setSearchQuery('')
    setIsMenuOpen(false)
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery)}`)
      closeAll()
    }
  }

  const handleSelectSuggestion = (url: string) => {
    router.push(url)
    closeAll()
  }

  // Close menus when the page changes, and on Escape.
  useEffect(() => {
    setIsMenuOpen(false)
    setIsSearchOpen(false)
  }, [pathname])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeAll()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  // Stop the page behind the full-screen menu from scrolling.
  useEffect(() => {
    document.body.style.overflow = isMenuOpen ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [isMenuOpen])

  useEffect(() => {
    if (isSearchOpen) searchRef.current?.focus()
  }, [isSearchOpen])

  const links = NAV.filter((n) => n.href !== '/contact')

  return (
    <>
      <header className="fixed inset-x-0 top-0 z-nav">
        {/* A row of boxed cells, like a printed grid. Contact is the solid cell at the end. */}
        <nav aria-label="Main" className="relative mx-auto flex h-12 max-w-[1360px] items-stretch border-b border-ink-100 bg-paper/90 backdrop-blur-xl md:border-x">
          <Link href="/" className="flex items-center px-4 font-display text-lg uppercase leading-none tracking-wide text-ink-900 xl:hidden">
            {siteConfig.firstName}
          </Link>

          <ul className="hidden flex-1 items-stretch divide-x divide-ink-100 xl:flex">
            {links.map((item) => (
              <li key={item.href} className="flex-1">
                <Link
                  href={item.href}
                  aria-current={isActive(item.href) ? 'page' : undefined}
                  className={`flex h-full items-center justify-center whitespace-nowrap px-2 text-[11.5px] font-medium uppercase tracking-[0.08em] transition-colors duration-200 ${
                    isActive(item.href) ? 'bg-ink-50 text-ink-900' : 'text-ink-500 hover:bg-ink-50 hover:text-ink-900'
                  }`}
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>

          <div className="ml-auto flex items-stretch divide-x divide-ink-100 border-l border-ink-100 xl:ml-0">
            <button
              onClick={() => setIsSearchOpen((v) => !v)}
              aria-label={isSearchOpen ? 'Close search' : 'Open search'}
              aria-expanded={isSearchOpen}
              className="grid w-12 place-items-center text-ink-700 transition-colors duration-200 hover:bg-ink-50 hover:text-ink-900"
            >
              <MagnifyingGlass size={18} weight="regular" aria-hidden />
            </button>
            <div className="grid w-12 place-items-center">
              <DarkModeToggle />
            </div>
            <button
              onClick={() => setIsMenuOpen(true)}
              aria-label="Open menu"
              aria-expanded={isMenuOpen}
              className="grid w-12 place-items-center text-ink-900 transition-colors duration-200 hover:bg-ink-50 xl:hidden"
            >
              <List size={20} weight="regular" aria-hidden />
            </button>
          </div>

          <Link
            href="/contact"
            aria-current={isActive('/contact') ? 'page' : undefined}
            className="hidden w-[170px] items-center justify-center bg-ink-900 text-[11.5px] font-medium uppercase tracking-[0.08em] text-paper transition-colors duration-300 hover:bg-accent-600 hover:text-on-accent xl:flex"
          >
            Contact
          </Link>

          {/* Search panel, anchored under the bar */}
          {isSearchOpen && (
            <div className="absolute inset-x-0 top-full border-x border-b border-ink-100 bg-paper-raised">
              <form onSubmit={handleSearch} role="search" className="flex items-center gap-3 border-b border-ink-100 px-4">
                <MagnifyingGlass size={18} aria-hidden className="shrink-0 text-ink-500" />
                <input
                  ref={searchRef}
                  type="text"
                  aria-label="Search the site"
                  placeholder="Search projects, posts, design, services"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="h-14 w-full bg-transparent text-base text-ink-900 outline-none placeholder:text-ink-500"
                />
                <button type="button" onClick={closeAll} aria-label="Close search" className="grid h-9 w-9 shrink-0 place-items-center text-ink-500 hover:text-ink-900">
                  <X size={18} aria-hidden />
                </button>
              </form>
              {filteredSuggestions.length > 0 && (
                <ul className="py-2">
                  {filteredSuggestions.map((item) => (
                    <li key={item.url}>
                      <button
                        onClick={() => handleSelectSuggestion(item.url)}
                        className="flex w-full items-baseline justify-between gap-6 px-4 py-3 text-left transition-colors duration-200 hover:bg-ink-50"
                      >
                        <span className="truncate text-sm font-medium text-ink-900">{item.title}</span>
                        <span className="type-meta shrink-0">{item.type}</span>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </nav>
      </header>

      {/* Full-screen menu (below 1280px) */}
      <div
        className={`fixed inset-0 z-overlay flex flex-col bg-paper transition-[opacity,visibility] duration-500 ease-[var(--ease-smooth)] xl:hidden ${
          isMenuOpen ? 'visible opacity-100' : 'invisible opacity-0'
        }`}
        aria-hidden={!isMenuOpen}
      >
        <div className="flex h-12 shrink-0 items-stretch justify-between border-b border-ink-100">
          <span className="flex items-center px-4 font-display text-lg uppercase leading-none tracking-wide text-ink-900">{siteConfig.firstName}</span>
          <button onClick={() => setIsMenuOpen(false)} aria-label="Close menu" className="grid w-12 place-items-center border-l border-ink-100 text-ink-900 hover:bg-ink-50">
            <X size={22} weight="regular" aria-hidden />
          </button>
        </div>
        <ul className="flex flex-1 flex-col justify-center overflow-y-auto px-5 pb-12 md:px-8">
          {NAV.map((item, i) => (
            <li key={item.href} className="overflow-hidden border-b border-ink-100">
              <Link
                href={item.href}
                tabIndex={isMenuOpen ? 0 : -1}
                aria-current={isActive(item.href) ? 'page' : undefined}
                onClick={() => setIsMenuOpen(false)}
                style={{ transitionDelay: isMenuOpen ? `${120 + i * 45}ms` : '0ms' }}
                className={`block py-2 font-display text-[clamp(2.25rem,10vw,4rem)] uppercase leading-[0.95] transition-[transform,opacity,color] duration-700 ease-[var(--ease-smooth)] ${
                  isMenuOpen ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0'
                } ${isActive(item.href) ? 'text-accent-600' : 'text-ink-900 hover:text-accent-600'}`}
              >
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </>
  )
}
