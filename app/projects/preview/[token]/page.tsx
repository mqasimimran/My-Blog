import { supabaseAdmin as supabase } from '@/lib/supabaseAdmin'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import Image from 'next/image'

export const metadata: Metadata = {
  title: 'Draft Preview',
  robots: { index: false, follow: false },
}

export default async function ProjectPreviewPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params

  const { data: project, error } = await supabase
    .from('projects')
    .select('*')
    .eq('preview_token', token)
    .single()

  if (error || !project) {
    notFound()
  }

  return (
    <main className="min-h-screen bg-paper py-20 px-6 font-sans">
      <div className="max-w-4xl mx-auto">
        <div className="bg-amber-50 border border-amber-200 text-amber-800 text-xs font-bold uppercase tracking-widest text-center py-3 px-4 rounded-none mb-12">
          🔒 Draft Preview — not published, not indexed, only visible via this link
        </div>

        <header className="mb-12">
          <p className="text-accent-600 text-[10px] font-bold tracking-[0.2em] uppercase mb-4">
            {project.category}
          </p>
          <h1 className="font-display text-ink-900 text-4xl md:text-5xl font-bold mb-6 tracking-tight">
            {project.title}
          </h1>
          {project.description && (
            <p className="text-ink-500 text-lg font-light leading-relaxed max-w-2xl">
              {project.description}
            </p>
          )}
        </header>

        {project.problem && (
          <section className="mb-10">
            <h2 className="text-ink-900 text-xs font-bold tracking-[0.2em] uppercase mb-4 pb-3 border-b border-ink-100">Problem</h2>
            <p className="text-ink-700 leading-relaxed text-lg font-light whitespace-pre-line">{project.problem}</p>
          </section>
        )}

        {project.approach && (
          <section className="mb-10">
            <h2 className="text-ink-900 text-xs font-bold tracking-[0.2em] uppercase mb-4 pb-3 border-b border-ink-100">Approach</h2>
            <p className="text-ink-700 leading-relaxed text-lg font-light whitespace-pre-line">{project.approach}</p>
          </section>
        )}

        {project.screenshots && project.screenshots.length > 0 && (
          <section className="mb-10 space-y-6">
            {project.screenshots.map((src: string, i: number) => (
              <div key={i} className="relative w-full aspect-video border border-ink-100">
                <Image src={src} alt={`${project.title} screenshot ${i + 1}`} fill className="object-cover" />
              </div>
            ))}
          </section>
        )}

        {project.outcome && (
          <section className="mb-10">
            <h2 className="text-ink-900 text-xs font-bold tracking-[0.2em] uppercase mb-4 pb-3 border-b border-ink-100">Outcome</h2>
            <p className="text-ink-700 leading-relaxed text-lg font-light whitespace-pre-line">{project.outcome}</p>
          </section>
        )}
      </div>
    </main>
  )
}
