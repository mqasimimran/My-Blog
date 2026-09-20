'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'

type Article = {
  id: string
  title: string
  slug: string
  category: string
  excerpt: string
  created_at: string
  feature_image: string | null
}

export default function FeaturedBlogPosts() {
  const [articles, setArticles] = useState<Article[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function fetchFeaturedArticles() {
      const { data, error } = await supabase
        .from('articles')
        .select('id, title, slug, category, excerpt, created_at, feature_image')
        .eq('published', true)
        .eq('featured', true)
        .order('created_at', { ascending: false })
        .limit(3)

      if (error) console.error('Error fetching featured articles:', error)
      else setArticles(data || [])
      setIsLoading(false)
    }

    fetchFeaturedArticles()
  }, [])

  // Nothing marked as featured yet — don't show an empty section on the homepage
  if (!isLoading && articles.length === 0) return null

  return (
    <section className="max-w-7xl mx-auto px-6 py-20 font-sans bg-slate-50 border-t border-gray-100">

      <div className="flex flex-col lg:flex-row lg:items-end justify-between mb-12 gap-8">
        <div className="max-w-lg">
          <h2 className="text-3xl font-light tracking-wide uppercase text-gray-900 mb-3">
            From The Blog
          </h2>
          <p className="text-sm text-gray-500 leading-relaxed">
            Writing on engineering, design, and the journey behind the projects.
          </p>
        </div>
        <Link
          href="/blog"
          className="text-[10px] font-bold tracking-widest uppercase text-gray-900 hover:text-[#aa002a] transition-colors flex items-center gap-1 shrink-0"
        >
          Read The Blog ↗
        </Link>
      </div>

      {isLoading ? (
        <div className="text-center py-20 text-gray-400 text-xs font-mono uppercase tracking-widest">
          Loading featured posts...
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {articles.map((article) => (
            <Link
              href={`/blog/${article.slug}`}
              key={article.id}
              className="group bg-white border border-gray-200 rounded-xl overflow-hidden flex flex-col shadow-sm hover:shadow-md transition-shadow"
            >
              {article.feature_image && (
                <div className="w-full h-44 overflow-hidden bg-gray-100">
                  <img
                    src={article.feature_image}
                    alt={article.title}
                    className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
              )}
              <div className="p-6 flex flex-col flex-grow">
                <span className="text-[10px] font-bold tracking-widest uppercase text-[#aa002a] mb-2">
                  {article.category}
                </span>
                <h3 className="text-lg font-medium text-gray-900 mb-2 leading-snug group-hover:text-[#aa002a] transition-colors">
                  {article.title}
                </h3>
                {article.excerpt && (
                  <p className="text-sm text-gray-500 leading-relaxed flex-grow line-clamp-3">
                    {article.excerpt}
                  </p>
                )}
                <span className="text-[10px] font-bold uppercase tracking-widest text-gray-900 group-hover:text-[#aa002a] transition-colors mt-4">
                  Read Article ↗
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}

    </section>
  )
}
