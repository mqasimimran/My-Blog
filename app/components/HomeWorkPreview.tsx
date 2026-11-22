import Link from 'next/link'
import SiteImage from '@/components/SiteImage'
import { supabase } from '@/lib/supabase'
import { mediaCover } from '@/lib/portfolioVideo'

export default async function HomeWorkPreview({ ur = false }: { ur?: boolean }) {
  const { data: client } = await supabase.from('client_logos').select('id,slug,name')
    .eq('slug', 'umt-entrepreneurial-society').eq('show_on_design', true).maybeSingle()
  if (!client) return null
  const [{ data: designs }, { data: campaigns }] = await Promise.all([
    supabase.from('designs').select('title,images').eq('client_id', client.id).eq('published', true)
      .ilike('title', '%business fest%').order('created_at', { ascending: false }),
    supabase.from('design_campaigns').select('id').eq('client_id', client.id).eq('published', true)
      .eq('title', 'UMT Business Fest 2026').limit(1),
  ])
  const artwork = designs?.find(d => /announcing/i.test(d.title) && d.images?.length)
    || designs?.find(d => d.images?.length)
  const cover = mediaCover(artwork?.images?.[0])
  if (!cover) return null
  const clientPath = `/design/clients/${encodeURIComponent(client.slug || client.id)}`
  const href = campaigns?.[0] ? `${clientPath}/campaigns/${campaigns[0].id}` : clientPath
  return <Link href={href} className="group block min-w-0 focus-visible:outline-2 focus-visible:outline-offset-8 focus-visible:outline-accent-600">
    <div className="flex aspect-[6/5] items-center justify-center overflow-hidden border border-ink-100 bg-ink-50 p-4 md:p-6">
      <SiteImage src={cover} alt={artwork?.title || 'UMT Business Fest 2026'} loading="eager" fetchPriority="high"
        sizes="(min-width: 1024px) 43vw, 90vw" className="max-h-full w-full object-contain" />
    </div>
    <div className="mt-4 flex items-end justify-between gap-4">
      <div><p className="type-meta">{ur ? 'منتخب کام' : 'Selected campaign'} / 2026</p>
        <h2 className="mt-2 text-xl font-medium text-ink-900 transition-colors group-hover:text-accent-600 md:text-2xl">UMT Business Fest</h2>
        <p className="mt-1 text-sm text-ink-500">{client.name}</p></div>
      <span className="shrink-0 border-b border-ink-300 pb-1 text-sm">{ur ? 'کیس اسٹڈی دیکھیں' : 'View case study'} ↗</span>
    </div>
  </Link>
}
