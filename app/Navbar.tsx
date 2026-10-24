"use client"

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useState, useMemo, useEffect, useRef } from 'react'
import { CaretDown, List, MagnifyingGlass, X } from '@phosphor-icons/react'
import { supabase } from '@/lib/supabase'
import DarkModeToggle from '@/app/components/DarkModeToggle'
import LanguageToggle from '@/app/components/LanguageToggle'
import { useLocale } from '@/app/components/LocaleProvider'
import type { Key } from '@/lib/i18n'
import { siteConfig } from '@/site.config'

type SearchItem = { title: string; type: string; url: string }

// Menu structure. Six entries plus Contact: related pages are grouped (Work, About) so the bar stays
// readable on laptops; a group opens a small menu. Labels live in lib/i18n.ts (English and Urdu).
type Item = { href: string; key: Key; desc?: Key }
type Group = { key: Key; children: Item[] }
const NAV: (Item | Group)[] = [
  { href: '/', key: 'nav.home' },
  { key: 'nav.work', children: [
    { href: '/projects', key: 'nav.projects', desc: 'nav.projects.desc' },
    { href: '/design', key: 'nav.design', desc: 'nav.design.desc' },
    { href: '/wallpapers', key: 'nav.wallpapers', desc: 'nav.wallpapers.desc' },
    { href: '/courses', key: 'nav.courses', desc: 'nav.courses.desc' },
  ] },
  { href: '/blog', key: 'nav.blog' },
  { href: '/shop', key: 'nav.shop' },
  { href: '/services', key: 'nav.services' },
  { key: 'nav.about', children: [
    { href: '/about', key: 'nav.journey', desc: 'nav.journey.desc' },
    { href: '/resume', key: 'nav.resume', desc: 'nav.resume.desc' },
    { href: '/tech-stack', key: 'nav.techStack', desc: 'nav.techStack.desc' },
  ] },
]
const isGroup = (e: Item | Group): e is Group => 'children' in e

