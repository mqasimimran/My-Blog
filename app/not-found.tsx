'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function NotFound() {
  const router = useRouter()
  const [query, setQuery] = useState('')

  function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    if (query.trim()) {
      router.push(`/blog?q=${encodeURIComponent(query)}`)
    }
  }

  return (
    <main className="min-h-screen bg-white flex items-center justify-center px-6 font-sans">
      <div className="max-w-md w-full text-center">
        <p className="text-[#aa002a] text-8xl font-light tracking-tight mb-4">404</p>
        <h1 className="text-2xl font-light tracking-wide uppercase text-gray-900 mb-3">
          Page Not Found
        </h1>
        <p className="text-sm text-gray-500 leading-relaxed mb-10">
          Whatever you were looking for isn't here — it may have moved, or the link might just be wrong.
        </p>

        <form onSubmit={handleSearch} className="flex gap-2 mb-8">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search the blog..."
            className="flex-1 border border-gray-300 rounded px-4 py-3 text-sm outline-none focus:border-[#aa002a] transition-colors"
          />
          <button
            type="submit"
            className="bg-gray-900 text-white text-xs font-bold uppercase tracking-widest px-5 py-3 rounded hover:bg-[#aa002a] transition-colors"
          >
            Search
          </button>
        </form>

        <div className="flex flex-wrap justify-center gap-4 text-xs font-bold uppercase tracking-widest">
          <Link href="/" className="text-gray-500 hover:text-[#aa002a] transition-colors">Home</Link>
          <span className="text-gray-300">/</span>
          <Link href="/projects" className="text-gray-500 hover:text-[#aa002a] transition-colors">Projects</Link>
          <span className="text-gray-300">/</span>
          <Link href="/blog" className="text-gray-500 hover:text-[#aa002a] transition-colors">Blog</Link>
          <span className="text-gray-300">/</span>
          <Link href="/contact" className="text-gray-500 hover:text-[#aa002a] transition-colors">Contact</Link>
        </div>
      </div>
    </main>
  )
}
