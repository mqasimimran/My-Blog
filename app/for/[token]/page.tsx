import { mediaCover } from '@/lib/portfolioVideo'
import SiteImage from '@/components/SiteImage'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { headers } from 'next/headers'
import { DownloadSimple, EnvelopeSimple, GithubLogo, LinkedinLogo, ArrowUpRight } from '@phosphor-icons/react/dist/ssr'
import { supabaseAdmin } from '@/lib/supabaseAdmin'
import { getPack, logEvent } from '@/lib/recruiter'
import { emailMe, whatsappMe } from '@/lib/notify'
import { siteConfig } from '@/site.config'

export const metadata: Metadata = { title: 'For you', robots: { index: false, follow: false } }
export const dynamic = 'force-dynamic'
const BOTS = /bot|crawl|spider|preview|slack|whatsapp|facebookexternalhit|linkedinbot|telegram|discord|curl|python/i

// A private page for one company you applied to: your note, CV, top projects and contact links.
// Opening it is recorded and you're alerted on the first view (link previews from chat apps and
// LinkedIn don't count as views).
export default async function RecruiterPage({ params, searchParams }: { params: Promise<{ token: string }>; searchParams: Promise<{ preview?: string }> }) {
  const pack = await getPack((await params).token)
  if (!pack) notFound()
  const preview = (await searchParams).preview === '1'
  const ua = (await headers()).get('user-agent') || ''
  if (!preview && !BOTS.test(ua)) {
    const now = new Date().toISOString(), first = !pack.first_viewed_at
    await supabaseAdmin.from('recruiter_packs').update({ views: pack.views + 1, last_viewed_at: now, ...(first ? { first_viewed_at: now } : {}) }).eq('id', pack.id)
    await logEvent(pack.id, 'view')
    if (first) {
      const msg = `${pack.company} just opened your recruiter pack${pack.role_applied ? ` (${pack.role_applied})` : ''}.`
      await Promise.all([whatsappMe(`\u{1F440} ${msg}`), emailMe(`${pack.company} opened your recruiter pack`, `<p>${msg}</p><p><a href="${siteConfig.url}/admin/recruiter">See what they look at</a></p>`)])
    }
  }
  const { data: projects } = pack.project_ids.length ? await supabaseAdmin.from('projects').select('id, title, slug, description, feature_image, screenshots, category').in('id', pack.project_ids).eq('published', true) : { data: [] }
  const ordered = pack.project_ids.map((id) => (projects || []).find((p) => p.id === id)).filter(Boolean) as NonNullable<typeof projects>
  const go = (to: string) => `/api/for/${pack.public_token}/go?to=${encodeURIComponent(to)}${preview ? '&preview=1' : ''}`
  return (
    <main className="container-page pb-24 pt-12 md:pt-20" dir="ltr" lang="en">
      <div className="mx-auto max-w-4xl">
        <p className="type-meta">For the {pack.company} team{pack.role_applied ? ` \u00b7 ${pack.role_applied}` : ''}</p>
        <div className="mt-6 flex flex-wrap items-center gap-6">
          <SiteImage sizes="96px" src="/profile.png" alt={siteConfig.name} className="h-24 w-24 border border-ink-100 bg-paper-raised object-cover object-top" />
          <div><h1 className="type-display text-ink-900">{siteConfig.name}</h1><p className="mt-2 text-lg text-ink-700">{siteConfig.jobTitle}</p></div>
        </div>
        {pack.note && <div className="mt-10 border-s-2 border-accent-600 ps-6"><p className="whitespace-pre-line text-lg leading-relaxed text-ink-900">{pack.contact_name ? `Hi ${pack.contact_name},\n\n` : ''}{pack.note}</p></div>}
        <div className="mt-10 flex flex-wrap gap-3">
          {pack.include_cv && <a href={go('cv')} className="inline-flex h-12 items-center gap-2 bg-ink-900 px-6 text-sm font-medium text-paper hover:bg-accent-600 hover:text-on-accent"><DownloadSimple size={18} aria-hidden /> Download my CV</a>}
          <a href={go('email')} className="inline-flex h-12 items-center gap-2 border border-ink-900 px-5 text-sm font-medium text-ink-900 hover:bg-ink-900 hover:text-paper"><EnvelopeSimple size={18} aria-hidden /> Email me</a>
          {siteConfig.social.linkedin && <a href={go('linkedin')} className="inline-flex h-12 items-center gap-2 border border-ink-100 px-5 text-sm text-ink-900 hover:border-ink-900"><LinkedinLogo size={18} aria-hidden /> LinkedIn</a>}
          {siteConfig.social.github && <a href={go('github')} className="inline-flex h-12 items-center gap-2 border border-ink-100 px-5 text-sm text-ink-900 hover:border-ink-900"><GithubLogo size={18} aria-hidden /> GitHub</a>}
        </div>
        {ordered.length > 0 && (
          <section className="mt-16" aria-labelledby="pack-projects"><h2 id="pack-projects" className="type-h2 text-ink-900">Work I&rsquo;d like you to see</h2>
            <ul className="mt-8 grid gap-6 md:grid-cols-3">{ordered.map((p) => { const cover = p.feature_image || mediaCover(p.screenshots?.[0]); return (
              <li key={p.id}><a href={go(`project:${p.slug}`)} className="group block h-full border border-ink-100 bg-paper-raised transition-colors hover:border-ink-900">
                <div className="relative aspect-[16/10] overflow-hidden border-b border-ink-100 bg-ink-50">{cover && <SiteImage src={cover} sizes={'(min-width: 768px) 33vw, 100vw'} alt="" className="absolute inset-0 h-full w-full object-cover" />}</div>
                <div className="p-5"><p className="type-meta">{p.category}</p><p className="mt-1 flex items-center gap-1 text-lg font-medium text-ink-900 group-hover:text-accent-600">{p.title} <ArrowUpRight size={16} aria-hidden /></p>{p.description && <p className="mt-2 line-clamp-3 text-sm text-ink-700">{p.description}</p>}</div>
              </a></li>) })}</ul>
          </section>
        )}
        <p className="mt-16 text-sm text-ink-500">Thanks for taking a look. See everything at <Link href="/" className="underline">{siteConfig.url.replace(/^https?:\/\//, '')}</Link>.</p>
      </div>
    </main>
  )
}
