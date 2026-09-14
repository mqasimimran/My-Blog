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

const DAILY_QUOTES = [
  { text: "What is meant for me will never miss me, and what misses me was never meant for me.", author: "Imam Al-Shafi'i" },
  { text: "Do not let your difficulties fill you with anxiety; after all, it is only in the darkest nights that stars shine more brilliantly.", author: "Ali ibn Abi Talib" },
  { text: "Knowledge is that which benefits, not that which is memorized.", author: "Imam Al-Shafi'i" },
  { text: "Yesterday I was clever, so I wanted to change the world. Today I am wise, so I am changing myself.", author: "Rumi" },
  { text: "The wound is the place where the Light enters you.", author: "Rumi" },
  { text: "A person's true wealth is the good they do in the world.", author: "Prophet Muhammad (PBUH)" },
  { text: "Patience is not the ability to wait, but the ability to keep a good attitude while waiting.", author: "Unknown" }
]

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

      if (error) {
        console.error('Error fetching blogs:', error)
      } else {
        setArticles(data || [])
      }
      setIsLoading(false)
    }

    fetchPublishedArticles()
  }, [])

  const filteredArticles = activeCategory === 'All' 
    ? articles 
    : articles.filter(article => article.category === activeCategory)

  // Fully updated category list
  const categories = [
    'All', 
    'Engineering', 
    'Design', 
    'Productivity', 
    'Leadership', 
    'Personal Growth', 
    'Game Development', 
    'Artificial Intelligence'
  ]

  return (
    <main className="min-h-screen bg-transparent pt-24 pb-20 font-sans w-full overflow-x-hidden">
      
      <div className="max-w-4xl mx-auto px-4 md:px-6 flex flex-col items-center text-center mb-10">
        <h1 className="text-5xl md:text-7xl font-serif font-bold text-gray-900 tracking-[0.1em] uppercase mb-8">
          EDITORIAL
        </h1>
        
        <p className="text-gray-500 font-serif italic text-lg md:text-xl max-w-2xl leading-relaxed transition-opacity duration-500">
          "{quote.text}"
          <span className="block not-italic font-sans text-[10px] font-bold tracking-[0.2em] uppercase text-gray-400 mt-4">
            — {quote.author}
          </span>
        </p>
      </div>

      <div className="w-full border-b border-gray-200 mb-16">
        {/* Added gap-y-6 so wrapped items have perfect vertical spacing */}
        <div className="max-w-5xl mx-auto px-4 flex flex-wrap items-center justify-center gap-x-6 gap-y-6 pb-4">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`text-[10px] font-bold tracking-[0.15em] uppercase transition-colors relative top-[17px] ${
                activeCategory === cat 
                  ? 'text-gray-900 border-b-2 border-gray-900 pb-3' 
                  : 'text-gray-400 hover:text-gray-600 pb-3'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <div className="text-center py-20 text-gray-400 text-xs font-mono uppercase tracking-widest">
          Loading archive...
        </div>
      ) : filteredArticles.length === 0 ? (
        <div className="text-center py-20 text-gray-400 text-sm">
          No articles found for this category.
        </div>
      ) : (
        <div className="flex flex-col gap-20">
          {filteredArticles.map((article) => (
            <article key={article.id} className="w-full flex flex-col items-center">
              
              {article.feature_image && (
                <Link href={`/blog/${article.slug}`} className="w-full block mb-4">
                  <img 
                    src={article.feature_image} 
                    alt={article.title}
                    className="w-full h-auto max-h-[80vh] object-cover transition-opacity hover:opacity-90"
                  />
                </Link>
              )}

              <div className="flex flex-col items-center gap-1.5 max-w-xl text-center w-full px-4">
                <div className="text-[10px] font-bold tracking-[0.2em] uppercase text-gray-400">
                  {article.category}
                </div>
                
                <Link href={`/blog/${article.slug}`} className="no-underline">
                  <h2 className="text-3xl md:text-4xl font-sans font-bold text-gray-900 hover:text-gray-600 transition-colors tracking-tight leading-none">
                    {article.title}
                  </h2>
                </Link>

                <div className="w-6 h-[1px] bg-gray-300 my-1"></div>

                <div className="text-[11px] text-gray-400 italic">
                  Posted On {new Date(article.created_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                </div>
                
                {article.excerpt && article.excerpt.trim() !== '' && (
                  <p className="text-gray-500 text-sm font-light leading-snug mt-2">
                    {article.excerpt}
                  </p>
                )}
              </div>

            </article>
          ))}
        </div>
      )}
    </main>
  )
}