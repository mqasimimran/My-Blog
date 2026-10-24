'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { useLocale } from '@/app/components/LocaleProvider'
import SplitText from '@/app/components/ui/SplitText'
import FilterTabs from '@/app/components/ui/FilterTabs'

type W = { id: string; name: string; slug: string; price: number; images: string[] | null; category: string | null }
type F = 'All' | 'Free' | 'Premium'

// Wallpapers gallery: your own designs, free or paid, in several resolutions (they live in the shop).
export default function WallpapersPage() {
  const { tx } = useLocale()
  const [items, setItems] = useState<W[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<F>('All')
  useEffect(() => {
    supabase.from('products').select('id, name, slug, price, images, category').eq('type', 'wallpaper').eq('active', true).order('order_index', { ascending: true })
      .then(({ data }) => { setItems((data as W[]) || []); setLoading(false) })
  }, [])
  const shown = items.filter((w) => filter === 'All' || (filter === 'Free' ? Number(w.price) === 0 : Number(w.price) > 0))
  return (
    <main className="container-page pb-24 pt-12 md:pt-20">
      <h1 className="type-display text-ink-900"><SplitText text={tx('Wallpapers')} /></h1>
      <p className="type-lead mt-6 max-w-[52ch]">{tx('Wallpapers I design myself, for your phone, desktop and tablet. Some are free, some are premium.')}</p>
      <div className="mt-10"><FilterTabs label={tx('Filter wallpapers')} options={[{ key: 'All', label: 'All' }, { key: 'Free', label: 'Free' }, { key: 'Premium', label: 'Premium' }]} value={filter} onChange={setFilter} /></div>
      {loading ? <div className="mt-10 grid grid-cols-2 gap-4 md:grid-cols-4">{[0, 1, 2, 3].map((i) => <div key={i} className="aspect-[4/5] bg-ink-50 motion-safe:animate-pulse" />)}</div>
        : shown.length === 0 ? <p className="mt-10 text-ink-500">{tx('No wallpapers here yet. Check back soon.')}</p> : (
        <ul className="mt-10 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
          {shown.map((w) => (
            <li key={w.id}>
              <Link href={`/shop/${w.slug}`} data-cursor={tx('View')} className="group block border border-ink-100 bg-paper-raised transition-colors hover:border-ink-900">
                <div className="relative aspect-[4/5] overflow-hidden bg-ink-50">
                  {w.images?.[0] && <img src={w.images[0]} alt={w.name} loading="lazy" className="absolute inset-0 h-full w-full object-cover transition-transform duration-[900ms] group-hover:scale-[1.03]" />}
                  <span className={`absolute start-3 top-3 px-2 py-1 text-[11px] font-medium uppercase tracking-[0.08em] ${Number(w.price) === 0 ? 'bg-paper text-ink-900' : 'bg-ink-900 text-paper'}`}>{Number(w.price) === 0 ? tx('Free') : `$${Number(w.price).toFixed(2)}`}</span>
                </div>
                <p className="px-4 py-3 text-[15px] font-medium text-ink-900 group-hover:text-accent-600" dir="auto">{w.name}</p>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </main>
  )
}
