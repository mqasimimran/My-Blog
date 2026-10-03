'use client'

import { useState, useEffect } from 'react'
import { useSession, signOut } from 'next-auth/react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import AdminNav from '@/app/admin/AdminNav'

type Product = {
  id: string
  name: string
  type: string
  category: string | null
  price: number
  images: string[] | null
  active: boolean
  featured: boolean
  order_index: number
}

export default function AdminShopPage() {
  const { data: session, status } = useSession()
  const [products, setProducts] = useState<Product[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function fetchProducts() {
      const { data, error } = await supabase
        .from('products')
        .select('id, name, type, category, price, images, active, featured, order_index')
        .order('order_index', { ascending: true })

      if (error) console.error('Error fetching products:', error)
      else setProducts(data || [])
      setIsLoading(false)
    }
    if (status === 'authenticated') fetchProducts()
  }, [status])

  async function moveItem(index: number, direction: 'up' | 'down') {
    if ((direction === 'up' && index === 0) || (direction === 'down' && index === products.length - 1)) return
    const targetIndex = direction === 'up' ? index - 1 : index + 1
    const current = products[index]
    const target = products[targetIndex]

    await supabase.from('products').update({ order_index: target.order_index }).eq('id', current.id)
    await supabase.from('products').update({ order_index: current.order_index }).eq('id', target.id)

    const reordered = [...products]
    reordered[index] = target
    reordered[targetIndex] = current
    setProducts(reordered)
  }

  async function toggleFeatured(product: Product) {
    const { error } = await supabase.from('products').update({ featured: !product.featured }).eq('id', product.id)
    if (error) alert('Error: ' + error.message)
    else setProducts(prev => prev.map(p => p.id === product.id ? { ...p, featured: !p.featured } : p))
  }

  async function toggleActive(product: Product) {
    const { error } = await supabase.from('products').update({ active: !product.active }).eq('id', product.id)
    if (error) alert('Error: ' + error.message)
    else setProducts(prev => prev.map(p => p.id === product.id ? { ...p, active: !p.active } : p))
  }

  async function deleteProduct(product: Product) {
    if (!confirm(`Delete "${product.name}"?`)) return
    const { error } = await supabase.from('products').delete().eq('id', product.id)
    if (error) alert('Error: ' + error.message)
    else setProducts(prev => prev.filter(p => p.id !== product.id))
  }

  if (status === 'loading' || isLoading) {
    return <div className="min-h-screen bg-paper flex items-center justify-center font-mono text-sm text-ink-500">Loading admin portal...</div>
  }
  if (!session) return null

  return (
    <div className="min-h-screen bg-paper flex flex-col md:flex-row font-sans">
      <AdminNav />

      <main className="flex-1 p-10 overflow-y-auto">
        <div className="max-w-5xl mx-auto">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-10">
            <div>
              <h1 className="text-3xl font-light tracking-wide uppercase text-ink-900">Shop</h1>
              <p className="text-xs text-ink-500 mt-1">Browsing and checkout are both live on /shop</p>
            </div>
            <Link href="/admin/shop/new" className="bg-accent-600 text-white text-xs font-bold tracking-widest uppercase px-6 py-3 rounded-none hover:bg-gray-900 transition-colors">
              + New Product
            </Link>
          </div>

          {products.length === 0 ? (
            <div className="bg-paper rounded-none shadow-sm border border-ink-100 p-10 text-center text-sm text-ink-500">
              No products yet. Click "+ New Product" to add your first one.
            </div>
          ) : (
            <div className="space-y-4">
              {products.map((product, index) => (
                <div key={product.id} className="bg-paper p-4 border border-ink-100 rounded-none flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between shadow-sm hover:border-ink-100 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="flex flex-col gap-1">
                      <button onClick={() => moveItem(index, 'up')} disabled={index === 0} className="w-6 h-6 bg-ink-100 hover:bg-ink-100 disabled:opacity-30 rounded-none flex items-center justify-center text-[10px] font-bold">▲</button>
                      <button onClick={() => moveItem(index, 'down')} disabled={index === products.length - 1} className="w-6 h-6 bg-ink-100 hover:bg-ink-100 disabled:opacity-30 rounded-none flex items-center justify-center text-[10px] font-bold">▼</button>
                    </div>
                    {product.images?.[0] ? (
                      <img src={product.images[0]} alt={product.name} className="w-14 h-14 object-cover rounded-none border border-ink-100" />
                    ) : (
                      <div className="w-14 h-14 rounded-none border border-dashed border-ink-100 bg-paper flex items-center justify-center text-[8px] text-ink-300 uppercase text-center">No photo</div>
                    )}
                    <div>
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="text-[10px] font-bold tracking-widest uppercase text-accent-600">{product.type}</span>
                        {product.category && <span className="text-[10px] text-ink-300">· {product.category}</span>}
                        {!product.active && <span className="text-[9px] font-bold tracking-widest uppercase bg-amber-50 text-amber-700 px-2 py-0.5 rounded-none">Hidden</span>}
                      </div>
                      <h2 className="text-base font-medium text-ink-900">{product.name}</h2>
                      <p className="text-xs text-ink-500">${Number(product.price).toFixed(2)}</p>
                    </div>
                  </div>
                  <div className="flex items-center flex-wrap gap-4">
                    <button
                      onClick={() => toggleFeatured(product)}
                      className={`text-[9px] font-bold tracking-widest uppercase px-2 py-1 rounded-none transition-colors ${
                        product.featured ? 'bg-accent-600 text-white hover:bg-gray-900' : 'bg-ink-100 text-ink-300 hover:bg-ink-100'
                      }`}
                    >
                      {product.featured ? '★ Featured' : '☆ Feature'}
                    </button>
                    <button onClick={() => toggleActive(product)} className="text-xs font-bold tracking-widest text-ink-500 hover:text-ink-900 uppercase cursor-pointer">
                      {product.active ? 'Hide' : 'Show'}
                    </button>
                    <Link href={`/admin/shop/edit/${product.id}`} className="text-xs font-bold tracking-widest text-ink-500 hover:text-accent-600 uppercase">Edit</Link>
                    <button onClick={() => deleteProduct(product)} className="text-xs font-bold tracking-widest text-red-500 hover:text-red-700 uppercase">Delete</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
