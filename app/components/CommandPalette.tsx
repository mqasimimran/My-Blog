'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

type Item = { title: string; type: string; url: string }

const STATIC_LINKS: Item[] = [
  { title: 'Home', type: 'Page', url: '/' },
  { title: 'My Journey', type: 'Page', url: '/about' },
  { title: 'Projects', type: 'Page', url: '/projects' },
  { title: 'Design Gallery', type: 'Page', url: '/design' },
  { title: 'Blog', type: 'Page', url: '/blog' },
  { title: 'Services', type: 'Page', url: '/services' },
  { title: 'Roadmap', type: 'Page', url: '/roadmap' },
  { title: 'Tech Stack', type: 'Page', url: '/tech-stack' },
  { title: 'Resume', type: 'Page', url: '/resume' },
  { title: 'Contact', type: 'Page', url: '/contact' },
]

export default function CommandPalette() {
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [dynamicItems, setDynamicItems] = useState<Item[]>([])
  const [activeIndex, setActiveIndex] = useState(0)

  const toggle = useCallback(() => setIsOpen((prev) => !prev), [])

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        toggle()
      }
      if (e.key === 'Escape') setIsOpen(false)
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [toggle])

  useEffect(() => {
    if (!isOpen || dynamicItems.length > 0) return

    async function fetchItems() {
      const [projects, articles] = await Promise.all([
        supabase.from('projects').select('title, slug').limit(20),
        supabase.from('articles').select('title, slug').eq('published', true).limit(20),
      ])

      setDynamicItems([
        ...(projects.data || []).map((p) => ({ title: p.title, type: 'Project', url: `/projects/${p.slug}` })),
        ...(articles.data || []).map((a) => ({ title: a.title, type: 'Blog', url: `/blog/${a.slug}` })),
      ])
    }

    fetchItems()
  }, [isOpen, dynamicItems.length])

  const allItems = [...STATIC_LINKS, ...dynamicItems]
  const q = query.trim().toLowerCase()
  const filtered = q ? allItems.filter((i) => i.title.toLowerCase().includes(q)) : STATIC_LINKS

  function go(url: string) {
    router.push(url)
    setIsOpen(false)
    setQuery('')
  }

  useEffect(() => {
    setActiveIndex(0)
  }, [query])

  function handleKeyNav(e: React.KeyboardEvent) {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setActiveIndex((i) => Math.min(i + 1, filtered.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setActiveIndex((i) => Math.max(i - 1, 0))
    } else if (e.key === 'Enter' && filtered[activeIndex]) {
      go(filtered[activeIndex].url)
    }
  }

  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm z-[100] flex items-start justify-center pt-[15vh] px-4"
      onClick={() => setIsOpen(false)}
    >
      <div
        className="bg-paper rounded-none shadow-2xl w-full max-w-lg overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <input
          type="text"
          autoFocus
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyNav}
          placeholder="Jump to a page, project, or post..."
          className="w-full px-5 py-4 text-base outline-none border-b border-ink-100"
        />
        <div className="max-h-80 overflow-y-auto py-2">
          {filtered.length === 0 ? (
            <p className="text-sm text-ink-300 text-center py-8">No matches.</p>
          ) : (
            filtered.map((item, i) => (
              <button
                key={`${item.type}-${item.title}`}
                onClick={() => go(item.url)}
                onMouseEnter={() => setActiveIndex(i)}
                className={`w-full text-left px-5 py-3 flex items-center justify-between transition-colors ${
                  i === activeIndex ? 'bg-paper' : ''
                }`}
              >
                <span className="text-sm text-ink-900">{item.title}</span>
                <span className="text-[10px] font-bold uppercase tracking-widest text-accent-600">{item.type}</span>
              </button>
            ))
          )}
        </div>
        <div className="border-t border-ink-100 px-5 py-2.5 flex items-center justify-between text-[10px] text-ink-300 font-mono">
          <span>↑↓ navigate · ↵ select · esc close</span>
          <span>⌘K</span>
        </div>
      </div>
    </div>
  )
}
