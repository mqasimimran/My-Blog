import type { Metadata } from 'next'
import { createClient } from '@supabase/supabase-js'
import { SITE_URL } from '@/site.config'
import { JsonLd, absolute, author, clip, pageMeta } from '@/lib/seo'

// Public data only (the public key respects the database's access rules, so drafts stay hidden).
const db = () => createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)

async function get(slug: string) {
  const { data } = await db().from('courses').select('title, description, cover_image, level').eq('slug', slug).eq('published', true).maybeSingle()
  return data
}
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params; const c = await get(slug)
  if (!c) return { title: 'Course not found', robots: { index: false } }
  return pageMeta({ title: `${c.title} (free course)`, description: c.description, path: `/courses/${slug}`, image: c.cover_image })
}
export default async function Layout({ children, params }: { children: React.ReactNode; params: Promise<{ slug: string }> }) {
  const { slug } = await params; const c = await get(slug)
  return (<>{c && <JsonLd data={{ '@type': 'Course', name: c.title, description: clip(c.description) || c.title, url: `${SITE_URL}/courses/${slug}`, provider: author, isAccessibleForFree: true,
    educationalLevel: c.level || undefined, image: absolute(c.cover_image), offers: { '@type': 'Offer', price: 0, priceCurrency: 'USD', category: 'Free' },
    hasCourseInstance: { '@type': 'CourseInstance', courseMode: 'Online', courseWorkload: 'PT1H' } }} />}{children}</>)
}
