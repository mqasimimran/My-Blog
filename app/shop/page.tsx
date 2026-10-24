'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { ArrowRight, DownloadSimple, Package } from '@phosphor-icons/react'
import { supabase } from '@/lib/supabase'
import PageHeader from '@/app/components/ui/PageHeader'
import FilterTabs from '@/app/components/ui/FilterTabs'
import EmptyState from '@/app/components/EmptyState'
import { SkeletonBlock } from '@/app/components/Skeleton'
import { useLocale } from '@/app/components/LocaleProvider'

type Product = {
  id: string
  name: string
  slug: string
  type: string
  category: string | null
  price: number
  compare_at_price: number | null
  images: string[] | null
}

type Filter = 'All' | 'Digital' | 'Physical' | 'Wallpapers'
const FILTERS: { key: Filter; label: string }[] = [
  { key: 'All', label: 'All' },
  { key: 'Digital', label: 'Digital' },
  { key: 'Physical', label: 'Physical' },
  { key: 'Wallpapers', label: 'Wallpapers' },
]

export default function ShopPage() {
  const { tx } = useLocale()
  const { t } = useLocale()
  const [products, setProducts] = useState<Product[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [activeFilter, setActiveFilter] = useState<Filter>('All')

  useEffect(() => {
    async function fetchProducts() {
      const { data, error } = await supabase
        .from('products')
        .select('id, name, slug, type, category, price, compare_at_price, images')
        .eq('active', true)
        .order('order_index', { ascending: true })

      if (error) console.error('Error fetching products:', error)
      else setProducts(data || [])
      setIsLoading(false)
    }
    fetchProducts()
  }, [])

  // Bundles count as digital: they're delivered as downloads.
  const filtered = activeFilter === 'All' ? products : products.filter((p) => (activeFilter === 'Wallpapers' ? p.type === 'wallpaper' : activeFilter === 'Digital' ? p.type !== 'physical' : p.type === 'physical'))

  return (
    <main className="pb-24">
      <PageHeader title={t('shop.title')} description={t('shop.desc')}>
        <Link href="/shop/order" className="group mt-8 inline-flex items-center gap-2 text-sm font-medium text-ink-900">
          <span className="link-draw">{t('shop.track')}</span>
          <ArrowRight size={16} weight="bold" aria-hidden className="transition-transform duration-300 group-hover:translate-x-0.5" />
        </Link>
      </PageHeader>

      <section className="container-page">
        <FilterTabs label={tx("Filter products by type")} options={FILTERS} value={activeFilter} onChange={setActiveFilter} />

        <div className="mt-12">
          {isLoading ? (
            <div className="grid grid-cols-1 gap-x-8 gap-y-14 sm:grid-cols-2 lg:grid-cols-3">
              {[0, 1, 2].map((i) => (
                <div key={i} className="space-y-4">
                  <SkeletonBlock className="aspect-square w-full" />
                  <SkeletonBlock className="h-3 w-24" />
                  <SkeletonBlock className="h-5 w-2/3" />
                </div>
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <EmptyState
              icon="inbox"
              title={products.length === 0 ? 'Nothing in the store yet' : 'Nothing in this category yet'}
              description={products.length === 0 ? 'Check back soon.' : 'Try another category.'}
            />
          ) : (
            <div className="grid grid-cols-1 gap-x-8 gap-y-14 sm:grid-cols-2 lg:grid-cols-3">
              {filtered.map((product) => (
                <Link key={product.id} href={`/shop/${product.slug}`} data-cursor="View" className="group flex h-full w-full flex-col border border-ink-100 bg-paper-raised transition-colors duration-300 hover:border-ink-900">
                  {/* Square frame; the image is pinned to it and fits inside, so the WHOLE design is always visible
                      (tall posters get plain space at the sides, wide ones above and below). */}
                  <div className="relative grid aspect-square place-items-center overflow-hidden border-b border-ink-100 bg-ink-50">
                    {product.images?.[0] ? (
                      <img
                        src={product.images[0]}
                        alt={product.name}
                        className="absolute inset-0 h-full w-full object-contain transition-transform duration-[900ms] ease-[var(--ease-smooth)] group-hover:scale-[1.03]"
                      />
                    ) : product.type === 'digital' ? (
                      <DownloadSimple size={48} weight="light" aria-hidden className="text-ink-300" />
                    ) : (
                      <Package size={48} weight="light" aria-hidden className="text-ink-300" />
                    )}
                  </div>
                  <div className="p-5">
                  <p className="type-meta flex gap-x-4 capitalize">
                    <span>{tx(product.type)}</span>
                    {product.category && <span>{product.category}</span>}
                  </p>
                  <h2 className="mt-2 text-lg font-medium tracking-tight text-ink-900 transition-colors duration-300 group-hover:text-accent-600">{product.name}</h2>
                  <p className="mt-2 flex items-baseline gap-3 font-mono tabular-nums">
                    <span className="text-base text-ink-900">{Number(product.price) === 0 ? tx("Free") : `$${Number(product.price).toFixed(2)}`}</span>
                    {product.compare_at_price && (
                      <span className="text-sm text-ink-500 line-through">${Number(product.compare_at_price).toFixed(2)}</span>
                    )}
                  </p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>
    </main>
  )
}
