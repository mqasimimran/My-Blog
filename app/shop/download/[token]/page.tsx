'use client'

import { useState, useEffect, use } from 'react'
import Link from 'next/link'
import { ArrowUpRight, CheckCircle, DownloadSimple } from '@phosphor-icons/react'
import { SkeletonBlock } from '@/app/components/Skeleton'
import { useLocale } from '@/app/components/LocaleProvider'

type Order = { product_name: string; customer_name: string; status: string }
type FileItem = { name: string; url: string }

// A real file we're hosting (via Supabase storage) should be force-downloaded to the buyer's device.
// An external link (a Canva template, a Google Drive share, etc.) is NOT a file to download: it
// just opens normally, exactly like following any other link.
const isHostedFile = (url: string) => url.includes('.supabase.co/storage/')

export default function DownloadPage({ params }: { params: Promise<{ token: string }> }) {
  const { tx } = useLocale()
  const { token } = use(params)
  const [order, setOrder] = useState<Order | null>(null)
  const [files, setFiles] = useState<FileItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [downloading, setDownloading] = useState<string | null>(null)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    async function fetchOrder() {
      try {
        const res = await fetch(`/api/orders/download?token=${encodeURIComponent(token)}`)
        if (!res.ok) setNotFound(true)
        else {
          const data = await res.json()
          setOrder(data.order)
          setFiles(Array.isArray(data.files) ? data.files : data.fileUrl ? [{ name: data.order.product_name, url: data.fileUrl }] : [])
        }
      } catch {
        setNotFound(true)
      }
      setIsLoading(false)
    }
    fetchOrder()
  }, [token])

  async function download(file: FileItem) {
    setDownloading(file.url)
    try {
      // Browsers display images/PDFs inline by default, and the plain HTML `download` attribute is
      // unreliable across origins. Fetching the bytes and handing the browser a same-origin blob URL
      // forces an actual download regardless of file type or hosting domain.
      const res = await fetch(file.url)
      const blob = await res.blob()
      const ext = file.url.match(/\.([a-zA-Z0-9]+)(?:\?|$)/)?.[1] || 'zip'
      const safeName = file.name.replace(/[^a-z0-9]+/gi, '-').replace(/(^-|-$)/g, '').toLowerCase()
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
      window.open(file.url, '_blank')
    } finally {
      setDownloading(null)
    }
  }

  if (isLoading) {
    return (
      <main className="container-page pb-24 pt-20">
        <SkeletonBlock className="h-14 w-72" />
        <SkeletonBlock className="mt-6 h-24 w-full max-w-xl" />
      </main>
    )
  }

  if (notFound || !order) {
    return (
      <main className="container-page pb-24 pt-20">
        <h1 className="type-h2 text-ink-900">{tx("This download link isn’t working")}</h1>
        <p className="type-lead mt-5 max-w-[50ch]">{tx("The link may be mistyped, or the payment may not be verified yet. You can check your order’s status any time.")}</p>
        <Link href="/shop/order" className="link-draw mt-8 inline-block text-sm font-medium text-ink-900">{tx("Check your order status")}</Link>
      </main>
    )
  }

  return (
    <main className="container-page pb-24 pt-16 md:pt-24">
      <div className="max-w-2xl">
        <CheckCircle size={56} weight="light" aria-hidden className="text-success" />
        <h1 className="type-h2 mt-8 text-ink-900">{tx("Your download is ready")}</h1>
        <p className="type-lead mt-5">Thanks, {order.customer_name}. Here&rsquo;s {order.product_name}.</p>

        {files.length === 0 ? (
          <p className="mt-10 border-l-2 border-accent-600 bg-ink-50 p-5 text-[15px] text-ink-700">{tx("The file hasn’t been uploaded yet. I’ll send it to you by email shortly.")}</p>
        ) : (
          <ul className="mt-10 border-t border-ink-100">
            {files.map((file) => (
              <li key={file.url} className="flex flex-wrap items-center justify-between gap-4 border-b border-ink-100 py-5">
                <span className="text-base font-medium text-ink-900">{file.name}</span>
                {isHostedFile(file.url) ? (
                  <button onClick={() => download(file)} disabled={downloading === file.url} className="inline-flex h-11 items-center gap-2 bg-ink-900 px-5 text-sm font-medium text-paper transition-colors hover:bg-accent-600 hover:text-on-accent disabled:opacity-60">
                    <DownloadSimple size={16} weight="bold" aria-hidden /> {downloading === file.url ? 'Downloading...' : 'Download'}
                  </button>
                ) : (
                  <a href={file.url} target="_blank" rel="noopener noreferrer" className="inline-flex h-11 items-center gap-2 bg-ink-900 px-5 text-sm font-medium text-paper transition-colors hover:bg-accent-600 hover:text-on-accent">
                    Open <ArrowUpRight size={16} weight="bold" aria-hidden />
                  </a>
                )}
              </li>
            ))}
          </ul>
        )}
        <Link href="/shop" className="link-draw mt-10 inline-block text-sm font-medium text-ink-900">{tx("Back to the shop")}</Link>
      </div>
    </main>
  )
}
