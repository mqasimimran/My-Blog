import type { Metadata } from 'next'
import { DownloadSimple, EnvelopeSimple } from '@phosphor-icons/react/dist/ssr'
import { getT } from '@/lib/locale'
import { siteConfig } from '@/site.config'

export const metadata: Metadata = { title: 'Media kit', description: `Audience, topics and press assets for ${siteConfig.name}.` }

// Media kit for brands and collaborators. Edit everything in site.config.ts -> mediaKit.
export default async function MediaKitPage() {
  const { tx } = await getT()
  const mk = siteConfig.mediaKit
  return (
    <main className="container-page pb-24 pt-12 md:pt-20">
      <p className="type-meta">{tx('Media kit')}</p>
      <h1 className="type-display mt-4 max-w-[16ch] text-ink-900">{siteConfig.name}</h1>
      <p className="type-lead mt-6 max-w-[56ch]" dir="auto">{mk.intro}</p>
      {mk.stats.length > 0 && (
        <div className="mt-14 grid grid-cols-2 gap-px border border-ink-100 bg-ink-100 md:grid-cols-4">
          {mk.stats.map((st) => <div key={st.label} className="bg-paper p-6"><p className="font-display text-5xl leading-none text-ink-900">{st.value}</p><p className="mt-3 text-sm text-ink-500">{st.label}</p></div>)}
        </div>
      )}
      <div className="mt-16 grid gap-12 md:grid-cols-2">
        {mk.topics.length > 0 && <section><h2 className="type-meta">{tx('Topics')}</h2><ul className="mt-4 divide-y divide-ink-100 border-y border-ink-100">{mk.topics.map((t) => <li key={t} className="py-3 text-ink-900" dir="auto">{t}</li>)}</ul></section>}
        {mk.highlights.length > 0 && <section><h2 className="type-meta">{tx('Selected work')}</h2><ul className="mt-4 divide-y divide-ink-100 border-y border-ink-100">{mk.highlights.map((h) => <li key={h.title} className="py-3" dir="auto"><p className="font-medium text-ink-900">{h.title}</p><p className="text-sm text-ink-500">{h.detail}</p></li>)}</ul></section>}
      </div>
      {mk.downloads.length > 0 && (
        <section className="mt-16"><h2 className="type-meta">{tx('Downloads')}</h2>
          <div className="mt-4 flex flex-wrap gap-3">{mk.downloads.map((d) => <a key={d.href} href={d.href} download className="inline-flex h-11 items-center gap-2 border border-ink-900 px-5 text-sm font-medium text-ink-900 hover:bg-ink-900 hover:text-paper"><DownloadSimple size={16} aria-hidden /> {d.label}</a>)}</div>
        </section>
      )}
      <a href={`mailto:${siteConfig.email}?subject=${encodeURIComponent('Collaboration')}`} className="mt-16 inline-flex h-12 items-center gap-2 bg-ink-900 px-6 text-sm font-medium text-paper hover:bg-accent-600 hover:text-on-accent"><EnvelopeSimple size={18} aria-hidden /> {tx('Work with me')}</a>
    </main>
  )
}
