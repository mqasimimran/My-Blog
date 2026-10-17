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
            <div className="grid grid-cols-1 gap-x-12 gap-y-14 lg:grid-cols-12">
              {/* Lead article, large */}
              <Link href={`/blog/${lead.slug}`} data-cursor="Read" className={`group ${rest.length ? 'lg:col-span-7' : 'grid gap-x-12 gap-y-6 lg:col-span-12 lg:grid-cols-12 lg:items-end'}`}>
                {lead.feature_image && (
                  // Covers are designed graphics, so they show whole at their own shape: never cropped.
                  <div className={`w-full overflow-hidden bg-ink-50 ${rest.length ? '' : 'lg:col-span-8'}`}>
                    <img
                      src={lead.feature_image}
                      alt={lead.title}
                      className="h-auto w-full transition-transform duration-[900ms] ease-[var(--ease-smooth)] group-hover:scale-[1.03]"
                    />
                  </div>
                )}
                <div className={rest.length ? '' : 'lg:col-span-4 lg:pb-2'}>
                  <p className={`type-meta flex gap-x-4 ${rest.length ? 'mt-6' : ''}`}>
                    <span>{lead.category}</span>
                    <span>{formatDate(lead.created_at)}</span>
                  </p>
                  <h3 className="type-h3 mt-3 max-w-[28ch] text-ink-900 transition-colors duration-300 group-hover:text-accent-600 md:text-[1.75rem]">{lead.title}</h3>
                  {lead.excerpt && <p className="mt-4 line-clamp-3 max-w-[58ch] text-[15px] leading-relaxed text-ink-700">{lead.excerpt}</p>}
                </div>
              </Link>

              {/* The rest, as a quiet list */}
              {rest.length > 0 && (
                <ul className="flex flex-col lg:col-span-5 lg:self-start">
                  {rest.map((article) => (
                    <li key={article.id} className="border-t border-ink-100 first:border-t-0 first:pt-0 lg:first:border-t lg:pt-8 [&:not(:first-child)]:mt-8">
                      <Link href={`/blog/${article.slug}`} data-cursor="Read" className="group block">
                        <p className="type-meta flex gap-x-4">
                          <span>{article.category}</span>
                          <span>{formatDate(article.created_at)}</span>
                        </p>
                        <h3 className="type-h3 mt-3 text-ink-900 transition-colors duration-300 group-hover:text-accent-600">{article.title}</h3>
                        {article.excerpt && <p className="mt-3 line-clamp-2 text-[15px] leading-relaxed text-ink-700">{article.excerpt}</p>}
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
