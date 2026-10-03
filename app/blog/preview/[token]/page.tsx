import { supabase } from '@/lib/supabase'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Draft Preview',
  robots: { index: false, follow: false },
}

export default async function PreviewPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params

  const { data: article, error } = await supabase
    .from('articles')
    .select('*')
    .eq('preview_token', token)
    .single()

  if (error || !article) {
    notFound()
  }

  return (
    <article className="min-h-screen bg-paper py-20 px-6 font-sans">
      <div className="max-w-4xl mx-auto">

        <div className="bg-amber-50 border border-amber-200 text-amber-800 text-xs font-bold uppercase tracking-widest text-center py-3 px-4 rounded-none mb-12">
          🔒 Draft Preview — not published, not indexed, only visible via this link
        </div>

        <header className="mb-12 text-center">
          <div className="flex flex-wrap items-center justify-center gap-3 text-[10px] font-bold tracking-[0.2em] uppercase text-gray-500 mb-6">
            <span className="text-gray-900">{article.category}</span>
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
              className="w-full h-auto max-h-[600px] object-cover"
            />
          </div>
        )}

        <div
          className="prose prose-lg prose-slate max-w-2xl mx-auto
                     prose-headings:font-sans prose-headings:font-bold prose-headings:tracking-tight prose-headings:text-gray-900
                     prose-p:text-gray-600 prose-p:leading-loose prose-p:font-light
                     prose-a:text-gray-900 prose-a:underline hover:prose-a:no-underline
                     prose-img:rounded-none prose-img:border-none prose-img:shadow-none prose-img:w-full"
          dangerouslySetInnerHTML={{ __html: article.content }}
        />
      </div>
    </article>
  )
}
