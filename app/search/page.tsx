'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { SkeletonTextCardGrid } from '@/app/components/Skeleton'
import EmptyState from '@/app/components/EmptyState'

type Result = {
  id: string
  title: string
  type: 'Project' | 'Blog' | 'Design' | 'Service'
  url: string
  description?: string | null
}

function SearchResults() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const initialQuery = searchParams.get('q') || ''

  const [query, setQuery] = useState(initialQuery)
  const [results, setResults] = useState<Result[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [activeType, setActiveType] = useState<'All' | Result['type']>('All')

  useEffect(() => {
    async function runSearch() {
      setIsLoading(true)

      const [projectsRes, articlesRes, designsRes, servicesRes] = await Promise.all([
        supabase.from('projects').select('id, title, slug, description'),
        supabase.from('articles').select('id, title, slug, excerpt').eq('published', true),
        supabase.from('designs').select('id, title, category'),
        supabase.from('services').select('id, name, slug, tagline').eq('active', true),
      ])

      const allResults: Result[] = [
        ...(projectsRes.data || []).map((p) => ({ id: p.id, title: p.title, type: 'Project' as const, url: `/projects/${p.slug}`, description: p.description })),
        ...(articlesRes.data || []).map((a) => ({ id: a.id, title: a.title, type: 'Blog' as const, url: `/blog/${a.slug}`, description: a.excerpt })),
        ...(designsRes.data || []).map((d) => ({ id: d.id, title: d.title, type: 'Design' as const, url: `/design?item=${d.id}`, description: d.category })),
        ...(servicesRes.data || []).map((s) => ({ id: s.id, title: s.name, type: 'Service' as const, url: s.slug ? `/services/${s.slug}` : '/services', description: s.tagline })),
      ]

      setResults(allResults)
      setIsLoading(false)
    }

    runSearch()
  }, [])

  function handleSearchSubmit(e: React.FormEvent) {
    e.preventDefault()
    router.push(`/search?q=${encodeURIComponent(query)}`)
  }

  const q = query.trim().toLowerCase()
  const matched = q
    ? results.filter((r) => r.title.toLowerCase().includes(q) || r.description?.toLowerCase().includes(q))
    : []

  const filtered = activeType === 'All' ? matched : matched.filter((r) => r.type === activeType)

  const typeCounts = {
    Project: matched.filter((r) => r.type === 'Project').length,
    Blog: matched.filter((r) => r.type === 'Blog').length,
    Design: matched.filter((r) => r.type === 'Design').length,
    Service: matched.filter((r) => r.type === 'Service').length,
  }

  const tabs: Array<'All' | Result['type']> = ['All', 'Project', 'Blog', 'Design', 'Service']

  return (
    <main className="min-h-screen bg-paper font-sans pt-24 pb-24 px-6">
      <div className="max-w-4xl mx-auto">

        <form onSubmit={handleSearchSubmit} className="mb-10">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search projects, blog posts, design work, services..."
            autoFocus
            className="w-full text-2xl md:text-3xl font-light border-b-2 border-ink-100 focus:border-accent-600 outline-none py-3 transition-colors"
          />
        </form>

        {q && !isLoading && (
          <div className="flex flex-wrap gap-2 mb-10">
            {tabs.map((tab) => {
              const count = tab === 'All' ? matched.length : typeCounts[tab]
              return (
                <button
                  key={tab}
                  onClick={() => setActiveType(tab)}
                  className={`text-[11px] font-bold uppercase tracking-widest px-4 py-2 rounded-full transition-colors ${
                    activeType === tab ? 'bg-accent-600 text-white' : 'bg-ink-100 text-ink-500 hover:bg-ink-100'
                  }`}
                >
                  {tab} ({count})
                </button>
              )
            })}
          </div>
        )}

        {isLoading ? (
          <SkeletonTextCardGrid count={6} columns={2} />
        ) : !q ? (
          <EmptyState icon="search" title="Search the whole site" description="Projects, blog posts, design work, and services — all in one place." />
        ) : filtered.length === 0 ? (
          <EmptyState icon="search" title={`No results for "${query}"`} description="Try a different word, or browse from the main nav instead." />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {filtered.map((result) => (
              <Link
                key={`${result.type}-${result.id}`}
                href={result.url}
                className="border border-ink-100 rounded-none p-6 hover:border-accent-600/40 hover:shadow-sm transition-all block"
              >
                <span className="text-[10px] font-bold uppercase tracking-widest text-accent-600 mb-2 block">
                  {result.type}
                </span>
                <h2 className="text-base font-medium text-ink-900 mb-1 leading-snug">{result.title}</h2>
                {result.description && (
                  <p className="text-sm text-ink-500 line-clamp-2">{result.description}</p>
                )}
              </Link>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}

export default function SearchPage() {
  return (
    <Suspense fallback={
      <main className="min-h-screen bg-paper flex items-center justify-center">
        <p className="text-ink-300 text-xs font-mono uppercase tracking-widest">Loading...</p>
      </main>
    }>
      <SearchResults />
    </Suspense>
  )
}
