'use client'

import { useEffect, useState } from 'react'
import { adminApi } from '@/lib/adminApi'

type P = { id: string; name: string; price: number; type: string; digital_file_url: string | null; active: boolean }

// Choose the digital products a bundle contains. Buyers get every file after you verify payment.
// A product can be hidden from the shop and still be sold inside a bundle.
export default function BundlePicker({ selected, onChange, excludeId }: { selected: string[]; onChange: (ids: string[]) => void; excludeId?: string }) {
  const [items, setItems] = useState<P[]>([])
  useEffect(() => {
    adminApi.list('products', { orderBy: 'order_index', ascending: true })
      .then((rows: any) => setItems(((rows || []) as P[]).filter((p) => p.type === 'digital' && p.id !== excludeId)))
      .catch(() => setItems([]))
  }, [excludeId])

  const toggle = (id: string) => onChange(selected.includes(id) ? selected.filter((x) => x !== id) : [...selected, id])
  const separately = items.filter((i) => selected.includes(i.id)).reduce((sum, i) => sum + Number(i.price), 0)

  return (
    <div>
      <p className="block text-[10px] font-bold tracking-widest uppercase text-ink-500 mb-2">Products in this bundle</p>
      <p className="mb-4 text-xs text-ink-500">Pick two or more digital products. Buyers get every file once you verify their payment. Hidden products can still be sold inside a bundle.</p>
      {items.length === 0 ? (
        <p className="text-sm text-ink-500">Add some digital products first; then you can bundle them here.</p>
      ) : (
        <ul className="border border-ink-100 divide-y divide-ink-100">
          {items.map((p) => (
            <li key={p.id}>
              <label className="flex cursor-pointer items-center gap-3 px-4 py-3 hover:bg-ink-50">
                <input type="checkbox" checked={selected.includes(p.id)} onChange={() => toggle(p.id)} className="h-4 w-4" />
                <span className="flex-1 text-sm text-ink-900">
                  {p.name}
                  {!p.active && <span className="ml-2 text-xs text-ink-500">(hidden from shop)</span>}
                  {!p.digital_file_url && <span className="ml-2 text-xs text-warning">(no file yet)</span>}
                </span>
                <span className="font-mono text-sm tabular-nums text-ink-500">${Number(p.price).toFixed(2)}</span>
              </label>
            </li>
          ))}
        </ul>
      )}
      <p className="mt-3 text-sm text-ink-700">{selected.length} selected. Bought separately: <span className="font-mono">${separately.toFixed(2)}</span>. Set the bundle price lower so buyers save.</p>
    </div>
  )
}
