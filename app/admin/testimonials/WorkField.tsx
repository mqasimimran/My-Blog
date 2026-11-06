'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { loadWorks, type Work } from '@/lib/testimonialWork'

export default function WorkField({value, onChange}: {value: string; onChange: (key: string) => void}) {
  const [items, setItems] = useState<Work[]>([])
  const [failed, setFailed] = useState(false)
  useEffect(() => { loadWorks(supabase).then(setItems).catch(() => setFailed(true)) }, [])
  return <label className="block text-sm font-medium">Work this testimonial is about
    <select value={value} onChange={e => onChange(e.target.value)} className="mt-2 block w-full border border-ink-100 bg-paper p-3">
      <option value="">General testimonial</option>
      {value && !items.some(w => w.key === value) && <option value={value}>Current selection</option>}
      {items.map(w => <option key={w.key} value={w.key}>{w.label}: {w.title}</option>)}
    </select>
    {failed && <span role="alert">Could not load published work. Refresh to try again.</span>}
  </label>
}
