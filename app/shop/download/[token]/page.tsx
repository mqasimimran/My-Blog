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
  const [isDownloading, setIsDownloading] = useState(false)
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

  // A real file we're hosting (via Supabase storage) should be force-
  // downloaded to the buyer's device. An external link (a Canva template,
  // a Google Drive share, etc.) is NOT a file to download — it should just
  // open normally, exactly like following any other link.
  const isHostedFile = fileUrl?.includes('.supabase.co/storage/') ?? false

  async function handleDownload() {
    if (!fileUrl || !order) return
    setIsDownloading(true)
    try {
      // Browsers display images/PDFs inline by default, and the plain
      // HTML `download` attribute is unreliable across origins (Chrome in
      // particular often ignores it for cross-domain URLs). Fetching the
      // bytes ourselves and handing the browser a same-origin blob URL is
      // the reliable way to force an actual download regardless of file
      // type or hosting domain.
      const res = await fetch(fileUrl)
      const blob = await res.blob()
      const extMatch = fileUrl.match(/\.([a-zA-Z0-9]+)(?:\?|$)/)
      const ext = extMatch ? extMatch[1] : 'zip'
      const safeName = order.product_name.replace(/[^a-z0-9]+/gi, '-').replace(/(^-|-$)/g, '').toLowerCase()

      const blobUrl = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = blobUrl
      a.download = `${safeName}.${ext}`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(blobUrl)
    } catch (err) {
      console.error('Forced download failed, falling back to opening the file directly:', err)
      window.open(fileUrl, '_blank')
    } finally {
      setIsDownloading(false)
    }
  }

  if (isLoading) {
    return <main className="min-h-screen bg-paper flex items-center justify-center"><p className="text-ink-300 text-xs font-mono uppercase tracking-widest">Loading...</p></main>
  }

  if (notFound || !order) {
    return (
      <main className="min-h-screen bg-paper flex flex-col items-center justify-center gap-6 px-6 text-center">
        <p className="text-ink-500">This download link isn't valid, or the order hasn't been verified yet.</p>
        <Link href="/contact" className="text-accent-600 text-xs font-bold uppercase tracking-widest">Contact support</Link>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-paper flex flex-col items-center justify-center gap-6 px-6 text-center max-w-md mx-auto">
      <div className="w-16 h-16 rounded-full bg-green-50 flex items-center justify-center text-3xl">🎉</div>
      <h1 className="text-2xl font-light text-ink-900">Thanks, {order.customer_name}!</h1>
      <p className="text-ink-500 text-sm">Here's your download for <strong>{order.product_name}</strong>.</p>

      {fileUrl && isHostedFile ? (
        <button
          onClick={handleDownload}
          disabled={isDownloading}
          className="inline-block bg-accent-600 text-white text-xs font-bold tracking-widest uppercase px-8 py-4 rounded-none hover:bg-gray-900 transition-colors disabled:opacity-60"
        >
          {isDownloading ? 'Preparing...' : 'Download Now'}
        </button>
      ) : fileUrl ? (
        <a
          href={fileUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block bg-accent-600 text-white text-xs font-bold tracking-widest uppercase px-8 py-4 rounded-none hover:bg-gray-900 transition-colors"
        >
          Open Link
        </a>
      ) : (
        <p className="text-sm text-amber-600 bg-amber-50 rounded-none p-4">
          This file hasn't been uploaded yet — I'll send it to you directly. Reach out via the contact page if you don't hear from me soon.
        </p>
      )}

      <Link href="/shop" className="text-ink-300 text-xs hover:text-ink-900 transition-colors">← Back to Shop</Link>
    </main>
  )
}
