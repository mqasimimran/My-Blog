'use client'

import { Suspense, useState } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { ArrowRight, CheckCircle, Clock, WarningCircle } from '@phosphor-icons/react'
import SplitText from '@/app/components/ui/SplitText'

type Result = { orderNumber: string; product: string; status: string; placedAt: string; verifiedAt: string | null; downloadUrl: string | null }

const fmt = (iso: string) => new Date(iso).toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit' })

function OrderStatus() {
  const params = useSearchParams()
  const [orderNumber, setOrderNumber] = useState(params.get('order') || '')
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [result, setResult] = useState<Result | null>(null)

  async function lookUp(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    setResult(null)
    try {
      const res = await fetch('/api/orders/status', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ orderNumber, email }) })
      const data = await res.json()
      if (res.ok) setResult(data)
      else setError(data.error || 'Something went wrong. Please try again.')
    } catch {
      setError('Something went wrong. Please try again.')
    }
    setLoading(false)
  }

  const field = 'h-12 w-full border border-ink-500 bg-paper-raised px-4 text-base text-ink-900 outline-none transition-colors duration-200 placeholder:text-ink-500 focus:border-accent-600'

  return (
    <main className="container-page pb-24 pt-12 md:pt-20">
      <h1 className="type-display text-ink-900"><SplitText text="Order status" /></h1>
      <p className="type-lead mt-6 max-w-[48ch]">Check whether your payment has been verified. You&rsquo;ll find your order number on the confirmation screen and in your email.</p>

      <div className="mt-12 grid gap-12 lg:grid-cols-12">
        <form onSubmit={lookUp} className="space-y-6 lg:col-span-5">
          <div>
            <label htmlFor="os-order" className="mb-2 block text-sm font-medium text-ink-900">Order number</label>
            <input id="os-order" required value={orderNumber} onChange={(e) => setOrderNumber(e.target.value)} placeholder="e.g. ORD-12345" className={`${field} font-mono uppercase`} />
          </div>
          <div>
            <label htmlFor="os-email" className="mb-2 block text-sm font-medium text-ink-900">Email used at checkout</label>
            <input id="os-email" type="email" required autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} className={field} />
          </div>
          <button type="submit" disabled={loading} className="h-12 w-full bg-ink-900 text-sm font-medium tracking-tight text-paper transition-[background-color,color] duration-300 hover:bg-accent-600 hover:text-on-accent disabled:opacity-60">
            {loading ? 'Checking...' : 'Check status'}
          </button>
          {error && <p role="alert" className="text-sm text-error">{error}</p>}
        </form>

        <div className="lg:col-span-6 lg:col-start-7" aria-live="polite">
          {result && (
            <div className="border border-ink-100 bg-paper-raised p-8">
              <p className="type-meta">Order {result.orderNumber}</p>
              <p className="mt-2 text-xl font-medium tracking-tight text-ink-900">{result.product}</p>
              {result.status === 'paid' ? (
                <div className="mt-6 flex items-start gap-3">
                  <CheckCircle size={28} weight="fill" aria-hidden className="shrink-0 text-success" />
                  <div>
                    <p className="font-medium text-ink-900">Payment verified</p>
                    <p className="mt-1 text-sm text-ink-700">{result.verifiedAt ? `Verified ${fmt(result.verifiedAt)}.` : 'Your payment has been verified.'}</p>
                    {result.downloadUrl && (
                      <Link href={result.downloadUrl} className="mt-5 inline-flex h-11 items-center gap-2 bg-ink-900 px-5 text-sm font-medium text-paper hover:bg-accent-600 hover:text-on-accent">
                        Go to your download <ArrowRight size={16} aria-hidden />
                      </Link>
                    )}
                  </div>
                </div>
              ) : result.status === 'rejected' ? (
                <div className="mt-6 flex items-start gap-3">
                  <WarningCircle size={28} weight="fill" aria-hidden className="shrink-0 text-error" />
                  <div>
                    <p className="font-medium text-ink-900">We couldn&rsquo;t verify this payment</p>
                    <p className="mt-1 text-sm text-ink-700">If you believe this is a mistake, <Link href={`/contact?subject=${encodeURIComponent(`Order ${result.orderNumber}`)}`} className="underline underline-offset-4">get in touch</Link> with your transaction ID.</p>
                  </div>
                </div>
              ) : (
                <div className="mt-6 flex items-start gap-3">
                  <Clock size={28} weight="fill" aria-hidden className="shrink-0 text-warning" />
                  <div>
                    <p className="font-medium text-ink-900">Payment being verified</p>
                    <p className="mt-1 text-sm text-ink-700">Placed {fmt(result.placedAt)}. Payments are checked by hand, usually within a few hours. You&rsquo;ll get an email as soon as it&rsquo;s done.</p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </main>
  )
}

export default function OrderStatusPage() {
  return (
    <Suspense fallback={<main className="container-page pb-24 pt-20"><div className="h-14 w-72 bg-ink-50 motion-safe:animate-pulse" /></main>}>
      <OrderStatus />
    </Suspense>
  )
}
