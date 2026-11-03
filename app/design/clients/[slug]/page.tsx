import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { createClient } from '@supabase/supabase-js'
import { SITE_URL } from '@/site.config'
import { JsonLd, author, clip, pageMeta, absolute } from '@/lib/seo'
import ClientGallery from './ClientGallery'

const db = () => createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)
async function get(slug: string) {
  const { data: c } = await db().from('client_logos').select('id, name, slug, image_url, dark_image_url, link_url, role, period, summary, testimonial_quote, testimonial_author').eq('slug', slug).maybeSingle()
  if (!c) return null
  const { data: designs } = await db().from('designs').select('id, title, category, images, created_at').eq('client_id', c.id).eq('published', true).order('created_at', { ascending: false })
  return { c, designs: designs || [] }
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const r = await get((await params).slug)
  if (!r) return { title: 'Client not found', robots: { index: false } }
  return pageMeta({ title: `Design work for ${r.c.name}`, description: r.c.summary || `${r.c.role ? r.c.role + ' at ' : 'Design work for '}${r.c.name}.`, path: `/design/clients/${r.c.slug}`, image: r.designs[0]?.images?.[0] || r.c.image_url })
}

// A client's own page: a short case study (role, period, what I did, their testimonial) and only their designs.
export default async function ClientPage({ params }: { params: Promise<{ slug: string }> }) {
  const r = await get((await params).slug)
  if (!r) notFound()
  const { c, designs } = r
  const paras: string[] = String(c.summary || '').split(/\n\s*\n/).filter(Boolean)
  return (
    <main className="container-page pb-24 pt-12 md:pt-20">
      <JsonLd data={{ '@type': 'CollectionPage', name: `Design work for ${c.name}`, description: clip(c.summary), url: `${SITE_URL}/design/clients/${c.slug}`, author,
        about: { '@type': 'Organization', name: c.name, ...(c.link_url ? { url: c.link_url } : {}), ...(c.image_url ? { logo: absolute(c.image_url) } : {}) },
        hasPart: designs.slice(0, 20).map((d) => ({ '@type': 'CreativeWork', name: d.title, image: absolute(d.images?.[0]) })) }} />
      <Link href="/design" className="type-meta hover:text-ink-900">&larr; All design work</Link>
      <div className="mt-6 flex flex-wrap items-center gap-6">
        {c.image_url && <div className="grid h-20 w-20 place-items-center border border-ink-100 bg-paper-raised p-3"><img src={c.image_url} alt={`${c.name} logo`} className="max-h-full max-w-full object-contain dark:hidden" />{c.dark_image_url ? <img src={c.dark_image_url} alt={`${c.name} logo`} className="hidden max-h-full max-w-full object-contain dark:block" /> : <img src={c.image_url} alt="" aria-hidden className="hidden max-h-full max-w-full object-contain dark:block" />}</div>}
        <div><h1 className="type-display text-ink-900" dir="auto">{c.name}</h1>
          <p className="mt-2 text-ink-500" dir="auto">{[c.role, c.period].filter(Boolean).join(' \u00b7 ')}</p></div>
      </div>
      <div className="mt-12 grid gap-10 lg:grid-cols-12">
        <div className="space-y-4 lg:col-span-7">{paras.length ? paras.map((p, i) => <p key={i} className="text-lg leading-relaxed text-ink-700" dir="auto">{p}</p>) : <p className="text-lg text-ink-700">A selection of my design work for {c.name}.</p>}</div>
        <aside className="space-y-6 lg:col-span-4 lg:col-start-9">
          <div className="grid grid-cols-2 gap-px border border-ink-100 bg-ink-100">
            <div className="bg-paper p-5"><p className="font-display text-4xl leading-none text-ink-900">{designs.length}</p><p className="mt-2 text-sm text-ink-500">design{designs.length === 1 ? '' : 's'}</p></div>
            <div className="bg-paper p-5"><p className="font-display text-4xl leading-none text-ink-900">{new Set(designs.map((d) => d.category).filter(Boolean)).size || 1}</p><p className="mt-2 text-sm text-ink-500">kind{new Set(designs.map((d) => d.category).filter(Boolean)).size === 1 ? '' : 's'} of work</p></div>
          </div>
          {c.testimonial_quote && <blockquote className="border-s-2 border-accent-600 ps-5"><p className="text-[17px] italic leading-relaxed text-ink-900" dir="auto">&ldquo;{c.testimonial_quote}&rdquo;</p>{c.testimonial_author && <footer className="mt-2 text-sm text-ink-500" dir="auto">{c.testimonial_author}</footer>}</blockquote>}
          {c.link_url && <a href={c.link_url} target="_blank" rel="noopener noreferrer" className="link-draw text-sm">Visit {c.name} &rarr;</a>}
        </aside>
      </div>
      <h2 className="type-h2 mt-20 text-ink-900">The work</h2>
      <ClientGallery designs={designs} />
    </main>
  )
}
