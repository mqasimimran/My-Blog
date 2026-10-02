'use client'

import { useState, useEffect, use } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'

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

type PaymentMethod = 'jazzcash' | 'easypaisa' | 'bank_transfer' | 'payoneer'

const METHOD_LABELS: Record<PaymentMethod, string> = {
  jazzcash: 'JazzCash',
  easypaisa: 'EasyPaisa',
  bank_transfer: 'Bank Transfer',
  payoneer: 'Payoneer',
}

export default function CheckoutPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params)
  const [product, setProduct] = useState<Product | null>(null)
  const [accounts, setAccounts] = useState<PaymentAccounts | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('jazzcash')
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

  if (isLoading) {
    return <main className="min-h-screen flex items-center justify-center"><p className="text-gray-400 text-xs font-mono uppercase tracking-widest">Loading...</p></main>
  }

  if (!product) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center gap-6 px-6 text-center">
        <p className="text-gray-500">This product couldn't be found.</p>
        <Link href="/shop" className="text-[#aa002a] text-xs font-bold uppercase tracking-widest">← Back to Shop</Link>
      </main>
    )
  }

  if (submitted) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center gap-6 px-6 text-center max-w-md mx-auto">
        <div className="w-16 h-16 rounded-full bg-green-50 flex items-center justify-center text-3xl">✓</div>
        <h1 className="text-2xl font-light text-gray-900">Thanks — order received</h1>
        <p className="text-gray-500 text-sm leading-relaxed">
          I'll verify your payment and email your download link to <strong>{email}</strong> shortly, usually within a few hours.
        </p>
        <Link href="/shop" className="text-[#aa002a] text-xs font-bold uppercase tracking-widest">← Back to Shop</Link>
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

  const localMethods: PaymentMethod[] = ['jazzcash', 'easypaisa', 'bank_transfer']
  const internationalMethods: PaymentMethod[] = ['payoneer']

  return (
    <main className="min-h-screen bg-white font-sans pt-24 pb-24 px-6">
      <div className="max-w-md mx-auto">
        <Link href={`/shop/${slug}`} className="text-[10px] font-bold uppercase tracking-widest text-gray-400 hover:text-gray-900 transition-colors block mb-8">
          ← Back to Product
        </Link>

        <h1 className="text-2xl font-light text-gray-900 mb-1">Checkout</h1>
        <p className="text-sm text-gray-500 mb-8">{product.name} — <strong className="text-gray-900">${Number(product.price).toFixed(2)}</strong></p>

        <div className="bg-gray-50 border border-gray-200 rounded-lg p-5 mb-8">
          <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-3">Step 1 — Choose How To Pay</p>

          <p className="text-[9px] font-bold uppercase tracking-widest text-gray-400 mb-2">Local — Pakistan</p>
          <div className="flex gap-2 mb-4">
            {localMethods.map((method) => (
              <button
                key={method}
                type="button"
                onClick={() => setPaymentMethod(method)}
                className={`flex-1 py-2 text-[11px] font-bold uppercase tracking-widest rounded border ${paymentMethod === method ? 'bg-[#aa002a] text-white border-[#aa002a]' : 'border-gray-300 text-gray-500'}`}
              >
                {METHOD_LABELS[method]}
              </button>
            ))}
          </div>

          <p className="text-[9px] font-bold uppercase tracking-widest text-gray-400 mb-2">International</p>
          <div className="flex gap-2 mb-5">
            {internationalMethods.map((method) => (
              <button
                key={method}
                type="button"
                onClick={() => setPaymentMethod(method)}
                className={`flex-1 py-2 text-[11px] font-bold uppercase tracking-widest rounded border ${paymentMethod === method ? 'bg-[#aa002a] text-white border-[#aa002a]' : 'border-gray-300 text-gray-500'}`}
              >
                {METHOD_LABELS[method]}
              </button>
            ))}
          </div>

          {!hasAccount(paymentMethod) ? (
            <p className="text-sm text-amber-600">Payment details for {METHOD_LABELS[paymentMethod]} haven't been set up yet — please choose another method or contact me directly.</p>
          ) : paymentMethod === 'jazzcash' || paymentMethod === 'easypaisa' ? (
            <div className="text-sm text-gray-700">
              <p>
                Send{' '}
                {usdToPkr ? (
                  <strong>{formatPkr(Number(product.price))}</strong>
                ) : (
                  <strong>${Number(product.price).toFixed(2)}</strong>
                )}
                {usdToPkr && <span className="text-gray-400"> (≈ ${Number(product.price).toFixed(2)} USD)</span>} to:
              </p>
              <p className="font-mono text-lg mt-2">
                {paymentMethod === 'jazzcash' ? accounts?.jazzcash_number : accounts?.easypaisa_number}
              </p>
              <p className="text-gray-500">
                {paymentMethod === 'jazzcash' ? accounts?.jazzcash_account_name : accounts?.easypaisa_account_name}
              </p>
              {usdToPkr && (
                <p className="text-[10px] text-gray-400 mt-2">
                  Converted at ~{usdToPkr.toFixed(1)} PKR/USD{rateSource === 'fallback' ? ' (estimated rate)' : ''}. Small differences from your bank's exact rate are fine.
                </p>
              )}
            </div>
          ) : paymentMethod === 'bank_transfer' ? (
            <div className="text-sm text-gray-700 space-y-1">
              <p className="mb-2">
                Send{' '}
                {usdToPkr ? (
                  <strong>{formatPkr(Number(product.price))}</strong>
                ) : (
                  <strong>${Number(product.price).toFixed(2)}</strong>
                )}
                {usdToPkr && <span className="text-gray-400"> (≈ ${Number(product.price).toFixed(2)} USD)</span>} to:
              </p>
              <p><span className="text-gray-400">Bank:</span> {accounts?.bank_name}</p>
              <p><span className="text-gray-400">Account Title:</span> {accounts?.bank_account_title}</p>
              <p className="font-mono"><span className="text-gray-400 font-sans">Account #:</span> {accounts?.bank_account_number}</p>
              {accounts?.bank_iban && <p className="font-mono"><span className="text-gray-400 font-sans">IBAN:</span> {accounts.bank_iban}</p>}
              {usdToPkr && (
                <p className="text-[10px] text-gray-400 pt-2">
                  Converted at ~{usdToPkr.toFixed(1)} PKR/USD{rateSource === 'fallback' ? ' (estimated rate)' : ''}. Small differences from your bank's exact rate are fine.
                </p>
              )}
            </div>
          ) : (
            <div className="text-sm text-gray-700">
              <p>Send <strong>${Number(product.price).toFixed(2)} USD</strong> via Payoneer (Pay a Payoneer User) to:</p>
              <p className="font-mono text-lg mt-2">{accounts?.payoneer_email}</p>
            </div>
          )}
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Step 2 — Confirm Your Details</p>

          {/* Honeypot */}
          <div style={{ position: 'absolute', left: '-9999px' }} aria-hidden="true">
            <input type="text" tabIndex={-1} autoComplete="off" />
          </div>

          <div>
            <label className="block text-[10px] font-bold tracking-widest uppercase text-gray-500 mb-2">Your Name</label>
            <input type="text" required value={name} onChange={(e) => setName(e.target.value)} className="w-full border-b border-gray-300 py-2 outline-none focus:border-[#aa002a] text-sm" />
          </div>

          <div>
            <label className="block text-[10px] font-bold tracking-widest uppercase text-gray-500 mb-2">Email (your download link goes here)</label>
            <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="w-full border-b border-gray-300 py-2 outline-none focus:border-[#aa002a] text-sm" />
          </div>

          <div>
            <label className="block text-[10px] font-bold tracking-widest uppercase text-gray-500 mb-2">
              {paymentMethod === 'bank_transfer' ? 'Transaction / Reference Number' : `Transaction ID from ${METHOD_LABELS[paymentMethod]}`}
            </label>
            <input type="text" required value={transactionId} onChange={(e) => setTransactionId(e.target.value)} placeholder="Found in your payment confirmation" className="w-full border-b border-gray-300 py-2 outline-none focus:border-[#aa002a] text-sm" />
          </div>

          {error && <p className="text-xs text-red-500">{error}</p>}

          <button type="submit" disabled={isSubmitting} className="w-full bg-[#aa002a] text-white text-xs font-bold tracking-widest uppercase py-4 rounded hover:bg-gray-900 transition-colors">
            {isSubmitting ? 'Submitting...' : "I've Sent Payment"}
          </button>
        </form>
      </div>
    </main>
  )
}
