import { supabase } from '@/lib/supabase'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import type { Metadata } from 'next'
import ShareButtons from '@/app/components/ShareButtons'
import ReactionButton from '@/app/components/ReactionButton'

const SITE_URL = 'https://muhammadqasimimran.vercel.app'

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

  return (
    <article className="min-h-screen bg-transparent py-20 px-6 font-sans">
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
                    <div className="aspect-video mb-3 overflow-hidden rounded">
                      <img
                        src={related.feature_image}
                        alt={related.title}
                        className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500"
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
      </div>
    </article>
  )
}