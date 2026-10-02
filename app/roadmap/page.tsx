'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import EmptyState from '@/app/components/EmptyState'

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
    <main className="min-h-screen bg-white font-sans">
      <section className="bg-gradient-to-br from-slate-100 to-white py-24 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-light tracking-wide uppercase text-gray-900 mb-6">
            Roadmap
          </h1>
          <p className="text-gray-500 text-sm md:text-base leading-relaxed max-w-xl mx-auto">
            What's planned, what's underway, and what's already shipped — an honest look at what's next.
          </p>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-6 py-20">
        {isLoading ? (
          <div className="text-center py-20 text-gray-400 text-xs font-mono uppercase tracking-widest">Loading...</div>
        ) : items.length === 0 ? (
          <EmptyState icon="sparkle" title="Nothing on the roadmap yet" description="Check back soon." />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {COLUMNS.map((col) => {
              const colItems = items.filter((i) => i.status === col.key)
              return (
                <div key={col.key}>
                  <div className="flex items-center gap-2 mb-6">
                    <span className={`w-2 h-2 rounded-full ${
                      col.key === 'shipped' ? 'bg-green-500' : col.key === 'in_progress' ? 'bg-[#aa002a]' : 'bg-gray-300'
                    }`} />
                    <h2 className="text-xs font-bold uppercase tracking-widest text-gray-900">
                      {col.label} ({colItems.length})
                    </h2>
                  </div>
                  <div className="space-y-4">
                    {colItems.length === 0 ? (
                      <p className="text-xs text-gray-300 italic">Nothing here yet.</p>
                    ) : (
                      colItems.map((item) => (
                        <div key={item.id} className="border border-gray-200 rounded-xl p-5">
                          <h3 className="text-sm font-medium text-gray-900 mb-1">{item.title}</h3>
                          {item.description && (
                            <p className="text-xs text-gray-500 leading-relaxed">{item.description}</p>
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
