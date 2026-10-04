'use client'

import { useState, useEffect } from 'react'
import { useSession, signOut } from 'next-auth/react'
import Link from 'next/link'
import { adminApi } from '@/lib/adminApi'
import AdminNav from '@/app/admin/AdminNav'

type JourneyEntry = {
  id: string
  date_label: string
  title: string
  image_url: string | null
  order_index: number
}

export default function AdminJourneyPage() {
  const { data: session, status } = useSession()
  const [entries, setEntries] = useState<JourneyEntry[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function fetchEntries() {
      let data: any = null
      let error: any = null
      try { data = await adminApi.list('journey_entries', { select: 'id, date_label, title, image_url, order_index', orderBy: 'order_index', ascending: true }) } catch (e: any) { error = e }

      if (error) console.error('Error fetching journey entries:', error)
      else setEntries(data || [])
      setIsLoading(false)
    }

    if (status === 'authenticated') fetchEntries()
  }, [status])

  async function moveItem(index: number, direction: 'up' | 'down') {
    if ((direction === 'up' && index === 0) || (direction === 'down' && index === entries.length - 1)) return

    const targetIndex = direction === 'up' ? index - 1 : index + 1
    const current = entries[index]
    const target = entries[targetIndex]

    let err1: any = null
    try { await adminApi.update('journey_entries', current.id, { order_index: target.order_index }) } catch (e: any) { err1 = e }
    let err2: any = null
    try { await adminApi.update('journey_entries', target.id, { order_index: current.order_index }) } catch (e: any) { err2 = e }

    if (err1 || err2) {
      alert('Error updating order')
    } else {
      const reordered = [...entries]
      reordered[index] = target
      reordered[targetIndex] = current
      setEntries(reordered)
    }
  }

  async function deleteEntry(entry: JourneyEntry) {
    if (!confirm(`Delete "${entry.title}"?`)) return
    let error: any = null
    try { await adminApi.remove('journey_entries', entry.id) } catch (e: any) { error = e }
    if (error) alert('Error deleting: ' + error.message)
    else setEntries(prev => prev.filter(e => e.id !== entry.id))
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
              <h1 className="text-3xl font-light tracking-wide uppercase text-ink-900">Manage My Journey</h1>
              <p className="text-xs text-ink-500 mt-1">Powers the /about timeline — reorder with the arrows</p>
            </div>
            <Link
              href="/admin/journey/new"
              className="bg-accent-600 text-white text-xs font-bold tracking-widest uppercase px-6 py-3 rounded-none hover:bg-gray-900 transition-colors"
            >
              + New Entry
            </Link>
          </div>

          {entries.length === 0 ? (
            <div className="bg-paper rounded-none shadow-sm border border-ink-100 p-10 text-center text-sm text-ink-500">
              No journey entries yet. Click "+ New Entry" to write the first one.
            </div>
          ) : (
            <div className="space-y-4">
              {entries.map((entry, index) => (
                <div key={entry.id} className="bg-paper p-4 border border-ink-100 rounded-none flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between shadow-sm hover:border-ink-100 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="flex flex-col gap-1">
                      <button onClick={() => moveItem(index, 'up')} disabled={index === 0} className="w-6 h-6 bg-ink-100 hover:bg-ink-100 disabled:opacity-30 rounded-none flex items-center justify-center text-[10px] font-bold transition-colors cursor-pointer" title="Move Up">▲</button>
                      <button onClick={() => moveItem(index, 'down')} disabled={index === entries.length - 1} className="w-6 h-6 bg-ink-100 hover:bg-ink-100 disabled:opacity-30 rounded-none flex items-center justify-center text-[10px] font-bold transition-colors cursor-pointer" title="Move Down">▼</button>
                    </div>
                    {entry.image_url ? (
                      <img src={entry.image_url} alt={entry.title} className="w-14 h-14 object-cover rounded-none border border-ink-100" />
                    ) : (
                      <div className="w-14 h-14 rounded-none border border-dashed border-ink-100 bg-paper flex items-center justify-center text-[8px] text-ink-300 uppercase text-center">No photo</div>
                    )}
                    <div>
                      <p className="text-[10px] font-bold tracking-widest uppercase text-accent-600 mb-0.5">{entry.date_label}</p>
                      <h2 className="text-base font-medium text-ink-900">{entry.title}</h2>
                    </div>
                  </div>
                  <div className="flex items-center flex-wrap gap-4">
                    <Link href={`/admin/journey/edit/${entry.id}`} className="text-xs font-bold tracking-widest text-ink-500 hover:text-accent-600 uppercase">
                      Edit
                    </Link>
                    <button onClick={() => deleteEntry(entry)} className="text-xs font-bold tracking-widest text-red-500 hover:text-red-700 uppercase cursor-pointer py-2">
                      Delete
                    </button>
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
