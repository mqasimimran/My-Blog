import { mediaCover } from '@/lib/portfolioVideo'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { createClient } from '@supabase/supabase-js'
import { SITE_URL } from '@/site.config'
import { JsonLd, absolute, author, clip, pageMeta } from '@/lib/seo'

// Public data only (the public key respects the database's access rules, so drafts stay hidden).
const db = () => createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)

async function get(slug: string) {
  const { data, error } = await db().from('projects').select('title, description, category, tech_stack, feature_image, screenshots, created_at').eq('slug', slug).eq('published', true).maybeSingle()
  if (error) throw error
  if (!data) notFound()
  return data
}
// Each project gets its own title, description, share image and canonical address, plus structured data.
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params; const p = await get(slug)
  return pageMeta({ title: p.title, description: p.description, path: `/projects/${slug}`, image: p.feature_image || mediaCover(p.screenshots?.[0]) })
}
export default async function Layout({ children, params }: { children: React.ReactNode; params: Promise<{ slug: string }> }) {
  const { slug } = await params; const p = await get(slug)
  return (<>{p && <JsonLd data={{ '@type': 'CreativeWork', name: p.title, description: clip(p.description), url: `${SITE_URL}/projects/${slug}`, image: absolute(p.feature_image || mediaCover(p.screenshots?.[0])),
    author, creator: author, genre: p.category || undefined, keywords: Array.isArray(p.tech_stack) ? p.tech_stack.join(', ') : p.tech_stack || undefined, dateCreated: p.created_at || undefined }} />}{children}</>)
}
