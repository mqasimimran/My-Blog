import type { Metadata } from 'next'
import { createClient } from '@supabase/supabase-js'
import { SITE_URL } from '@/site.config'
import { JsonLd, absolute, author, clip, pageMeta } from '@/lib/seo'

// Public data only (the public key respects the database's access rules, so drafts stay hidden).
const db = () => createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)

async function get(slug: string) {
  const c = db()
  const { data: s } = await c.from('services').select('id, name, tagline, description, cover_image').eq('slug', slug).eq('active', true).maybeSingle()
  if (!s) return null
  const { data: pk } = await c.from('service_packages').select('price').eq('service_id', s.id)
  const prices = (pk || []).map((x) => Number(String(x.price).replace(/[^0-9.]/g, ''))).filter((n) => n > 0)
  return { ...s, low: prices.length ? Math.min(...prices) : null, high: prices.length ? Math.max(...prices) : null }
}
// Each service gets its own title and description, plus Service data with its price range.
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params; const s = await get(slug)
  if (!s) return { title: 'Service not found', robots: { index: false } }
  return pageMeta({ title: s.name, description: s.tagline ? `${s.tagline}. ${s.description || ''}` : s.description, path: `/services/${slug}`, image: s.cover_image })
}
export default async function Layout({ children, params }: { children: React.ReactNode; params: Promise<{ slug: string }> }) {
  const { slug } = await params; const s = await get(slug)
  return (<>{s && <JsonLd data={{ '@type': 'Service', name: s.name, description: clip(s.description || s.tagline), provider: author, url: `${SITE_URL}/services/${slug}`, areaServed: 'Worldwide',
    ...(s.low ? { offers: { '@type': 'AggregateOffer', priceCurrency: 'USD', lowPrice: s.low, highPrice: s.high } } : {}) }} />}{children}</>)
}
