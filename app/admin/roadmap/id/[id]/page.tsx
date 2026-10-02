'use client'

import { useState, useEffect, use } from 'react'
import { useSession, signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'

export default function EditRoadmapItemPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const { data: session, status } = useSession()
  const router = useRouter()
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [itemStatus, setItemStatus] = useState('planned')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function fetchItem() {
      const { data, error } = await supabase.from('roadmap_items').select('*').eq('id', id).single()
      if (data) {
        setTitle(data.title)
        setDescription(data.description || '')
        setItemStatus(data.status)
      } else if (error) {
        console.error(error)
      }
      setIsLoading(false)
    }
    if (status === 'authenticated') fetchItem()
  }, [id, status])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    const { error } = await supabase.from('roadmap_items').update({ title, description, status: itemStatus }).eq('id', id)
    if (error) {
      alert('Error saving: ' + error.message)
      setIsSubmitting(false)
    } else {
      router.push('/admin/roadmap')
    }
  }

  if (status === 'loading' || isLoading) return <div className="min-h-screen bg-slate-50 flex items-center justify-center font-mono text-xs uppercase tracking-widest text-gray-400">Loading...</div>
  if (!session) return null

  return (
    <div className="min-h-screen bg-slate-50 flex font-sans">
      <aside className="w-64 bg-[#0B1120] text-white p-6 flex flex-col justify-between hidden md:flex">
        <div>
          <h2 className="text-xl font-light tracking-wide uppercase mb-10 text-white">Admin</h2>
          <nav className="flex flex-col gap-4 text-xs font-bold tracking-widest uppercase">
            <Link href="/admin/roadmap" className="text-gray-400 hover:text-white transition-colors">← Back to Roadmap</Link>
          </nav>
        </div>
        <div>
          <button onClick={() => signOut({ callbackUrl: '/admin/login' })} className="w-full text-left text-xs font-bold tracking-widest uppercase text-gray-400 hover:text-red-400 transition-colors pt-6 border-t border-gray-800">← Log Out</button>
        </div>
      </aside>

      <main className="flex-1 p-10 overflow-y-auto">
        <div className="max-w-2xl mx-auto bg-white p-8 rounded-lg shadow-sm border border-gray-100">
          <h1 className="text-3xl font-light tracking-wide uppercase text-gray-900 mb-8">Edit Roadmap Item</h1>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-[10px] font-bold tracking-widest uppercase text-gray-500 mb-2">Title</label>
              <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} required className="w-full border-b border-gray-300 py-2 outline-none focus:border-gray-900 text-sm" />
            </div>
            <div>
              <label className="block text-[10px] font-bold tracking-widest uppercase text-gray-500 mb-2">Description (optional)</label>
              <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} className="w-full border border-gray-200 p-3 outline-none focus:border-gray-900 text-gray-700 text-sm" />
            </div>
            <div>
              <label className="block text-[10px] font-bold tracking-widest uppercase text-gray-500 mb-2">Status</label>
              <select value={itemStatus} onChange={(e) => setItemStatus(e.target.value)} className="w-full border-b border-gray-300 py-2 outline-none focus:border-gray-900 bg-white text-sm">
                <option value="planned">Planned</option>
                <option value="in_progress">In Progress</option>
                <option value="shipped">Shipped</option>
              </select>
            </div>
            <button type="submit" disabled={isSubmitting} className="w-full bg-[#aa002a] text-white text-xs font-bold tracking-widest uppercase py-4 rounded hover:bg-gray-900 transition-colors mt-6">
              {isSubmitting ? 'Saving...' : 'Save Changes'}
            </button>
          </form>
        </div>
      </main>
    </div>
  )
}
