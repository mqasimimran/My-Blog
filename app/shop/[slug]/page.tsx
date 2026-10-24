'use client'

import { useState, useEffect, use } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { ArrowLeft, ArrowRight, DownloadSimple, Package } from '@phosphor-icons/react'
import { SkeletonBlock } from '@/app/components/Skeleton'
import EmptyState from '@/app/components/EmptyState'
import SplitText from '@/app/components/ui/SplitText'
import { useLocale } from '@/app/components/LocaleProvider'
import WallpaperSizes from '@/app/components/WallpaperSizes'

type Product = {
  id: string
  name: string
  type: string
  category: string | null
  description: string | null
  price: number
  compare_at_price: number | null
  images: string[] | null
  stock_quantity: number | null
  bundle_items?: string[] | null
}

export default function ProductDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { tx } = useLocale()
  const { slug } = use(params)
  const [product, setProduct] = useState<Product | null>(null)
  const [activeImage, setActiveImage] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)
  const [included, setIncluded] = useState<{ id: string; name: string; slug: string; price: number }[]>([])

  useEffect(() => {
    async function fetchProduct() {
      // Name the columns: the public may not read digital_file_url (the paid file link), so asking for
      // every column (*) would be refused. bundle_items is added by an SQL update; until it exists,
      // retry without it so product pages never break.
      const COLUMNS = 'id, name, type, category, description, price, compare_at_price, images, stock_quantity'
      let { data, error } = await supabase.from('products').select(`${COLUMNS}, bundle_items`).eq('slug', slug).single()
      if (error && /bundle_items/.test(error.message)) ({ data, error } = await supabase.from('products').select(COLUMNS).eq('slug', slug).single())

      if (error || !data) setNotFound(true)
      else {
        setProduct(data)
        // A bundle lists the products it contains (those visible in the shop), in the chosen order.
        if (data.type === 'bundle' && data.bundle_items?.length) {
          const { data: items } = await supabase.from('products').select('id, name, slug, price').in('id', data.bundle_items)
          setIncluded(data.bundle_items.map((id: string) => items?.find((i) => i.id === id)).filter(Boolean) as typeof included)
        }
      }
      setIsLoading(false)
    }
    fetchProduct()
  }, [slug])

  const backLink = (
    <Link href="/shop" className="inline-flex items-center gap-2 text-sm font-medium text-ink-500 transition-colors duration-200 hover:text-ink-900">
      <ArrowLeft size={16} aria-hidden /> {tx("All products")}
    </Link>
  )

  if (isLoading) {
    return (
      <main className="container-page pb-24 pt-10 md:pt-14">
        <div className="grid gap-12 lg:grid-cols-12 lg:gap-16">
          <SkeletonBlock className="aspect-square w-full lg:col-span-7" />
          <div className="space-y-5 lg:col-span-5">
            <SkeletonBlock className="h-3 w-28" />
            <SkeletonBlock className="h-10 w-3/4" />
            <SkeletonBlock className="h-6 w-24" />
            <SkeletonBlock className="h-24 w-full" />
            <SkeletonBlock className="h-12 w-full" />
          </div>
        </div>
      </main>
    )
  }

  if (notFound || !product) {
    return (
      <main className="container-page pb-24 pt-10">
        {backLink}
        <EmptyState icon="search" title={tx("This product couldn't be found")} description={tx("It may have been removed or renamed.")} />
      </main>
    )
  }

  const outOfStock = product.type === 'physical' && product.stock_quantity !== null && product.stock_quantity <= 0

  return (
    <main className="container-page pb-24 pt-10 md:pt-14">
      {backLink}

      <div className="mt-10 grid grid-cols-1 gap-12 lg:grid-cols-12 lg:gap-16">
        {/* Images: stay in view on large screens while you read the details */}
        <div className="lg:col-span-7">
          <div className="lg:sticky lg:top-28">
            <div className="relative grid aspect-square place-items-center overflow-hidden bg-ink-50">
              {product.images?.[activeImage] ? (
                <img src={product.images[activeImage]} alt={product.name} className="absolute inset-0 h-full w-full object-contain" />
              ) : product.type === 'digital' ? (
                <DownloadSimple size={64} weight="light" aria-hidden className="text-ink-300" />
              ) : (
                <Package size={64} weight="light" aria-hidden className="text-ink-300" />
              )}
            </div>
            {product.images && product.images.length > 1 && (
              <div className="mt-4 flex flex-wrap gap-3">
                {product.images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveImage(i)}
                    aria-label={`Show image ${i + 1}`}
                    aria-pressed={i === activeImage}
                    className={`h-20 w-20 overflow-hidden border-2 bg-ink-50 transition-colors duration-200 ${i === activeImage ? 'border-accent-600' : 'border-transparent hover:border-ink-300'}`}
                  >
                    <img src={img} alt="" className="h-full w-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Details */}
        <div className="lg:col-span-5">
          <p className="type-meta flex gap-x-4 capitalize">
            <span>{tx(product.type)}</span>
            {product.category && <span>{product.category}</span>}
          </p>
          <h1 className="type-title mt-4 text-ink-900"><SplitText text={product.name} /></h1>

          <p className="mt-6 flex items-baseline gap-3 font-mono tabular-nums">
            <span className="text-2xl text-ink-900">{Number(product.price) === 0 ? tx("Free") : `$${Number(product.price).toFixed(2)}`}</span>
            {product.compare_at_price && <span className="text-base text-ink-500 line-through">${Number(product.compare_at_price).toFixed(2)}</span>}
          </p>

          {product.description && <p className="mt-8 whitespace-pre-line text-base leading-relaxed text-ink-700">{product.description}</p>}

          {included.length > 0 && (() => {
            const separately = included.reduce((sum, i) => sum + Number(i.price), 0)
            const saving = separately - Number(product.price)
            return (
              <div className="mt-10">
                <p className="type-meta">{tx("What’s included")}</p>
                <ul className="mt-3 border-t border-ink-100">
                  {included.map((i) => (
                    <li key={i.id} className="flex items-baseline justify-between gap-4 border-b border-ink-100 py-3">
                      <Link href={`/shop/${i.slug}`} className="text-[15px] font-medium text-ink-900 hover:text-accent-600">{i.name}</Link>
                      <span className="font-mono text-sm tabular-nums text-ink-500">${Number(i.price).toFixed(2)}</span>
                    </li>
                  ))}
                </ul>
                {saving > 0.005 && <p className="mt-4 text-sm font-medium text-success">Save ${saving.toFixed(2)} compared with buying them separately</p>}
              </div>
            )
          })()}

          {product.type === 'wallpaper' && <WallpaperSizes productId={product.id} />}

          {!(product.type === 'wallpaper' && Number(product.price) === 0) && (
          <div className="mt-10 border-t border-ink-100 pt-8">
            {outOfStock ? (
              <p className="flex h-12 items-center justify-center bg-ink-50 text-sm font-medium text-ink-500">{tx("Out of stock")}</p>
            ) : (
              <Link
                href={`/shop/${slug}/checkout`}
                className="group flex h-12 w-full items-center justify-center gap-2 bg-ink-900 text-sm font-medium tracking-tight text-paper transition-[background-color,color,transform] duration-300 ease-[var(--ease-smooth)] hover:bg-accent-600 hover:text-on-accent active:translate-y-px"
              >
                {tx("Buy now")}, ${Number(product.price).toFixed(2)}
                <ArrowRight size={16} weight="bold" aria-hidden className="transition-transform duration-300 group-hover:translate-x-0.5" />
              </Link>
            )}
            {product.type === 'physical' && product.stock_quantity !== null && product.stock_quantity > 0 && (
              <p className="type-meta mt-4">{product.stock_quantity} in stock</p>
            )}
            {product.type !== 'physical' && <p className="type-meta mt-4">{tx("Instant download after your payment is confirmed")}</p>}
          </div>
          )}
        </div>
      </div>
    </main>
  )
}
