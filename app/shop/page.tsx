'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'

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

export default function ShopPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [activeFilter, setActiveFilter] = useState<'All' | 'Digital' | 'Physical'>('All')

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

  const filtered = activeFilter === 'All'
    ? products
    : products.filter((p) => p.type.toLowerCase() === activeFilter.toLowerCase())

  return (
    <main className="min-h-screen bg-paper font-sans">
      <section className="bg-gradient-to-br from-ink-100 to-paper py-24 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-light tracking-wide uppercase text-ink-900 mb-6">
            Store
          </h1>
          <p className="text-ink-500 text-sm md:text-base leading-relaxed max-w-xl mx-auto">
            Templates, design resources, and a few physical pieces — browse what's available below.
          </p>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-6 py-20">
        <div className="flex justify-center gap-2 mb-12">
          {(['All', 'Digital', 'Physical'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveFilter(tab)}
              className={`text-[11px] font-bold uppercase tracking-widest px-4 py-2 rounded-full transition-colors ${
                activeFilter === tab ? 'bg-accent-600 text-white' : 'bg-ink-100 text-ink-500 hover:bg-ink-100'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {isLoading ? (
          <div className="text-center py-20 text-ink-300 text-xs font-mono uppercase tracking-widest">Loading...</div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 text-ink-300 text-sm">
            {products.length === 0 ? "Nothing in the store yet — check back soon." : "Nothing in this category yet."}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((product) => (
              <Link
                key={product.id}
                href={`/shop/${product.slug}`}
                className="group border border-ink-100 rounded-none overflow-hidden flex flex-col hover:shadow-lg transition-shadow bg-paper"
              >
                <div className="h-56 bg-ink-100 flex items-center justify-center overflow-hidden">
                  {product.images?.[0] ? (
                    <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  ) : (
                    <span className="text-4xl">{product.type === 'digital' ? '📦' : '🛍️'}</span>
                  )}
                </div>
                <div className="p-6 flex flex-col flex-1">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-accent-600 mb-1">
                    {product.type}{product.category ? ` · ${product.category}` : ''}
                  </span>
                  <h2 className="text-base font-medium text-ink-900 mb-2">{product.name}</h2>
                  <div className="mt-auto flex items-center gap-2">
                    <span className="text-sm font-bold text-ink-900">${Number(product.price).toFixed(2)}</span>
                    {product.compare_at_price && (
                      <span className="text-xs text-ink-300 line-through">${Number(product.compare_at_price).toFixed(2)}</span>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </main>
  )
}
