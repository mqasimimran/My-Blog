'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import AdminNav from '@/app/admin/AdminNav'

type RoadmapItem = {
  id: string
  title: string
  status: 'planned' | 'in_progress' | 'shipped'
  order_index: number
}

const STATUS_LABELS: Record<string, string> = { planned: 'Planned', in_progress: 'In Progress', shipped: 'Shipped' }

export default function AdminRoadmapPage() {
  const { data: session, status } = useSession()
  const [items, setItems] = useState<RoadmapItem[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function fetchItems() {
      const { data, error } = await supabase
        .from('roadmap_items')
        .select('id, title, status, order_index')
        .order('order_index', { ascending: true })

      if (error) console.error('Error fetching roadmap:', error)
      else setItems(data || [])
      setIsLoading(false)
    }
    if (status === 'authenticated') fetchItems()
  }, [status])

  async function moveItem(index: number, direction: 'up' | 'down') {
    if ((direction === 'up' && index === 0) || (direction === 'down' && index === items.length - 1)) return
    const targetIndex = direction === 'up' ? index - 1 : index + 1
    const current = items[index]
    const target = items[targetIndex]

    await supabase.from('roadmap_items').update({ order_index: target.order_index }).eq('id', current.id)
    await supabase.from('roadmap_items').update({ order_index: current.order_index }).eq('id', target.id)

    const reordered = [...items]
    reordered[index] = target
    reordered[targetIndex] = current
    setItems(reordered)
  }

  async function cycleStatus(item: RoadmapItem) {
    const order: RoadmapItem['status'][] = ['planned', 'in_progress', 'shipped']
    const next = order[(order.indexOf(item.status) + 1) % order.length]
    const { error } = await supabase.from('roadmap_items').update({ status: next }).eq('id', item.id)
    if (error) alert('Error: ' + error.message)
    else setItems(prev => prev.map(i => i.id === item.id ? { ...i, status: next } : i))
  }

  async function deleteItem(item: RoadmapItem) {
    if (!confirm(`Delete "${item.title}"?`)) return
    const { error } = await supabase.from('roadmap_items').delete().eq('id', item.id)
    if (error) alert('Error: ' + error.message)
    else setItems(prev => prev.filter(i => i.id !== item.id))
  }

  if (status === 'loading' || isLoading) {
    return <div className="min-h-screen bg-paper flex items-center justify-center font-mono text-sm text-ink-500">Loading admin portal...</div>
  }
  if (!session) return null

  return (
    <div className="min-h-screen bg-paper flex flex-col md:flex-row font-sans">
      <AdminNav />

      <main className="flex-1 p-10 overflow-y-auto">
        <div className="max-w-4xl mx-auto">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-10">
            <div>
              <h1 className="text-3xl font-light tracking-wide uppercase text-ink-900">Roadmap</h1>
              <p className="text-xs text-ink-500 mt-1">Click a status pill to cycle it forward</p>
            </div>
            <Link href="/admin/roadmap/new" className="bg-accent-600 text-white text-xs font-bold tracking-widest uppercase px-6 py-3 rounded-none hover:bg-gray-900 transition-colors">
              + New Item
            </Link>
          </div>

          {items.length === 0 ? (
            <div className="bg-paper rounded-none shadow-sm border border-ink-100 p-10 text-center text-sm text-ink-500">
              Nothing on the roadmap yet.
            </div>
          ) : (
            <div className="space-y-4">
              {items.map((item, index) => (
                <div key={item.id} className="bg-paper p-4 border border-ink-100 rounded-none flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between shadow-sm hover:border-ink-100 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="flex flex-col gap-1">
                      <button onClick={() => moveItem(index, 'up')} disabled={index === 0} className="w-6 h-6 bg-ink-100 hover:bg-ink-100 disabled:opacity-30 rounded-none flex items-center justify-center text-[10px] font-bold">▲</button>
                      <button onClick={() => moveItem(index, 'down')} disabled={index === items.length - 1} className="w-6 h-6 bg-ink-100 hover:bg-ink-100 disabled:opacity-30 rounded-none flex items-center justify-center text-[10px] font-bold">▼</button>
                    </div>
                    <h2 className="text-base font-medium text-ink-900">{item.title}</h2>
                  </div>
                  <div className="flex items-center flex-wrap gap-4">
                    <button
                      onClick={() => cycleStatus(item)}
                      className={`text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-full transition-colors ${
                        item.status === 'shipped' ? 'bg-green-100 text-green-700' : item.status === 'in_progress' ? 'bg-accent-600/10 text-accent-600' : 'bg-ink-100 text-ink-500'
                      }`}
                    >
                      {STATUS_LABELS[item.status]}
                    </button>
                    <Link href={`/admin/roadmap/edit/${item.id}`} className="text-xs font-bold tracking-widest text-ink-500 hover:text-accent-600 uppercase">Edit</Link>
                    <button onClick={() => deleteItem(item)} className="text-xs font-bold tracking-widest text-red-500 hover:text-red-700 uppercase">Delete</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
