'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import EmptyState from '@/app/components/EmptyState'
import SplitText from '@/app/components/ui/SplitText'
import { useLocale } from '@/app/components/LocaleProvider'

type RoadmapItem = {
  id: string
  title: string
  description: string | null
  status: 'planned' | 'in_progress' | 'shipped'
}

const COLUMNS: { key: RoadmapItem['status']; label: string }[] = [
  { key: 'planned', label: 'Planned' },
  { key: 'in_progress', label: 'In Progress' },
  { key: 'shipped', label: 'Shipped' },
]

export default function RoadmapPage() {
  const { tx } = useLocale()
  const [items, setItems] = useState<RoadmapItem[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function fetchItems() {
      const { data, error } = await supabase
        .from('roadmap_items')
        .select('id, title, description, status')
        .order('order_index', { ascending: true })

      if (error) console.error('Error fetching roadmap:', error)
      else setItems(data || [])
      setIsLoading(false)
    }
    fetchItems()
  }, [])

  return (
    <main>
      <header className="container-page pb-12 pt-12 md:pb-16 md:pt-20">
        <h1 className="type-display text-ink-900"><SplitText text={tx("Roadmap")} /></h1>
        <p className="type-lead mt-6 max-w-[52ch]">{tx("What’s planned, what’s underway, and what’s already shipped. An honest look at what’s next.")}</p>
      </header>

      <section className="container-page pb-24">
        {isLoading ? (
          <div className="text-center py-20 text-ink-300 text-xs font-mono">{tx("Loading...")}</div>
        ) : items.length === 0 ? (
          <EmptyState icon="sparkle" title={tx("Nothing on the roadmap yet")} description={tx("Check back soon.")} />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {COLUMNS.map((col) => {
              const colItems = items.filter((i) => i.status === col.key)
              return (
                <div key={col.key}>
                  <div className="flex items-center gap-2 mb-6">
                    <span className={`w-2 h-2 rounded-full ${
                      col.key === 'shipped' ? 'bg-green-500' : col.key === 'in_progress' ? 'bg-accent-600' : 'bg-ink-100'
                    }`} />
                    <h2 className="text-xs font-medium text-ink-900">
                      {tx(col.label)} ({colItems.length})
                    </h2>
                  </div>
                  <div className="space-y-4">
                    {colItems.length === 0 ? (
                      <p className="text-xs text-ink-100 italic">{tx("Nothing here yet.")}</p>
                    ) : (
                      colItems.map((item) => (
                        <div key={item.id} className="border border-ink-100 rounded-none p-5">
                          <h3 className="text-sm font-medium text-ink-900 mb-1">{item.title}</h3>
                          {item.description && (
                            <p className="text-xs text-ink-500 leading-relaxed">{item.description}</p>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </section>
    </main>
  )
}
