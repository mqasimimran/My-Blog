import { supabase } from '@/lib/supabase'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import Image from '@/components/SafeImage'
import type { Metadata } from 'next'
import ShareButtons from '@/app/components/ShareButtons'
import ReactionButton from '@/app/components/ReactionButton'
import Comments from '@/app/components/Comments'
import LeadMagnet from '@/app/components/LeadMagnet'
import { ArrowLeft, ArrowRight } from '@phosphor-icons/react/dist/ssr'


import { siteConfig, SITE_URL_SLASH as SITE_URL } from '@/site.config'
import SplitText from '@/app/components/ui/SplitText'
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
    // The layout adds " | <site name>" from site.config.ts, so the title here is just the post's.
    title: post.title,
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
      name: siteConfig.name,
      url: `${SITE_URL}/about`,
    },
    publisher: {
      '@type': 'Person',
      name: siteConfig.name,
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `${SITE_URL}/blog/${slug}`,
    },
  }

  const published = new Date(article.created_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })

  return (
    <article className="pb-24 pt-10 md:pt-14">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c') }} />

      <div className="container-page">
        <Link href="/blog" className="inline-flex items-center gap-2 text-sm font-medium text-ink-500 transition-colors duration-200 hover:text-ink-900">
          <ArrowLeft size={16} aria-hidden /> Editorial
        </Link>

        <header className="mx-auto mt-12 max-w-3xl md:mt-16">
          {article.series_name && seriesIndex >= 0 && (
            <p className="mb-5 text-sm font-medium text-accent-600">
              {article.series_name}, part {seriesIndex + 1} of {seriesArticles.length}
            </p>
          )}
          <p className="type-meta flex flex-wrap gap-x-5 gap-y-1">
            <span className="text-ink-900">{article.category}</span>
            <span>{readTime}</span>
            <time dateTime={article.created_at}>{published}</time>
          </p>
          <h1 className="type-title mt-5 text-ink-900"><SplitText text={article.title} /></h1>
          {article.excerpt && <p className="type-lead mt-6">{article.excerpt}</p>}
        </header>
      </div>

      {article.feature_image && (
        <figure className="container-page mt-12 md:mt-16">
          <div className="mx-auto max-w-5xl overflow-hidden bg-ink-50">
            <img src={article.feature_image} alt={`${article.title} cover`} className="h-auto w-full" />
          </div>
        </figure>
      )}

      <div className="container-page">
        <div
          className="prose prose-lg mx-auto mt-12 max-w-3xl md:mt-16 prose-headings:font-semibold prose-headings:tracking-[-0.025em] prose-headings:text-ink-900 prose-p:leading-[1.8] prose-p:text-ink-700 prose-li:text-ink-700 prose-strong:text-ink-900 prose-a:text-ink-900 prose-a:decoration-accent-600 prose-a:decoration-2 prose-a:underline-offset-4 hover:prose-a:text-accent-600 prose-blockquote:border-l-2 prose-blockquote:border-accent-600 prose-blockquote:pl-6 prose-blockquote:font-medium prose-blockquote:not-italic prose-blockquote:text-ink-900 prose-code:text-ink-900 prose-code:before:content-none prose-code:after:content-none prose-pre:rounded-none prose-pre:bg-ink-900 prose-pre:text-paper prose-img:w-full prose-hr:border-ink-100 prose-figcaption:text-ink-500 prose-th:text-ink-900 prose-td:text-ink-700"
          dangerouslySetInnerHTML={{ __html: article.content }}
        />

        {/* Series navigation */}
        {article.series_name && seriesArticles.length > 1 && (
          <nav aria-label="Series" className="mx-auto mt-16 max-w-3xl border-t border-ink-100 pt-10">
            <p className="type-meta mb-5">More in &ldquo;{article.series_name}&rdquo;</p>
            <ol className="space-y-1">
              {seriesArticles.map((a, i) => (
                <li key={a.slug}>
                  <Link
                    href={`/blog/${a.slug}`}
                    aria-current={a.slug === slug ? 'page' : undefined}
                    className={`flex items-baseline gap-4 py-1.5 text-[15px] transition-colors duration-200 ${a.slug === slug ? 'font-medium text-accent-600' : 'text-ink-700 hover:text-ink-900'}`}
                  >
                    <span className="w-6 shrink-0 font-mono text-xs tabular-nums text-ink-500">{i + 1}</span>
                    {a.title}
                    {a.slug === slug && <span className="type-meta">(you are here)</span>}
                  </Link>
                </li>
              ))}
            </ol>
            <div className="mt-8 grid grid-cols-2 gap-6 text-sm">
              {prevInSeries ? (
                <Link href={`/blog/${prevInSeries.slug}`} className="group flex items-start gap-2 text-ink-700 transition-colors duration-200 hover:text-accent-600">
                  <ArrowLeft size={16} aria-hidden className="mt-0.5 shrink-0" /> {prevInSeries.title}
                </Link>
              ) : <span />}
              {nextInSeries && (
                <Link href={`/blog/${nextInSeries.slug}`} className="group flex items-start justify-end gap-2 text-right text-ink-700 transition-colors duration-200 hover:text-accent-600">
                  {nextInSeries.title} <ArrowRight size={16} aria-hidden className="mt-0.5 shrink-0" />
                </Link>
              )}
            </div>
          </nav>
        )}

        {/* Reactions + share */}
        <div className="mx-auto mt-16 flex max-w-3xl flex-col items-start justify-between gap-6 border-t border-ink-100 pt-10 sm:flex-row sm:items-center">
          <ReactionButton slug={slug} initialCount={article.reaction_count || 0} />
          <ShareButtons url={`${SITE_URL}/blog/${slug}`} title={article.title} />
        </div>

        {/* Lead magnet: turns readers into subscribers */}
        <div className="mx-auto mt-16 max-w-3xl">
          <LeadMagnet />
        </div>

        {/* Related posts */}
        {relatedArticles && relatedArticles.length > 0 && (
          <section className="mt-24 border-t border-ink-100 pt-16">
            <h2 className="type-h3 text-ink-900">More from {article.category}</h2>
            <div className="mt-10 grid grid-cols-1 gap-x-8 gap-y-12 sm:grid-cols-3">
              {relatedArticles.map((related) => (
                <Link key={related.slug} href={`/blog/${related.slug}`} className="group flex h-full w-full flex-col border border-ink-100 bg-paper-raised transition-colors duration-300 hover:border-ink-900">
                  {related.feature_image && (
                    <div className="relative aspect-video overflow-hidden bg-ink-50">
                      <img src={related.feature_image} alt="" aria-hidden className="absolute inset-0 h-full w-full scale-125 object-cover opacity-70 blur-2xl" />
                      <Image
                        src={related.feature_image}
                        alt={related.title}
                        fill
                        sizes="(max-width: 640px) 100vw, 33vw"
                        className="object-contain transition-transform duration-[900ms] ease-[var(--ease-smooth)] group-hover:scale-[1.03]"
                      />
                    </div>
                  )}
                  <div className="p-5">
                    <p className="type-meta">{related.category}</p>
                    <h3 className="mt-2 text-lg font-medium leading-snug tracking-tight text-ink-900 transition-colors duration-300 group-hover:text-accent-600">{related.title}</h3>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        <div className="mx-auto max-w-3xl">
          <Comments />
        </div>
      </div>
    </article>
  )
}
