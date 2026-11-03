'use client'

import { useEffect, useState } from 'react'
import AdminNav from '@/app/admin/AdminNav'
import { adminApi } from '@/lib/adminApi'
import Stars from '@/app/components/Stars'

type R = { id: string; product_id: string; name: string; rating: number; body: string | null; status: 'pending' | 'approved'; created_at: string }

// Admin -> Reviews: approve or delete reviews from verified buyers.
export default function ReviewsAdmin() {
  const [list, setList] = useState<R[]>([]), [products, setProducts] = useState<Record<string, string>>({}), [tab, setTab] = useState<'pending' | 'approved'>('pending'), [msg, setMsg] = useState('')
  const load = async () => {
    try { setList(((await adminApi.list('product_reviews', { orderBy: 'created_at', ascending: false })) as R[]) || []) } catch { setMsg('Could not load. Has the latest SQL update been run?') }
    const p = ((await adminApi.list('products').catch(() => [])) as { id: string; name: string }[]) || []; setProducts(Object.fromEntries(p.map((x) => [x.id, x.name])))
  }
  useEffect(() => { load() }, [])
  const shown = list.filter((r) => r.status === tab)
  return (
    <div className="flex min-h-screen">
      <AdminNav />
      <main className="flex-1 px-6 py-10 md:px-12">
        <h1 className="text-4xl text-ink-900">Reviews</h1>
        <p className="mt-2 text-sm text-ink-500">Reviews come only from people who bought the product. Approved ones show on the product page and as stars in Google.</p>
        {msg && <p role="status" className="mt-4 text-sm text-error">{msg}</p>}
        <div role="tablist" className="mt-6 flex gap-2">{(['pending', 'approved'] as const).map((t) => <button key={t} role="tab" aria-selected={tab === t} onClick={() => setTab(t)} className={`px-4 py-2 text-xs font-medium uppercase tracking-[0.08em] ${tab === t ? 'bg-ink-900 text-paper' : 'border border-ink-100 text-ink-700'}`}>{t === 'pending' ? `Waiting (${list.filter((r) => r.status === 'pending').length})` : 'Approved'}</button>)}</div>
        <ul className="mt-6 space-y-3">
          {shown.length === 0 && <li className="text-sm text-ink-500">{tab === 'pending' ? 'Nothing waiting.' : 'No approved reviews yet.'}</li>}
          {shown.map((r) => (
            <li key={r.id} className="border border-ink-100 bg-paper-raised p-4 text-sm">
              <div className="flex flex-wrap items-center gap-3"><Stars value={r.rating} size={15} /><span className="font-medium text-ink-900">{r.name}</span><span className="text-ink-500">on {products[r.product_id] || 'a product'} &middot; {new Date(r.created_at).toLocaleDateString()}</span></div>
              {r.body && <p className="mt-2 whitespace-pre-line text-ink-700">{r.body}</p>}
              <div className="mt-3 flex gap-4 text-xs font-medium uppercase tracking-[0.08em]">
                {r.status === 'pending' && <button onClick={async () => { await adminApi.update('product_reviews', r.id, { status: 'approved' }); load() }} className="text-success">Approve</button>}
                <button onClick={async () => { if (confirm('Delete this review?')) { await adminApi.remove('product_reviews', r.id); load() } }} className="text-ink-500 hover:text-error">Delete</button>
              </div>
            </li>))}
        </ul>
      </main>
    </div>
  )
}
