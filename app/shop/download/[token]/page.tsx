'use client'

import { useState, useEffect, use } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'

type Order = {
  product_name: string
  customer_name: string
  status: string
}

export default function DownloadPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = use(params)
  const [order, setOrder] = useState<Order | null>(null)
  const [fileUrl, setFileUrl] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    async function fetchOrder() {
      const { data, error } = await supabase
        .from('orders')
        .select('product_name, customer_name, status, product_id')
        .eq('download_token', token)
        .eq('status', 'paid')
        .single()

      if (error || !data) {
        setNotFound(true)
        setIsLoading(false)
        return
      }

      setOrder(data)

      if (data.product_id) {
        const { data: product } = await supabase.from('products').select('digital_file_url').eq('id', data.product_id).single()
        if (product?.digital_file_url) setFileUrl(product.digital_file_url)
      }

      setIsLoading(false)
    }
    fetchOrder()
  }, [token])

  if (isLoading) {
    return <main className="min-h-screen flex items-center justify-center"><p className="text-gray-400 text-xs font-mono uppercase tracking-widest">Loading...</p></main>
  }

  if (notFound || !order) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center gap-6 px-6 text-center">
        <p className="text-gray-500">This download link isn't valid, or the order hasn't been verified yet.</p>
        <Link href="/contact" className="text-[#aa002a] text-xs font-bold uppercase tracking-widest">Contact support</Link>
      </main>
    )
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center gap-6 px-6 text-center max-w-md mx-auto">
      <div className="w-16 h-16 rounded-full bg-green-50 flex items-center justify-center text-3xl">🎉</div>
      <h1 className="text-2xl font-light text-gray-900">Thanks, {order.customer_name}!</h1>
      <p className="text-gray-500 text-sm">Here's your download for <strong>{order.product_name}</strong>.</p>

      {fileUrl ? (
        <a
          href={fileUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block bg-[#aa002a] text-white text-xs font-bold tracking-widest uppercase px-8 py-4 rounded hover:bg-gray-900 transition-colors"
        >
          Download Now
        </a>
      ) : (
        <p className="text-sm text-amber-600 bg-amber-50 rounded-lg p-4">
          This file hasn't been uploaded yet — I'll send it to you directly. Reach out via the contact page if you don't hear from me soon.
        </p>
      )}

      <Link href="/shop" className="text-gray-400 text-xs hover:text-gray-900 transition-colors">← Back to Shop</Link>
    </main>
  )
}
