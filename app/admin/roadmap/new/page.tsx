'use client'

import { useState } from 'react'
import { useSession, signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { adminApi } from '@/lib/adminApi'

export default function NewRoadmapItemPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [itemStatus, setItemStatus] = useState('planned')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    const { count } = await supabase.from('roadmap_items').select('*', { count: 'exact', head: true })
    let error: any = null
    try { await adminApi.insert('roadmap_items', {
      title, description, status: itemStatus, order_index: count || 0,
    }) } catch (e: any) { error = e }
    if (error) {
      alert('Error saving: ' + error.message)
      setIsSubmitting(false)
    } else {
      router.push('/admin/roadmap')
    }
  }

  if (status === 'loading') return <div className="min-h-screen bg-paper flex items-center justify-center font-mono text-xs uppercase tracking-widest text-ink-300">Loading...</div>
  if (!session) return null

  return (
    <div className="min-h-screen bg-paper flex font-sans">
      <aside className="w-64 bg-[#0B1120] text-white p-6 flex flex-col justify-between hidden md:flex">
        <div>
          <h2 className="text-xl font-light tracking-wide uppercase mb-10 text-white">Admin</h2>
          <nav className="flex flex-col gap-4 text-xs font-bold tracking-widest uppercase">
            <Link href="/admin/roadmap" className="text-ink-300 hover:text-white transition-colors">← Back to Roadmap</Link>
          </nav>
        </div>
        <div>
          <button onClick={() => signOut({ callbackUrl: '/admin/login' })} className="w-full text-left text-xs font-bold tracking-widest uppercase text-ink-300 hover:text-red-400 transition-colors pt-6 border-t border-gray-800">← Log Out</button>
        </div>
      </aside>

      <main className="flex-1 p-10 overflow-y-auto">
        <div className="max-w-2xl mx-auto bg-paper p-8 rounded-none shadow-sm border border-ink-100">
          <h1 className="text-3xl font-light tracking-wide uppercase text-ink-900 mb-8">New Roadmap Item</h1>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-[10px] font-bold tracking-widest uppercase text-ink-500 mb-2">Title</label>
              <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} required className="w-full border-b border-ink-100 py-2 outline-none focus:border-ink-900 text-sm" />
            </div>
            <div>
              <label className="block text-[10px] font-bold tracking-widest uppercase text-ink-500 mb-2">Description (optional)</label>
              <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} className="w-full border border-ink-100 p-3 outline-none focus:border-ink-900 text-ink-700 text-sm" />
            </div>
            <div>
              <label className="block text-[10px] font-bold tracking-widest uppercase text-ink-500 mb-2">Status</label>
              <select value={itemStatus} onChange={(e) => setItemStatus(e.target.value)} className="w-full border-b border-ink-100 py-2 outline-none focus:border-ink-900 bg-paper text-sm">
                <option value="planned">Planned</option>
                <option value="in_progress">In Progress</option>
                <option value="shipped">Shipped</option>
              </select>
            </div>
            <button type="submit" disabled={isSubmitting} className="w-full bg-accent-600 text-white text-xs font-bold tracking-widest uppercase py-4 rounded-none hover:bg-gray-900 transition-colors mt-6">
              {isSubmitting ? 'Saving...' : 'Save Item'}
            </button>
          </form>
        </div>
      </main>
    </div>
  )
}
