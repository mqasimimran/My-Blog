'use client'

import { useState, useEffect, use } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { labelFor, MANUAL_METHODS, type ManualMethod, type ManualMethodId } from '@/lib/paymentMethods'
import { ArrowLeft, CheckCircle } from '@phosphor-icons/react'
import { SkeletonBlock } from '@/app/components/Skeleton'
import EmptyState from '@/app/components/EmptyState'
import SplitText from '@/app/components/ui/SplitText'
import { useLocale } from '@/app/components/LocaleProvider'

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
type PaymentMethod = ManualMethodId | 'card'

export default function CheckoutPage({ params }: { params: Promise<{ slug: string }> }) {
  const { tx } = useLocale()
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
  const [orderNumber, setOrderNumber] = useState('')
  const [cardAvailable, setCardAvailable] = useState(false)
  const [discount, setDiscount] = useState<{ code: string; amount: number; total: number } | null>(null)
  const [codeInput, setCodeInput] = useState('')
  const [codeMsg, setCodeMsg] = useState('')
  const [checkingCode, setCheckingCode] = useState(false)
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

  // Card payment is offered when the shop has it switched on for this product.
  useEffect(() => {
    if (!product?.id) return
    fetch(`/api/orders/card?productId=${product.id}`).then((r) => r.json()).then((d) => setCardAvailable(!!d.available)).catch(() => {})
  }, [product?.id])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (paymentMethod === 'card') {
      setIsSubmitting(true)
      setError('')
      try {
        const res = await fetch('/api/orders/card', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ productId: product?.id, customerName: name, customerEmail: email, discountCode: discount?.code || undefined }) })
        const data = await res.json()
        if (res.ok && data.url) { window.location.href = data.url; return }
        setError(data.error || tx('Something went wrong. Try again in a moment.'))
      } catch {
        setError(tx('Something went wrong. Try again in a moment.'))
      }
      setIsSubmitting(false)
      return
    }
    if (!product) return
    setIsSubmitting(true)
    setError('')

    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          discountCode: discount?.code || undefined,
          productId: product.id,
          customerName: name,
          customerEmail: email,
          paymentMethod,
          customerTransactionId: transactionId,
        }),
      })
      const data = await res.json()
      if (res.ok) {
        setOrderNumber(typeof data.orderNumber === 'string' && data.orderNumber !== 'N/A' ? data.orderNumber : '')
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
        <Link href="/shop" className="inline-flex items-center gap-2 text-sm font-medium text-ink-500 hover:text-ink-900"><ArrowLeft size={16} aria-hidden /> {tx("Back to the shop")}</Link>
        <EmptyState icon="search" title={tx("This product couldn't be found")} description={tx("It may have been removed or renamed.")} />
      </main>
    )
  }

  if (submitted) {
    return (
      <main className="container-page flex flex-col items-start pb-24 pt-16 md:pt-24">
        <div className="max-w-xl">
          <CheckCircle size={56} weight="light" aria-hidden className="text-success" />
          <h1 className="type-h2 mt-8 text-ink-900"><SplitText text={tx("Thanks, order received")} /></h1>
          <p className="type-lead mt-5">
            I&rsquo;ll verify your payment and email your download link to <strong className="font-medium text-ink-900">{email}</strong> shortly, usually within a few hours.
          </p>
          {orderNumber && (
            <p className="mt-6 text-base text-ink-700">
              Your order number is <strong className="font-mono font-medium text-ink-900">{orderNumber}</strong>.{' '}
              <Link href={`/shop/order?order=${encodeURIComponent(orderNumber)}`} className="underline underline-offset-4 hover:text-accent-600">{tx("Track your order")}</Link> any time.
            </p>
          )}
          <Link href="/shop" className="link-draw mt-10 inline-block text-sm font-medium text-ink-900">{tx("Back to the shop")}</Link>
        </div>
      </main>
    )
  }

  // What the buyer pays: the discounted total once a code is applied.
  const total = discount ? discount.total : Number(product.price)

  async function applyCode(e: React.FormEvent) {
    e.preventDefault()
    if (!codeInput.trim() || !product) return
    setCheckingCode(true)
    setCodeMsg('')
    try {
      const res = await fetch('/api/discounts/check', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ code: codeInput, productId: product.id }) })
      const data = await res.json()
      if (res.ok) {
        setDiscount(data)
        setCodeInput('')
      } else setCodeMsg(data.error || "That code isn't valid.")
    } catch {
      setCodeMsg('Could not check the code. Please try again.')
    }
    setCheckingCode(false)
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
      {usdToPkr ? <strong className="font-medium text-ink-900">{formatPkr(total)}</strong> : <strong className="font-medium text-ink-900">${total.toFixed(2)}</strong>}
      {usdToPkr && <span className="text-ink-500"> (about ${total.toFixed(2)} USD)</span>} to:
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
        <ArrowLeft size={16} aria-hidden /> {tx("Back to product")}
      </Link>

      <div className="mt-10 grid gap-14 lg:grid-cols-12 lg:gap-16">
        <div className="lg:col-span-7">
          <h1 className="type-h2 text-ink-900"><SplitText text={tx("Checkout")} /></h1>

          {/* Step 1: payment method */}
          <section className="mt-12" aria-labelledby="pay-heading">
            <h2 id="pay-heading" className="type-h3 text-ink-900"><SplitText text={tx("Choose how to pay")} /></h2>

            {cardAvailable && (
              <div className="mt-6">
                <p className="type-meta mb-3">{tx('Pay by card')}</p>
                <div role="radiogroup" aria-label={tx('Pay by card')} className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                  <button type="button" role="radio" aria-checked={paymentMethod === 'card'} onClick={() => setPaymentMethod('card')}
                    className={`h-12 border px-4 text-sm font-medium transition-colors duration-200 ${paymentMethod === 'card' ? 'border-ink-900 bg-ink-900 text-paper' : 'border-ink-100 bg-paper-raised text-ink-700 hover:border-ink-500'}`}>
                    {tx('Card (Visa, Mastercard)')}
                  </button>
                </div>
              </div>
            )}
            {groups.map((group) => (
              <div key={group.name} className="mt-6">
                <p className="type-meta mb-3">{tx(group.name)}</p>
                <div role="radiogroup" aria-label={tx(group.name)} className="grid grid-cols-2 gap-3 sm:grid-cols-3">
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
              {paymentMethod === 'card' ? (
                <div>
                  <p>{tx('Pay securely by card on the next step. Lemon Squeezy processes the payment, and your download link is emailed as soon as it goes through.')}</p>
                  <p className="mt-3 font-mono text-xl tabular-nums text-ink-900">${total.toFixed(2)} USD</p>
                </div>
              ) : !hasAccount(paymentMethod) ? (
                <p className="text-warning">{tx('Payment details for {method} haven\u2019t been set up yet. Please choose another method or contact me directly.').replace('{method}', labelFor(paymentMethod))}</p>
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
                    <dt className="text-ink-500">{tx("Bank")}</dt><dd className="text-ink-900">{accounts?.bank_name}</dd>
                    <dt className="text-ink-500">{tx("Account title")}</dt><dd className="text-ink-900">{accounts?.bank_account_title}</dd>
                    <dt className="text-ink-500">{tx("Account #")}</dt><dd className="font-mono tabular-nums text-ink-900">{accounts?.bank_account_number}</dd>
                    {accounts?.bank_iban && (<><dt className="text-ink-500">{tx("IBAN")}</dt><dd className="break-all font-mono text-ink-900">{accounts.bank_iban}</dd></>)}
                  </dl>
                  {rateNote}
                </div>
              ) : (
                <div>
                  <p>{tx("Send")} <strong className="font-medium text-ink-900">${total.toFixed(2)} USD</strong> {tx("via Payoneer (Pay a Payoneer User) to:")}</p>
                  <p className="mt-3 break-all font-mono text-xl text-ink-900">{accounts?.payoneer_email}</p>
                </div>
              )}
            </div>
          </section>

          {/* Step 2: details */}
          <form onSubmit={handleSubmit} className="mt-14 space-y-6" aria-labelledby="details-heading">
            <h2 id="details-heading" className="type-h3 text-ink-900"><SplitText text={tx("Confirm your details")} /></h2>

            {/* Honeypot */}
            <div style={{ position: 'absolute', width: 1, height: 1, overflow: 'hidden', clipPath: 'inset(50%)', whiteSpace: 'nowrap' }} aria-hidden="true">
              <input type="text" tabIndex={-1} autoComplete="off" />
            </div>

            <div>
              <label htmlFor="co-name" className={labelClass}>{tx("Your name")}</label>
              <input id="co-name" type="text" required autoComplete="name" value={name} onChange={(e) => setName(e.target.value)} className={fieldClass} />
            </div>

            <div>
              <label htmlFor="co-email" className={labelClass}>{tx("Email (your download link goes here)")}</label>
              <input id="co-email" type="email" required autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} className={fieldClass} />
            </div>

            {paymentMethod !== 'card' && (
            <div>
              <label htmlFor="co-txn" className={labelClass}>
                {paymentMethod === 'bank_transfer' ? tx('Transaction / reference number') : tx('Transaction ID from {method}').replace('{method}', labelFor(paymentMethod))}
              </label>
              <input id="co-txn" type="text" required value={transactionId} onChange={(e) => setTransactionId(e.target.value)} className={fieldClass} />
              <p className="type-meta mt-2">{tx("Found in your payment confirmation")}</p>
            </div>
            )}

            {error && <p role="alert" className="text-sm text-error">{error}</p>}

            <button
              type="submit"
              disabled={isSubmitting}
              className="h-12 w-full bg-ink-900 text-sm font-medium tracking-tight text-paper transition-[background-color,color,transform] duration-300 ease-[var(--ease-smooth)] hover:bg-accent-600 hover:text-on-accent active:translate-y-px disabled:opacity-60"
            >
              {isSubmitting ? tx('Submitting...') : paymentMethod === 'card' ? tx('Continue to secure card payment') : tx('I\u2019ve sent payment')}
            </button>
          </form>
        </div>

        {/* Order summary: always in view on large screens */}
        <aside className="lg:col-span-4 lg:col-start-9">
          <div className="border border-ink-100 bg-paper-raised p-6 lg:sticky lg:top-28">
            <p className="type-meta">{tx("Order summary")}</p>
            <p className="mt-4 text-lg font-medium tracking-tight text-ink-900">{product.name}</p>
            <div className="mt-6 border-t border-ink-100 pt-5">
              {discount ? (
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between text-ink-500"><span>{tx("Subtotal")}</span><span className="font-mono tabular-nums">${Number(product.price).toFixed(2)}</span></div>
                  <div className="flex items-baseline justify-between">
                    <span className="text-ink-700">
                      Code <span className="font-mono text-ink-900">{discount.code}</span>
                      <button type="button" onClick={() => setDiscount(null)} className="ml-2 text-xs text-ink-500 underline underline-offset-2 hover:text-ink-900">{tx("Remove")}</button>
                    </span>
                    <span className="font-mono tabular-nums text-success">-${discount.amount.toFixed(2)}</span>
                  </div>
                </div>
              ) : (
                <form onSubmit={applyCode} className="flex gap-2">
                  <label htmlFor="co-code" className="sr-only">{tx("Discount code")}</label>
                  <input id="co-code" value={codeInput} onChange={(e) => setCodeInput(e.target.value)} placeholder={tx("Discount code")} autoComplete="off" className="h-10 min-w-0 flex-1 border border-ink-500 bg-paper-raised px-3 font-mono text-sm uppercase text-ink-900 outline-none placeholder:normal-case placeholder:text-ink-500 focus:border-accent-600" />
                  <button type="submit" disabled={checkingCode} className="h-10 shrink-0 border border-ink-900 px-4 text-xs font-medium uppercase tracking-[0.08em] text-ink-900 transition-colors hover:bg-ink-900 hover:text-paper disabled:opacity-60">{checkingCode ? '...' : tx('Apply')}</button>
                </form>
              )}
              {codeMsg && <p role="alert" className="mt-2 text-xs text-error">{codeMsg}</p>}
            </div>
            <div className="mt-6 flex items-baseline justify-between border-t border-ink-100 pt-5">
              <span className="text-sm text-ink-500">{tx("Total")}</span>
              <span className="text-right font-mono tabular-nums">
                <span className="block text-xl text-ink-900">${total.toFixed(2)}</span>
                {usdToPkr && <span className="block text-sm text-ink-500">{formatPkr(total)}</span>}
              </span>
            </div>
            {product.type !== 'physical' && <p className="type-meta mt-5">{tx("Download link emailed after your payment is verified.")}</p>}
          </div>
        </aside>
      </div>
    </main>
  )
}
