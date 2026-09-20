'use client'

import { useState, useEffect } from 'react'
import { useSession, signOut } from 'next-auth/react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'

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
      const { data, error } = await supabase
        .from('journey_entries')
        .select('id, date_label, title, image_url, order_index')
        .order('order_index', { ascending: true })

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

    const { error: err1 } = await supabase.from('journey_entries').update({ order_index: target.order_index }).eq('id', current.id)
    const { error: err2 } = await supabase.from('journey_entries').update({ order_index: current.order_index }).eq('id', target.id)

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
    const { error } = await supabase.from('journey_entries').delete().eq('id', entry.id)
    if (error) alert('Error deleting: ' + error.message)
    else setEntries(prev => prev.filter(e => e.id !== entry.id))
  }

  if (status === 'loading' || isLoading) {
    return <div className="min-h-screen bg-slate-50 flex items-center justify-center font-mono text-sm text-gray-500">Loading admin portal...</div>
  }

  if (!session) return null

  return (
    <div className="min-h-screen bg-slate-50 flex font-sans">
      <aside className="w-64 bg-gray-900 text-white p-6 flex flex-col justify-between hidden md:flex">
        <div>
          <h2 className="text-xl font-light tracking-wide uppercase mb-10">Admin</h2>
          <nav className="flex flex-col gap-4 text-xs font-bold tracking-widest uppercase">
            <Link href="/admin" className="text-gray-400 hover:text-white transition-colors">
              Blogs / Articles
            </Link>
            <Link href="/admin/projects" className="text-gray-400 hover:text-white transition-colors">
              Projects
            </Link>
            <Link href="/admin/designs" className="text-gray-400 hover:text-white transition-colors">
              Design Gallery
            </Link>
            <Link href="/admin/services" className="text-gray-400 hover:text-white transition-colors">
              Services
            </Link>
            <Link href="/admin/journey" className="text-[#aa002a]">
              My Journey
            </Link>
            <Link href="/admin/testimonials" className="text-gray-400 hover:text-white transition-colors">
              Testimonials
            </Link>
            <Link href="/admin/newsletter" className="text-gray-400 hover:text-white transition-colors">
              Newsletter
            </Link>
            <Link href="/admin/settings" className="text-gray-400 hover:text-white transition-colors">
              Site Settings
            </Link>
            <Link href="/admin/messages" className="text-gray-400 hover:text-white transition-colors">
              Messages
            </Link>
            <Link href="/admin/resume" className="text-gray-400 hover:text-white transition-colors pt-2 border-t border-gray-800">
              Resume Manager
            </Link>
          </nav>
        </div>

        <div>
          <button
            onClick={() => signOut({ callbackUrl: '/admin/login' })}
            className="w-full text-left text-xs font-bold tracking-widest uppercase text-gray-400 hover:text-red-400 transition-colors pt-6 border-t border-gray-800"
          >
            ← Log Out
          </button>
        </div>
      </aside>

      <main className="flex-1 p-10 overflow-y-auto">
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-between items-center mb-10">
            <div>
              <h1 className="text-3xl font-light tracking-wide uppercase text-gray-900">Manage My Journey</h1>
              <p className="text-xs text-gray-500 mt-1">Powers the /about timeline — reorder with the arrows</p>
            </div>
            <Link
              href="/admin/journey/new"
              className="bg-[#aa002a] text-white text-xs font-bold tracking-widest uppercase px-6 py-3 rounded hover:bg-gray-900 transition-colors"
            >
              + New Entry
            </Link>
          </div>

          {entries.length === 0 ? (
            <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-10 text-center text-sm text-gray-500">
              No journey entries yet. Click "+ New Entry" to write the first one.
            </div>
          ) : (
            <div className="space-y-4">
              {entries.map((entry, index) => (
                <div key={entry.id} className="bg-white p-4 border border-gray-200 rounded-lg flex items-center justify-between shadow-sm hover:border-gray-300 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="flex flex-col gap-1">
                      <button onClick={() => moveItem(index, 'up')} disabled={index === 0} className="w-6 h-6 bg-gray-100 hover:bg-gray-200 disabled:opacity-30 rounded flex items-center justify-center text-[10px] font-bold transition-colors cursor-pointer" title="Move Up">▲</button>
                      <button onClick={() => moveItem(index, 'down')} disabled={index === entries.length - 1} className="w-6 h-6 bg-gray-100 hover:bg-gray-200 disabled:opacity-30 rounded flex items-center justify-center text-[10px] font-bold transition-colors cursor-pointer" title="Move Down">▼</button>
                    </div>
                    {entry.image_url ? (
                      <img src={entry.image_url} alt={entry.title} className="w-14 h-14 object-cover rounded border border-gray-200" />
                    ) : (
                      <div className="w-14 h-14 rounded border border-dashed border-gray-300 bg-gray-50 flex items-center justify-center text-[8px] text-gray-400 uppercase text-center">No photo</div>
                    )}
                    <div>
                      <p className="text-[10px] font-bold tracking-widest uppercase text-[#aa002a] mb-0.5">{entry.date_label}</p>
                      <h2 className="text-base font-medium text-gray-900">{entry.title}</h2>
                    </div>
                  </div>
                  <div className="flex items-center gap-6">
                    <Link href={`/admin/journey/edit/${entry.id}`} className="text-xs font-bold tracking-widest text-gray-500 hover:text-[#aa002a] uppercase">
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
