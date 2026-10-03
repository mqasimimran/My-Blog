import { supabase } from '@/lib/supabase'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Draft Preview',
  robots: { index: false, follow: false },
}

export default async function DesignPreviewPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params

  const { data: design, error } = await supabase
    .from('designs')
    .select('*')
    .eq('preview_token', token)
    .single()

  if (error || !design) {
    notFound()
  }

  return (
    <main className="min-h-screen bg-paper py-20 px-6 font-sans">
      <div className="max-w-4xl mx-auto">
        <div className="bg-amber-50 border border-amber-200 text-amber-800 text-xs font-bold uppercase tracking-widest text-center py-3 px-4 rounded-none mb-12">
          🔒 Draft Preview — not published, not indexed, only visible via this link
        </div>

        <header className="mb-10">
          <p className="text-accent-600 text-[10px] font-bold tracking-[0.2em] uppercase mb-4">
            {design.category}
          </p>
          <h1 className="font-display text-ink-900 text-4xl md:text-5xl font-bold tracking-tight">
            {design.title}
          </h1>
        </header>

        {design.images && design.images.length > 0 && (
          <section className="space-y-6">
            {design.images.map((src: string, i: number) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img key={i} src={src} alt={`${design.title} ${i + 1}`} className="w-full border border-ink-100" />
            ))}
          </section>
        )}
      </div>
    </main>
  )
}
