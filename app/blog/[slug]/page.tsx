import { supabase } from '@/lib/supabase'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import type { Metadata } from 'next'
import ShareButtons from '@/app/components/ShareButtons'
import ReactionButton from '@/app/components/ReactionButton'
import Comments from '@/app/components/Comments'

const SITE_URL = 'https://www.muhammadqasimimran.me/'

function calculateReadTime(html: string | null): string {
  if (!html) return '1 min read'
  const text = html.replace(/<[^>]+>/g, ' ')
  const wordCount = text.trim().split(/\s+/).filter(Boolean).length
  const minutes = Math.max(1, Math.round(wordCount / 200))
  return `${minutes} min read`
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  
  const { data: post } = await supabase
    .from('articles')
    .select('title, excerpt')
    .eq('slug', slug)
    .single()

  if (!post) return { title: 'Post Not Found' }

  return {
    title: `${post.title} | Qasmic`,
    description: post.excerpt,
  }
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params

  const { data: article, error } = await supabase
    .from('articles')
    .select('*')
    .eq('slug', slug)
    .single()

  if (error || !article) {
    notFound()
  }

  const { data: relatedArticles } = await supabase
    .from('articles')
    .select('title, slug, feature_image, category')
    .eq('category', article.category)
    .eq('published', true)
    .neq('slug', slug)
    .order('created_at', { ascending: false })
    .limit(3)

  const readTime = calculateReadTime(article.content)

  let seriesArticles: { title: string; slug: string; series_order: number }[] = []
  if (article.series_name) {
    const { data } = await supabase
      .from('articles')
      .select('title, slug, series_order')
      .eq('series_name', article.series_name)
      .eq('published', true)
      .order('series_order', { ascending: true })
    seriesArticles = data || []
  }
  const seriesIndex = seriesArticles.findIndex((a) => a.slug === slug)
  const prevInSeries = seriesIndex > 0 ? seriesArticles[seriesIndex - 1] : null
  const nextInSeries = seriesIndex >= 0 && seriesIndex < seriesArticles.length - 1 ? seriesArticles[seriesIndex + 1] : null

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: article.title,
    description: article.excerpt,
    image: article.feature_image ? [article.feature_image] : undefined,
    datePublished: article.created_at,
    dateModified: article.updated_at || article.created_at,
    author: {
      '@type': 'Person',
      name: 'Muhammad Qasim Imran',
      url: `${SITE_URL}/about`,
    },
    publisher: {
      '@type': 'Person',
      name: 'Muhammad Qasim Imran',
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `${SITE_URL}/blog/${slug}`,
    },
  }

  return (
    <article className="min-h-screen bg-transparent py-20 px-6 font-sans">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="max-w-4xl mx-auto">
        
        <div className="text-center mb-16">
          <Link 
            href="/blog" 
            className="inline-block text-[10px] font-bold tracking-widest uppercase text-gray-400 hover:text-gray-900 transition-colors"
          >
            ← Back to Editorial
          </Link>
        </div>

        <header className="mb-12 text-center">
          {article.series_name && seriesIndex >= 0 && (
            <p className="text-[10px] font-bold tracking-[0.2em] uppercase text-[#aa002a] mb-4">
              {article.series_name} — Part {seriesIndex + 1} of {seriesArticles.length}
            </p>
          )}
          <div className="flex flex-wrap items-center justify-center gap-3 text-[10px] font-bold tracking-[0.2em] uppercase text-gray-500 mb-6">
            <span className="text-gray-900">{article.category}</span>
            <span className="text-gray-300">/</span>
            <span>{readTime}</span>
            <span className="text-gray-300">/</span>
            <span>{new Date(article.created_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
          </div>
          
          <h1 className="text-5xl md:text-6xl font-sans font-bold text-gray-900 mb-8 tracking-tight">
            {article.title}
          </h1>
          
          <p className="text-xl text-gray-500 font-light leading-relaxed max-w-2xl mx-auto">
            {article.excerpt}
          </p>
        </header>

        {article.feature_image && (
          <div className="mb-16 w-full">
            <img 
              src={article.feature_image} 
              alt={`${article.title} cover`} 
              className="w-full h-auto max-h-[600px] object-cover rounded-none border-none shadow-none bg-transparent"
            />
          </div>
        )}

        <div 
          className="prose prose-lg prose-slate max-w-2xl mx-auto 
                     prose-headings:font-sans prose-headings:font-bold prose-headings:tracking-tight prose-headings:text-gray-900
                     prose-p:text-gray-600 prose-p:leading-loose prose-p:font-light
                     prose-a:text-gray-900 prose-a:underline hover:prose-a:no-underline
                     prose-blockquote:border-none prose-blockquote:text-center prose-blockquote:text-3xl 
                     prose-blockquote:font-sans prose-blockquote:font-light prose-blockquote:italic prose-blockquote:text-gray-800 
                     prose-blockquote:my-16 prose-blockquote:px-0
                     prose-img:rounded-none prose-img:border-none prose-img:shadow-none prose-img:w-full prose-img:bg-transparent"
          dangerouslySetInnerHTML={{ __html: article.content }}
        />

        {/* Series Navigation */}
        {article.series_name && seriesArticles.length > 1 && (
          <div className="max-w-2xl mx-auto mt-16 pt-10 border-t border-gray-100">
            <p className="text-[10px] font-bold tracking-[0.2em] uppercase text-gray-400 mb-4 text-center">
              More in "{article.series_name}"
            </p>
            <ol className="space-y-2 mb-8">
              {seriesArticles.map((a, i) => (
                <li key={a.slug}>
                  <Link
                    href={`/blog/${a.slug}`}
                    className={`flex items-center gap-3 text-sm py-1 ${
                      a.slug === slug ? 'text-[#aa002a] font-medium' : 'text-gray-500 hover:text-gray-900'
                    }`}
                  >
                    <span className="text-xs font-mono w-5">{i + 1}.</span>
                    {a.title}
                    {a.slug === slug && <span className="text-[10px] uppercase tracking-widest">(you are here)</span>}
                  </Link>
                </li>
              ))}
            </ol>
            <div className="flex justify-between gap-4 text-sm">
              {prevInSeries ? (
                <Link href={`/blog/${prevInSeries.slug}`} className="text-gray-500 hover:text-[#aa002a] transition-colors">
                  ← {prevInSeries.title}
                </Link>
              ) : <span />}
              {nextInSeries && (
                <Link href={`/blog/${nextInSeries.slug}`} className="text-gray-500 hover:text-[#aa002a] transition-colors text-right">
                  {nextInSeries.title} →
                </Link>
              )}
            </div>
          </div>
        )}

        {/* Reactions + Share */}
        <div className="max-w-2xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6 mt-16 pt-10 border-t border-gray-100">
          <ReactionButton slug={slug} initialCount={article.reaction_count || 0} />
          <ShareButtons url={`${SITE_URL}/blog/${slug}`} title={article.title} />
        </div>

        {/* Related Posts */}
        {relatedArticles && relatedArticles.length > 0 && (
          <div className="max-w-4xl mx-auto mt-24 pt-16 border-t border-gray-100">
            <h2 className="text-[10px] font-bold tracking-[0.2em] uppercase text-gray-400 mb-8 text-center">
              More From {article.category}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {relatedArticles.map((related) => (
                <Link key={related.slug} href={`/blog/${related.slug}`} className="group block">
                  {related.feature_image && (
                    <div className="relative aspect-video mb-3 overflow-hidden rounded">
                      <Image
                        src={related.feature_image}
                        alt={related.title}
                        fill
                        sizes="(max-width: 640px) 100vw, 33vw"
                        className="object-cover object-top group-hover:scale-105 transition-transform duration-500"
                      />
                    </div>
                  )}
                  <h3 className="text-sm font-medium text-gray-900 group-hover:text-[#aa002a] transition-colors leading-snug">
                    {related.title}
                  </h3>
                </Link>
              ))}
            </div>
          </div>
        )}

        <Comments />
      </div>
    </article>
  )
}