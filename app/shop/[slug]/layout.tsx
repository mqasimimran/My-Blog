import type { Metadata } from 'next'
import { createClient } from '@supabase/supabase-js'
import { SITE_URL } from '@/site.config'
import { JsonLd, absolute, author, clip, pageMeta } from '@/lib/seo'

// Public data only (the public key respects the database's access rules, so drafts stay hidden).
const db = () => createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)

async function get(slug: string) {
  const { data } = await db().from('products').select('name, description, price, images, type, stock_quantity').eq('slug', slug).eq('active', true).maybeSingle()
  return data
}
// Each product gets its own title, description and share image, plus Product data (price, availability).
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params; const p = await get(slug)
  if (!p) return { title: 'Product not found', robots: { index: false } }
  const price = Number(p.price) === 0 ? 'Free' : `$${Number(p.price).toFixed(2)}`
  return pageMeta({ title: `${p.name} (${price})`, description: p.description, path: `/shop/${slug}`, image: p.images?.[0] })
}
export default async function Layout({ children, params }: { children: React.ReactNode; params: Promise<{ slug: string }> }) {
  const { slug } = await params; const p = await get(slug)
  // Same rule as the product page: only physical products with 0 left are out of stock.
  const inStock = p && !(p.type === 'physical' && p.stock_quantity !== null && Number(p.stock_quantity) <= 0)
  return (<>{p && <JsonLd data={{ '@type': 'Product', name: p.name, description: clip(p.description), image: (p.images || []).map(absolute), brand: { '@type': 'Brand', name: author.name },
    offers: { '@type': 'Offer', url: `${SITE_URL}/shop/${slug}`, price: Number(p.price).toFixed(2), priceCurrency: 'USD', availability: `https://schema.org/${inStock ? 'InStock' : 'OutOfStock'}`, seller: author } }} />}{children}</>)
}
