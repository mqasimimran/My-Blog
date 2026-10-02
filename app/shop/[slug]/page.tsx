'use client'

import { useState, useEffect, use } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'

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

  if (isLoading) {
    return <main className="min-h-screen flex items-center justify-center"><p className="text-gray-400 text-xs font-mono uppercase tracking-widest">Loading...</p></main>
  }

  if (notFound || !product) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center gap-6 px-6 text-center">
        <p className="text-gray-500">This product couldn't be found.</p>
        <Link href="/shop" className="text-[#aa002a] text-xs font-bold uppercase tracking-widest">← Back to Shop</Link>
      </main>
    )
  }

  const outOfStock = product.type === 'physical' && product.stock_quantity !== null && product.stock_quantity <= 0

  return (
    <main className="min-h-screen bg-white font-sans pt-24 pb-24 px-6">
      <div className="max-w-5xl mx-auto">
        <Link href="/shop" className="text-[10px] font-bold uppercase tracking-widest text-gray-400 hover:text-gray-900 transition-colors block mb-10">
          ← All Products
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">

          {/* Images */}
          <div>
            <div className="aspect-square bg-gray-100 rounded-xl overflow-hidden mb-4 flex items-center justify-center">
              {product.images?.[activeImage] ? (
                <img src={product.images[activeImage]} alt={product.name} className="w-full h-full object-cover" />
              ) : (
                <span className="text-6xl">{product.type === 'digital' ? '📦' : '🛍️'}</span>
              )}
            </div>
            {product.images && product.images.length > 1 && (
              <div className="flex gap-3">
                {product.images.map((img, i) => (
                  <button key={i} onClick={() => setActiveImage(i)} className={`w-16 h-16 rounded-lg overflow-hidden border-2 ${i === activeImage ? 'border-[#aa002a]' : 'border-transparent'}`}>
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Info */}
          <div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-[#aa002a] mb-3 block">
              {product.type}{product.category ? ` · ${product.category}` : ''}
            </span>
            <h1 className="text-3xl md:text-4xl font-light text-gray-900 mb-4">{product.name}</h1>

            <div className="flex items-center gap-3 mb-8">
              <span className="text-2xl font-bold text-gray-900">${Number(product.price).toFixed(2)}</span>
              {product.compare_at_price && (
                <span className="text-sm text-gray-400 line-through">${Number(product.compare_at_price).toFixed(2)}</span>
              )}
            </div>

            {product.description && (
              <p className="text-gray-600 leading-relaxed mb-10 whitespace-pre-line">{product.description}</p>
            )}

            {outOfStock ? (
              <div className="bg-gray-100 text-gray-500 text-center text-xs font-bold uppercase tracking-widest py-4 rounded">
                Out of Stock
              </div>
            ) : (
              <Link
                href={`/shop/${slug}/checkout`}
                className="block text-center bg-[#aa002a] text-white text-xs font-bold tracking-widest uppercase py-4 rounded hover:bg-gray-900 transition-colors"
              >
                Buy Now — ${Number(product.price).toFixed(2)}
              </Link>
            )}

            {product.type === 'physical' && product.stock_quantity !== null && product.stock_quantity > 0 && (
              <p className="text-xs text-gray-400 mt-4">{product.stock_quantity} in stock</p>
            )}
          </div>

        </div>
      </div>
    </main>
  )
}
