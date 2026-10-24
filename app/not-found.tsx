'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import SplitText from '@/app/components/ui/SplitText'
import { useLocale } from '@/app/components/LocaleProvider'
import NotFoundGame from '@/app/components/NotFoundGame'

export default function NotFound() {
  const { tx } = useLocale()
  const router = useRouter()
  const [query, setQuery] = useState('')

  function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    if (query.trim()) {
      router.push(`/blog?q=${encodeURIComponent(query)}`)
    }
  }

  return (
    <main className="container-page flex min-h-[70dvh] flex-col justify-center pb-24 pt-12">
      <p className="font-mono text-sm text-accent-600">404</p>
      <h1 className="type-display mt-4 text-ink-900"><SplitText text={tx("Page not found")} /></h1>
      <p className="type-lead mt-6 max-w-[48ch]">{tx("Whatever you were looking for isn’t here. It may have moved, or the link might just be wrong.")}</p>

      <form onSubmit={handleSearch} role="search" className="mt-10 flex max-w-xl flex-col gap-3 sm:flex-row">
        <label htmlFor="nf-search" className="sr-only">{tx("Search the blog")}</label>
        <input
          id="nf-search"
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={tx("Search the blog")}
          className="h-12 flex-1 border border-ink-500 bg-paper-raised px-4 text-base text-ink-900 outline-none transition-colors duration-200 placeholder:text-ink-500 focus:border-accent-600"
        />
        <button type="submit" className="h-12 bg-ink-900 px-6 text-sm font-medium tracking-tight text-paper transition-[background-color,color] duration-300 hover:bg-accent-600 hover:text-on-accent">
          {tx("Search")}
        </button>
      </form>

      <nav aria-label={tx("Helpful links")} className="mt-10 flex flex-wrap gap-x-8 gap-y-3 text-sm font-medium">
        {[['/', 'Home'], ['/projects', 'Projects'], ['/blog', 'Blog'], ['/contact', 'Contact']].map(([href, label]) => (
          <Link key={href} href={href} className="link-draw text-ink-900">{tx(label)}</Link>
        ))}
      </nav>
      <NotFoundGame />
    </main>
  )
}
