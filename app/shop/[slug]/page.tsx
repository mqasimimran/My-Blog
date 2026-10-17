'use client'

import { useState, useEffect, use } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { ArrowLeft, ArrowRight, DownloadSimple, Package } from '@phosphor-icons/react'
import { SkeletonBlock } from '@/app/components/Skeleton'
import EmptyState from '@/app/components/EmptyState'
import SplitText from '@/app/components/ui/SplitText'

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
}

export default function ProductDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params)
  const [product, setProduct] = useState<Product | null>(null)
  const [activeImage, setActiveImage] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    async function fetchProduct() {
      const { data, error } = await supabase
        .from('products')
        .select('id, name, type, category, description, price, compare_at_price, images, stock_quantity')
        .eq('slug', slug)
        .single()

      if (error || !data) setNotFound(true)
      else setProduct(data)
      setIsLoading(false)
    }
    fetchProduct()
  }, [slug])

  const backLink = (
    <Link href="/shop" className="inline-flex items-center gap-2 text-sm font-medium text-ink-500 transition-colors duration-200 hover:text-ink-900">
      <ArrowLeft size={16} aria-hidden /> All products
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
        <EmptyState icon="search" title="This product couldn't be found" description="It may have been removed or renamed." />
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
            <span>{product.type}</span>
            {product.category && <span>{product.category}</span>}
          </p>
          <h1 className="type-title mt-4 text-ink-900"><SplitText text={product.name} /></h1>

          <p className="mt-6 flex items-baseline gap-3 font-mono tabular-nums">
            <span className="text-2xl text-ink-900">${Number(product.price).toFixed(2)}</span>
            {product.compare_at_price && <span className="text-base text-ink-500 line-through">${Number(product.compare_at_price).toFixed(2)}</span>}
          </p>

          {product.description && <p className="mt-8 whitespace-pre-line text-base leading-relaxed text-ink-700">{product.description}</p>}

          <div className="mt-10 border-t border-ink-100 pt-8">
            {outOfStock ? (
              <p className="flex h-12 items-center justify-center bg-ink-50 text-sm font-medium text-ink-500">Out of stock</p>
            ) : (
              <Link
                href={`/shop/${slug}/checkout`}
                className="group flex h-12 w-full items-center justify-center gap-2 bg-ink-900 text-sm font-medium tracking-tight text-paper transition-[background-color,color,transform] duration-300 ease-[var(--ease-smooth)] hover:bg-accent-600 hover:text-on-accent active:translate-y-px"
              >
                Buy now, ${Number(product.price).toFixed(2)}
                <ArrowRight size={16} weight="bold" aria-hidden className="transition-transform duration-300 group-hover:translate-x-0.5" />
              </Link>
            )}
            {product.type === 'physical' && product.stock_quantity !== null && product.stock_quantity > 0 && (
              <p className="type-meta mt-4">{product.stock_quantity} in stock</p>
            )}
            {product.type === 'digital' && <p className="type-meta mt-4">Instant download after your payment is confirmed</p>}
          </div>
        </div>
      </div>
    </main>
  )
}
