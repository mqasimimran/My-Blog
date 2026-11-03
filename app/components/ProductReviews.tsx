'use client'

import { useEffect, useState } from 'react'
import { useLocale } from '@/app/components/LocaleProvider'
import { dateLocale } from '@/lib/i18n'
import Stars from '@/app/components/Stars'

type R = { name: string; rating: number; body: string | null; created_at: string }

// Approved reviews from verified buyers, under a product.
export default function ProductReviews({ productId }: { productId: string }) {
  const { tx, locale } = useLocale()
  const [d, setD] = useState<{ reviews: R[]; count: number; average: number } | null>(null)
  useEffect(() => { fetch(`/api/reviews?productId=${productId}`).then((r) => r.json()).then(setD).catch(() => {}) }, [productId])
  if (!d?.count) return null
  return (
    <section className="mt-16 border-t border-ink-100 pt-10" aria-labelledby="reviews-heading">
      <div className="flex flex-wrap items-center gap-4"><h2 id="reviews-heading" className="type-h2 text-ink-900">{tx('Reviews')}</h2><Stars value={d.average} size={22} /><span className="text-ink-700">{d.average.toFixed(1)} &middot; {d.count} {d.count === 1 ? tx('review') : tx('reviews')}</span></div>
      <ul className="mt-6 space-y-6">{d.reviews.map((r, i) => (
        <li key={i} className="border-b border-ink-100 pb-6"><div className="flex flex-wrap items-center gap-3"><Stars value={r.rating} size={15} /><span className="font-medium text-ink-900" dir="auto">{r.name}</span><span className="text-xs text-success">{tx('Verified buyer')}</span><span className="text-xs text-ink-500">{new Date(r.created_at).toLocaleDateString(dateLocale(locale), { dateStyle: 'medium' })}</span></div>
          {r.body && <p className="mt-2 whitespace-pre-line text-ink-700" dir="auto">{r.body}</p>}</li>))}</ul>
    </section>
  )
}
