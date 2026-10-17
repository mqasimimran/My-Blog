'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import NewsletterSignup from '@/app/components/NewsletterSignup'
import { SkeletonBlogList } from '@/app/components/Skeleton'
import FilterTabs from '@/app/components/ui/FilterTabs'
import EmptyState from '@/app/components/EmptyState'
import SplitText from '@/app/components/ui/SplitText'

type Article = {
  id: string
  title: string
  slug: string
  category: string
  excerpt: string
  created_at: string
  feature_image: string | null
}

const DAILY_QUOTES = [
  { text: "What is meant for me will never miss me, and what misses me was never meant for me.", author: "Imam Al-Shafi'i" },
  { text: "Do not let your difficulties fill you with anxiety; after all, it is only in the darkest nights that stars shine more brilliantly.", author: "Ali ibn Abi Talib" },
  { text: "Knowledge is that which benefits, not that which is memorized.", author: "Imam Al-Shafi'i" },
  { text: "Yesterday I was clever, so I wanted to change the world. Today I am wise, so I am changing myself.", author: "Rumi" },
  { text: "The wound is the place where the Light enters you.", author: "Rumi" },
  { text: "A person's true wealth is the good they do in the world.", author: "Prophet Muhammad (PBUH)" },
  { text: "Patience is not the ability to wait, but the ability to keep a good attitude while waiting.", author: "Unknown" },
]

const CATEGORIES = ['All', 'Engineering', 'Design', 'Productivity', 'Leadership', 'Personal Growth', 'Game Development', 'Artificial Intelligence'].map(
  (c) => ({ key: c, label: c })
)

const formatDate = (iso: string) => new Date(iso).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })

export default function BlogPage() {
  const [articles, setArticles] = useState<Article[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [activeCategory, setActiveCategory] = useState('All')
  const [quote, setQuote] = useState(DAILY_QUOTES[0])

  useEffect(() => {
    const dayOfMonth = new Date().getDate()
    setQuote(DAILY_QUOTES[dayOfMonth % DAILY_QUOTES.length])

    async function fetchPublishedArticles() {
      const { data, error } = await supabase
        .from('articles')
        .select('id, title, slug, category, excerpt, created_at, feature_image')
        .eq('published', true)
        .order('created_at', { ascending: false })

      if (error) console.error('Error fetching blogs:', error)
      else setArticles(data || [])
      setIsLoading(false)
    }

    fetchPublishedArticles()
  }, [])

  const filteredArticles = activeCategory === 'All' ? articles : articles.filter((article) => article.category === activeCategory)

  return (
    <main>
      <header className="container-page grid gap-10 pb-12 pt-12 md:pb-16 md:pt-20 lg:grid-cols-12 lg:items-end">
        <h1 className="type-display text-ink-900 lg:col-span-6"><SplitText text={"Editorial"} /></h1>
        {/* The quote of the day */}
        <figure className="lg:col-span-5 lg:col-start-8">
          <blockquote className="text-lg leading-relaxed text-ink-700">&ldquo;{quote.text}&rdquo;</blockquote>
          <figcaption className="type-meta mt-3">{quote.author}</figcaption>
        </figure>
      </header>

      <section className="container-page pb-24">
        <FilterTabs label="Filter articles by category" options={CATEGORIES} value={activeCategory} onChange={setActiveCategory} />

        <div className="mt-12">
          {isLoading ? (
            <SkeletonBlogList count={3} />
          ) : filteredArticles.length === 0 ? (
            <EmptyState icon="search" title="No articles in this category yet" description="Try another category." />
          ) : (
            <div className="flex flex-col">
              {filteredArticles.map((article) => (
                <article key={article.id} className="border-t border-ink-100 py-10 first:border-t-0 first:pt-0 md:py-14">
                  <Link href={`/blog/${article.slug}`} data-cursor="Read" className="group grid gap-x-12 gap-y-6 md:grid-cols-12 md:items-center">
                    {article.feature_image && (
                      <div className="overflow-hidden bg-ink-50 md:col-span-5">
                        <img
                          src={article.feature_image}
                          alt={article.title}
                          loading="lazy"
                          className="h-auto w-full transition-transform duration-[900ms] ease-[var(--ease-smooth)] group-hover:scale-[1.03]"
                        />
                      </div>
                    )}
                    <div className={article.feature_image ? 'md:col-span-7' : 'md:col-span-9'}>
                      <p className="type-meta flex gap-x-4">
                        <span>{article.category}</span>
                        <time dateTime={article.created_at}>{formatDate(article.created_at)}</time>
                      </p>
                      <h2 className="type-h2 mt-3 max-w-[22ch] text-ink-900 transition-colors duration-300 group-hover:text-accent-600 md:text-[2.25rem]">{article.title}</h2>
                      {article.excerpt && article.excerpt.trim() !== '' && (
                        <p className="mt-4 max-w-[58ch] text-base leading-relaxed text-ink-700">{article.excerpt}</p>
                      )}
                    </div>
                  </Link>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>
      <NewsletterSignup />
    </main>
  )
}
