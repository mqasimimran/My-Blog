'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { SkeletonEditorial } from '@/app/components/Skeleton'
import SectionHeader from '@/app/components/ui/SectionHeader'
import { ButtonLink } from '@/app/components/ui/Button'

type Article = {
  id: string
  title: string
  slug: string
  category: string
  excerpt: string
  created_at: string
  feature_image: string | null
}

const formatDate = (iso: string) => new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })

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

  // Nothing marked as featured yet: don't show an empty section on the homepage
  if (!isLoading && articles.length === 0) return null

  const [lead, ...rest] = articles

  return (
    <section className="border-t border-ink-100">
      <div className="container-page section-y">
        <SectionHeader
          title="From the blog"
          meta="(Latest writing)"
          description="Writing on engineering, design, and the journey behind the projects."
          action={<ButtonLink href="/blog" variant="text">Read the blog</ButtonLink>}
        />

        <div className="mt-14">
          {isLoading || !lead ? (
            <SkeletonEditorial />
          ) : (
            <div className={`grid grid-cols-1 gap-6 md:grid-cols-2 ${articles.length >= 3 ? 'lg:grid-cols-3' : ''}`}>
              {articles.map((article) => (
                <Link key={article.id} href={`/blog/${article.slug}`} data-cursor="Read" className="group flex h-full w-full flex-col border border-ink-100 bg-paper-raised transition-colors duration-300 hover:border-ink-900">
                  {article.feature_image && (
                    <div className="relative aspect-video overflow-hidden border-b border-ink-100 bg-ink-50">
                        {/* 16:9 frame. A 16:9 cover (e.g. 1600x900) fills it exactly; any other shape still shows
                            whole, with a soft blurred copy of itself filling the spare space. Never cropped. */}
                        <img src={article.feature_image} alt="" aria-hidden loading="lazy" className="absolute inset-0 h-full w-full scale-125 object-cover opacity-70 blur-2xl" />
                        <img src={article.feature_image} alt={article.title} loading="lazy" className="absolute inset-0 h-full w-full object-contain transition-transform duration-[900ms] ease-[var(--ease-smooth)] group-hover:scale-[1.03]" />
                      </div>
                  )}
                  <div className="flex flex-1 flex-col p-6">
                    <p className="type-meta flex gap-x-4">
                      <span>{article.category}</span>
                      <span>{formatDate(article.created_at)}</span>
                    </p>
                    <h3 className="mt-3 text-xl font-semibold leading-snug tracking-tight text-ink-900 transition-colors duration-300 group-hover:text-accent-600">{article.title}</h3>
                    {article.excerpt && <p className="mt-3 line-clamp-3 text-[15px] leading-relaxed text-ink-700">{article.excerpt}</p>}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
