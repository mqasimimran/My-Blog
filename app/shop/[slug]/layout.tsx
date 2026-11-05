import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { createClient } from '@supabase/supabase-js'
import { SITE_URL } from '@/site.config'
import { JsonLd, absolute, author, clip, pageMeta } from '@/lib/seo'
import { supabaseAdmin } from '@/lib/supabaseAdmin'

// Public data only (the public key respects the database's access rules, so drafts stay hidden).
const db = () => createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)

async function get(slug: string) {
  const { data, error } = await db().from('products').select('id, name, description, price, images, type, stock_quantity').eq('slug', slug).eq('active', true).maybeSingle()
  if (error) throw error
  if (!data) notFound()
  return data
}
// Each product gets its own title, description and share image, plus Product data (price, availability).
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params; const p = await get(slug)
  const price = Number(p.price) === 0 ? 'Free' : `$${Number(p.price).toFixed(2)}`
  return pageMeta({ title: `${p.name} (${price})`, description: p.description, path: `/shop/${slug}`, image: p.images?.[0] })
}
export default async function Layout({ children, params }: { children: React.ReactNode; params: Promise<{ slug: string }> }) {
  const { slug } = await params; const p = await get(slug)
  // Approved reviews from verified buyers give Google the product's star rating.
  const { data: rv } = p ? await supabaseAdmin.from('product_reviews').select('name, rating, body, created_at').eq('product_id', p.id).eq('status', 'approved').limit(20) : { data: null }
  const reviews = (rv || []) as { name: string; rating: number; body: string | null; created_at: string }[]
  const avg = reviews.length ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length : 0
  // Same rule as the product page: only physical products with 0 left are out of stock.
  const inStock = p && !(p.type === 'physical' && p.stock_quantity !== null && Number(p.stock_quantity) <= 0)
  return (<>{p && <JsonLd data={{ '@type': 'Product', name: p.name, description: clip(p.description), image: (p.images || []).map(absolute), brand: { '@type': 'Brand', name: author.name },
    ...(reviews.length ? { aggregateRating: { '@type': 'AggregateRating', ratingValue: Math.round(avg * 10) / 10, reviewCount: reviews.length, bestRating: 5, worstRating: 1 },
      review: reviews.slice(0, 5).map((r) => ({ '@type': 'Review', author: { '@type': 'Person', name: r.name }, reviewRating: { '@type': 'Rating', ratingValue: r.rating, bestRating: 5 }, ...(r.body ? { reviewBody: r.body } : {}), datePublished: r.created_at.slice(0, 10) })) } : {}),
    offers: { '@type': 'Offer', url: `${SITE_URL}/shop/${slug}`, price: Number(p.price).toFixed(2), priceCurrency: 'USD', availability: `https://schema.org/${inStock ? 'InStock' : 'OutOfStock'}`, seller: author } }} />}{children}</>)
}
