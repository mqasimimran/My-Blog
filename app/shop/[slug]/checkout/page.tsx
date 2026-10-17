'use client'

import { useState, useEffect, use } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { labelFor, MANUAL_METHODS, type ManualMethod, type ManualMethodId } from '@/lib/paymentMethods'
import { ArrowLeft, CheckCircle } from '@phosphor-icons/react'
import { SkeletonBlock } from '@/app/components/Skeleton'
import EmptyState from '@/app/components/EmptyState'
import SplitText from '@/app/components/ui/SplitText'

type Product = {
  id: string
  name: string
  price: number
  type: string
}

type PaymentAccounts = {
  jazzcash_number: string | null
  jazzcash_account_name: string | null
  easypaisa_number: string | null
  easypaisa_account_name: string | null
  bank_name: string | null
  bank_account_title: string | null
  bank_account_number: string | null
  bank_iban: string | null
  payoneer_email: string | null
}

// The methods offered come from site.config.ts (payments.manualMethods)
type PaymentMethod = ManualMethodId

export default function CheckoutPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params)
  const [product, setProduct] = useState<Product | null>(null)
  const [accounts, setAccounts] = useState<PaymentAccounts | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(MANUAL_METHODS[0]?.id ?? 'jazzcash')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [transactionId, setTransactionId] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')
  const [usdToPkr, setUsdToPkr] = useState<number | null>(null)
  const [rateSource, setRateSource] = useState<'live' | 'fallback' | null>(null)

  useEffect(() => {
    async function fetchData() {
      const [productRes, settingsRes, rateRes] = await Promise.all([
        supabase.from('products').select('id, name, price, type').eq('slug', slug).single(),
        supabase
          .from('site_settings')
          .select('jazzcash_number, jazzcash_account_name, easypaisa_number, easypaisa_account_name, bank_name, bank_account_title, bank_account_number, bank_iban, payoneer_email')
          .eq('id', 1)
          .single(),
        fetch('/api/exchange-rate').then((r) => r.json()).catch(() => null),
      ])
      if (productRes.data) setProduct(productRes.data)
      if (settingsRes.data) setAccounts(settingsRes.data)
      if (rateRes) {
        setUsdToPkr(rateRes.usdToPkr)
        setRateSource(rateRes.source)
      }
      setIsLoading(false)
    }
    fetchData()
  }, [slug])

  function formatPkr(usdAmount: number): string {
    if (!usdToPkr) return ''
    const pkrAmount = Math.round(usdAmount * usdToPkr)
    return `Rs ${pkrAmount.toLocaleString('en-PK')}`
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!product) return
    setIsSubmitting(true)
    setError('')

    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: product.id,
          customerName: name,
          customerEmail: email,
          paymentMethod,
          customerTransactionId: transactionId,
        }),
      })
      const data = await res.json()
      if (res.ok) {
        setSubmitted(true)
      } else {
        setError(data.error || 'Something went wrong.')
      }
    } catch (err) {
      setError('Something went wrong. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const fieldClass =
    'h-12 w-full border border-ink-500 bg-paper-raised px-4 text-base text-ink-900 outline-none transition-colors duration-200 placeholder:text-ink-500 focus:border-accent-600'
  const labelClass = 'mb-2 block text-sm font-medium text-ink-900'

  if (isLoading) {
    return (
      <main className="container-page pb-24 pt-10 md:pt-14">
        <div className="grid gap-12 lg:grid-cols-12">
          <div className="space-y-5 lg:col-span-7">
            <SkeletonBlock className="h-10 w-48" />
            <SkeletonBlock className="h-40 w-full" />
            <SkeletonBlock className="h-12 w-full" />
            <SkeletonBlock className="h-12 w-full" />
          </div>
          <SkeletonBlock className="h-40 w-full lg:col-span-4 lg:col-start-9" />
        </div>
      </main>
    )
  }

  if (!product) {
    return (
      <main className="container-page pb-24 pt-10">
        <Link href="/shop" className="inline-flex items-center gap-2 text-sm font-medium text-ink-500 hover:text-ink-900"><ArrowLeft size={16} aria-hidden /> Back to the shop</Link>
        <EmptyState icon="search" title="This product couldn't be found" description="It may have been removed or renamed." />
      </main>
    )
  }

  if (submitted) {
    return (
      <main className="container-page flex flex-col items-start pb-24 pt-16 md:pt-24">
        <div className="max-w-xl">
          <CheckCircle size={56} weight="light" aria-hidden className="text-success" />
          <h1 className="type-h2 mt-8 text-ink-900"><SplitText text={"Thanks, order received"} /></h1>
          <p className="type-lead mt-5">
            I&rsquo;ll verify your payment and email your download link to <strong className="font-medium text-ink-900">{email}</strong> shortly, usually within a few hours.
          </p>
          <Link href="/shop" className="link-draw mt-10 inline-block text-sm font-medium text-ink-900">Back to the shop</Link>
        </div>
      </main>
    )
  }

  const hasAccount = (method: PaymentMethod): boolean => {
    if (!accounts) return false
    if (method === 'jazzcash') return !!accounts.jazzcash_number
    if (method === 'easypaisa') return !!accounts.easypaisa_number
    if (method === 'bank_transfer') return !!accounts.bank_account_number
    if (method === 'payoneer') return !!accounts.payoneer_email
    return false
  }

  const groups = MANUAL_METHODS.reduce<{ name: string; methods: ManualMethod[] }[]>((acc, m) => {
    const g = acc.find((x) => x.name === m.group)
    if (g) g.methods.push(m)
    else acc.push({ name: m.group, methods: [m] })
    return acc
  }, [])

  const amountLine = (
    <>
      Send{' '}
      {usdToPkr ? <strong className="font-medium text-ink-900">{formatPkr(Number(product.price))}</strong> : <strong className="font-medium text-ink-900">${Number(product.price).toFixed(2)}</strong>}
      {usdToPkr && <span className="text-ink-500"> (about ${Number(product.price).toFixed(2)} USD)</span>} to:
    </>
  )
  const rateNote = usdToPkr && (
    <p className="type-meta mt-4">
      Converted at about {usdToPkr.toFixed(1)} PKR/USD{rateSource === 'fallback' ? ' (estimated rate)' : ''}. Small differences from your bank&rsquo;s exact rate are fine.
    </p>
  )

  return (
    <main className="container-page pb-24 pt-10 md:pt-14">
      <Link href={`/shop/${slug}`} className="inline-flex items-center gap-2 text-sm font-medium text-ink-500 transition-colors duration-200 hover:text-ink-900">
        <ArrowLeft size={16} aria-hidden /> Back to product
      </Link>

      <div className="mt-10 grid gap-14 lg:grid-cols-12 lg:gap-16">
        <div className="lg:col-span-7">
          <h1 className="type-h2 text-ink-900"><SplitText text={"Checkout"} /></h1>

          {/* Step 1: payment method */}
          <section className="mt-12" aria-labelledby="pay-heading">
            <h2 id="pay-heading" className="type-h3 text-ink-900"><SplitText text={"Choose how to pay"} /></h2>

            {groups.map((group) => (
              <div key={group.name} className="mt-6">
                <p className="type-meta mb-3">{group.name}</p>
                <div role="radiogroup" aria-label={group.name} className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                  {group.methods.map((m) => {
                    const selected = paymentMethod === m.id
                    return (
                      <button
                        key={m.id}
                        type="button"
                        role="radio"
                        aria-checked={selected}
                        onClick={() => setPaymentMethod(m.id)}
                        className={`h-12 border px-4 text-sm font-medium transition-colors duration-200 ${
                          selected ? 'border-ink-900 bg-ink-900 text-paper' : 'border-ink-100 bg-paper-raised text-ink-700 hover:border-ink-500'
                        }`}
                      >
                        {labelFor(m.id)}
                      </button>
                    )
                  })}
                </div>
              </div>
            ))}

            <div className="mt-8 border-l-2 border-accent-600 bg-ink-50 p-6 text-[15px] leading-relaxed text-ink-700">
              {!hasAccount(paymentMethod) ? (
                <p className="text-warning">Payment details for {labelFor(paymentMethod)} haven&rsquo;t been set up yet. Please choose another method or contact me directly.</p>
              ) : paymentMethod === 'jazzcash' || paymentMethod === 'easypaisa' ? (
                <div>
                  <p>{amountLine}</p>
                  <p className="mt-3 font-mono text-xl tabular-nums text-ink-900">{paymentMethod === 'jazzcash' ? accounts?.jazzcash_number : accounts?.easypaisa_number}</p>
                  <p className="text-ink-500">{paymentMethod === 'jazzcash' ? accounts?.jazzcash_account_name : accounts?.easypaisa_account_name}</p>
                  {rateNote}
                </div>
              ) : paymentMethod === 'bank_transfer' ? (
                <div>
                  <p className="mb-4">{amountLine}</p>
                  <dl className="grid grid-cols-[auto_1fr] gap-x-6 gap-y-2">
                    <dt className="text-ink-500">Bank</dt><dd className="text-ink-900">{accounts?.bank_name}</dd>
                    <dt className="text-ink-500">Account title</dt><dd className="text-ink-900">{accounts?.bank_account_title}</dd>
                    <dt className="text-ink-500">Account #</dt><dd className="font-mono tabular-nums text-ink-900">{accounts?.bank_account_number}</dd>
                    {accounts?.bank_iban && (<><dt className="text-ink-500">IBAN</dt><dd className="break-all font-mono text-ink-900">{accounts.bank_iban}</dd></>)}
                  </dl>
                  {rateNote}
                </div>
              ) : (
                <div>
                  <p>Send <strong className="font-medium text-ink-900">${Number(product.price).toFixed(2)} USD</strong> via Payoneer (Pay a Payoneer User) to:</p>
                  <p className="mt-3 break-all font-mono text-xl text-ink-900">{accounts?.payoneer_email}</p>
                </div>
              )}
            </div>
          </section>

          {/* Step 2: details */}
          <form onSubmit={handleSubmit} className="mt-14 space-y-6" aria-labelledby="details-heading">
            <h2 id="details-heading" className="type-h3 text-ink-900"><SplitText text={"Confirm your details"} /></h2>

            {/* Honeypot */}
            <div style={{ position: 'absolute', left: '-9999px' }} aria-hidden="true">
              <input type="text" tabIndex={-1} autoComplete="off" />
            </div>

            <div>
              <label htmlFor="co-name" className={labelClass}>Your name</label>
              <input id="co-name" type="text" required autoComplete="name" value={name} onChange={(e) => setName(e.target.value)} className={fieldClass} />
            </div>

            <div>
              <label htmlFor="co-email" className={labelClass}>Email (your download link goes here)</label>
              <input id="co-email" type="email" required autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} className={fieldClass} />
            </div>

            <div>
              <label htmlFor="co-txn" className={labelClass}>
                {paymentMethod === 'bank_transfer' ? 'Transaction / reference number' : `Transaction ID from ${labelFor(paymentMethod)}`}
              </label>
              <input id="co-txn" type="text" required value={transactionId} onChange={(e) => setTransactionId(e.target.value)} className={fieldClass} />
              <p className="type-meta mt-2">Found in your payment confirmation</p>
            </div>

            {error && <p role="alert" className="text-sm text-error">{error}</p>}

            <button
              type="submit"
              disabled={isSubmitting}
              className="h-12 w-full bg-ink-900 text-sm font-medium tracking-tight text-paper transition-[background-color,color,transform] duration-300 ease-[var(--ease-smooth)] hover:bg-accent-600 hover:text-on-accent active:translate-y-px disabled:opacity-60"
            >
              {isSubmitting ? 'Submitting...' : 'I\u2019ve sent payment'}
            </button>
          </form>
        </div>

        {/* Order summary: always in view on large screens */}
        <aside className="lg:col-span-4 lg:col-start-9">
          <div className="border border-ink-100 bg-paper-raised p-6 lg:sticky lg:top-28">
            <p className="type-meta">Order summary</p>
            <p className="mt-4 text-lg font-medium tracking-tight text-ink-900">{product.name}</p>
            <div className="mt-6 flex items-baseline justify-between border-t border-ink-100 pt-5">
              <span className="text-sm text-ink-500">Total</span>
              <span className="text-right font-mono tabular-nums">
                <span className="block text-xl text-ink-900">${Number(product.price).toFixed(2)}</span>
                {usdToPkr && <span className="block text-sm text-ink-500">{formatPkr(Number(product.price))}</span>}
              </span>
            </div>
            {product.type === 'digital' && <p className="type-meta mt-5">Download link emailed after your payment is verified.</p>}
          </div>
        </aside>
      </div>
    </main>
  )
}