export default function Navbar() {
  const pathname = usePathname()
  const router = useRouter()
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [searchableItems, setSearchableItems] = useState<SearchItem[]>([])
  const searchRef = useRef<HTMLInputElement>(null)
  const { t } = useLocale()
  const [openGroup, setOpenGroup] = useState<Key | null>(null)
  const navRef = useRef<HTMLElement>(null)

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

  // Close a group's menu when the page changes, on an outside click, or with Escape.
  useEffect(() => setOpenGroup(null), [pathname])
  useEffect(() => {
    if (!openGroup) return
    const onDown = (e: MouseEvent) => { if (!navRef.current?.contains(e.target as Node)) setOpenGroup(null) }
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpenGroup(null) }
    document.addEventListener('mousedown', onDown)
    window.addEventListener('keydown', onKey)
    return () => { document.removeEventListener('mousedown', onDown); window.removeEventListener('keydown', onKey) }
  }, [openGroup])
  const cell = (active: boolean) => `flex h-full w-full items-center justify-center gap-1.5 whitespace-nowrap px-2 text-[11.5px] font-medium uppercase tracking-[0.08em] transition-colors duration-200 ${active ? 'bg-ink-50 text-ink-900' : 'text-ink-500 hover:bg-ink-50 hover:text-ink-900'}`

  return (
    <>
      <header className="fixed inset-x-0 top-0 z-nav">
        {/* A row of boxed cells, like a printed grid. Contact is the solid cell at the end. */}
        <nav ref={navRef} aria-label="Main" className="relative mx-auto flex h-12 max-w-[1360px] items-stretch border-b border-ink-100 bg-paper/90 backdrop-blur-xl md:border-x">
          <Link href="/" className="flex items-center px-4 font-display text-lg uppercase leading-none tracking-wide text-ink-900 xl:hidden">
            {siteConfig.firstName}
          </Link>

          <ul className="hidden flex-1 items-stretch divide-x divide-ink-100 xl:flex">
            {NAV.map((entry) =>
              isGroup(entry) ? (
                <li key={entry.key} className="relative flex-1" onMouseEnter={() => setOpenGroup(entry.key)} onMouseLeave={() => setOpenGroup((g) => (g === entry.key ? null : g))}>
                  <button
                    type="button"
                    onClick={() => setOpenGroup((g) => (g === entry.key ? null : entry.key))}
                    aria-expanded={openGroup === entry.key}
                    aria-controls={`menu-${entry.key}`}
                    className={cell(entry.children.some((c) => isActive(c.href)))}
                  >
                    {t(entry.key)}
                    <CaretDown size={11} weight="bold" aria-hidden className={`transition-transform duration-200 ${openGroup === entry.key ? 'rotate-180' : ''}`} />
                  </button>
                  {openGroup === entry.key && (
                    <ul id={`menu-${entry.key}`} className="absolute start-[-1px] top-full min-w-[280px] border border-ink-100 bg-paper-raised py-2">
                      {entry.children.map((c) => (
                        <li key={c.href}>
                          <Link href={c.href} aria-current={isActive(c.href) ? 'page' : undefined} className={`block px-5 py-3 transition-colors duration-200 hover:bg-ink-50 ${isActive(c.href) ? 'text-accent-600' : 'text-ink-900'}`}>
                            <span className="block text-sm font-medium">{t(c.key)}</span>
                            {c.desc && <span className="mt-0.5 block text-xs text-ink-500">{t(c.desc)}</span>}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  )}
                </li>
              ) : (
                <li key={entry.href} className="flex-1">
                  <Link href={entry.href} aria-current={isActive(entry.href) ? 'page' : undefined} className={cell(isActive(entry.href))}>
                    {t(entry.key)}
                  </Link>
                </li>
              )
            )}
          </ul>

          <div className="ml-auto flex items-stretch divide-x divide-ink-100 border-l border-ink-100 xl:ml-0">
            <button
              onClick={() => setIsSearchOpen((v) => !v)}
              aria-label={isSearchOpen ? t('nav.closeSearch') : t('nav.openSearch')}
              aria-expanded={isSearchOpen}
              className="grid w-12 place-items-center text-ink-700 transition-colors duration-200 hover:bg-ink-50 hover:text-ink-900"
            >
              <MagnifyingGlass size={18} weight="regular" aria-hidden />
            </button>
            <div className="grid w-12 place-items-center">
              <DarkModeToggle />
            </div>
            <LanguageToggle className="w-12" />
            <button
              onClick={() => setIsMenuOpen(true)}
              aria-label={t('nav.openMenu')}
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
            {t('nav.contact')}
          </Link>

          {/* Search panel, anchored under the bar */}
          {isSearchOpen && (
            <div className="absolute inset-x-0 top-full border-x border-b border-ink-100 bg-paper-raised">
              <form onSubmit={handleSearch} role="search" className="flex items-center gap-3 border-b border-ink-100 px-4">
                <MagnifyingGlass size={18} aria-hidden className="shrink-0 text-ink-500" />
                <input
                  ref={searchRef}
                  type="text"
                  aria-label={t('nav.searchLabel')}
                  placeholder={t('nav.searchPlaceholder')}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="h-14 w-full bg-transparent text-base text-ink-900 outline-none placeholder:text-ink-500"
                />
                <button type="button" onClick={closeAll} aria-label={t('nav.closeSearch')} className="grid h-9 w-9 shrink-0 place-items-center text-ink-500 hover:text-ink-900">
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
          <button onClick={() => setIsMenuOpen(false)} aria-label={t('nav.closeMenu')} className="grid w-12 place-items-center border-l border-ink-100 text-ink-900 hover:bg-ink-50">
            <X size={22} weight="regular" aria-hidden />
          </button>
        </div>
        <ul className="flex flex-1 flex-col justify-center overflow-y-auto px-5 pb-12 md:px-8">
          {(() => {
            // Full-screen menu: grouped pages sit under a small label (Work, About).
            const rows: ({ kind: 'label'; key: Key } | { kind: 'link'; item: Item })[] = []
            for (const e of NAV) {
              if (isGroup(e)) { rows.push({ kind: 'label', key: e.key }); e.children.forEach((c) => rows.push({ kind: 'link', item: c })) }
              else rows.push({ kind: 'link', item: e })
            }
            rows.push({ kind: 'link', item: { href: '/contact', key: 'nav.contact' } })
            return rows.map((row, i) =>
              row.kind === 'label' ? (
                <li key={`label-${row.key}`} className="pt-5 pb-1 type-meta">{t(row.key)}</li>
              ) : (
                <li key={row.item.href} className="overflow-hidden border-b border-ink-100">
                  <Link
                    href={row.item.href}
                    tabIndex={isMenuOpen ? 0 : -1}
                    aria-current={isActive(row.item.href) ? 'page' : undefined}
                    onClick={() => setIsMenuOpen(false)}
                    style={{ transitionDelay: isMenuOpen ? `${120 + i * 40}ms` : '0ms' }}
                    className={`block py-2 font-display text-[clamp(2rem,9vw,3.5rem)] uppercase leading-[0.95] transition-[transform,opacity,color] duration-700 ease-[var(--ease-smooth)] ${
                      isMenuOpen ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0'
                    } ${isActive(row.item.href) ? 'text-accent-600' : 'text-ink-900 hover:text-accent-600'}`}
                  >
                    {t(row.item.key)}
                  </Link>
                </li>
              )
            )
          })()}
        </ul>
      </div>
    </>
  )
}
