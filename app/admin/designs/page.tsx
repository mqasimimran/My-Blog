'use client'

import { useState, useEffect } from 'react'
import { useSession, signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import AdminNav from '@/app/admin/AdminNav'

type Design = {
  id: string
  title: string
  category: string
  images: string[]
  created_at: string
  featured: boolean
}

export default function AdminDesignsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [designs, setDesigns] = useState<Design[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // Protect route on client side if unauthenticated


  useEffect(() => {
    async function fetchDesigns() {
      const { data, error } = await supabase
        .from('designs')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching designs:', error)
      } else {
        setDesigns(data || [])
      }
      setIsLoading(false)
    }

    if (status === 'authenticated') {
      fetchDesigns()
    }
  }, [status])

  async function deleteDesign(id: string, title: string) {
    if (!confirm(`Are you sure you want to delete "${title}"?`)) return
    const { error } = await supabase.from('designs').delete().eq('id', id)
    if (error) {
      alert('Error deleting design')
    } else {
      setDesigns(designs.filter(d => d.id !== id))
    }
  }

  async function toggleFeatured(design: Design) {
    const { error } = await supabase.from('designs').update({ featured: !design.featured }).eq('id', design.id)
    if (error) {
      alert('Error updating: ' + error.message)
    } else {
      setDesigns(prev => prev.map(d => d.id === design.id ? { ...d, featured: !d.featured } : d))
    }
  }

  if (status === 'loading' || isLoading) {
    return (
      <div className="min-h-screen bg-paper flex items-center justify-center font-mono text-sm text-ink-500">
        Loading admin portal...
      </div>
    )
  }

  if (!session) return null

  return (
    <div className="min-h-screen bg-paper flex">
      
      {/* Sidebar matching your exact admin dashboard theme */}
      <AdminNav />

      {/* Main Content Area */}
      <main className="flex-1 p-10 overflow-y-auto">
        <div className="max-w-5xl mx-auto">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-10">
            <div>
              <h1 className="text-3xl font-light tracking-wide uppercase text-ink-900">Manage Design Gallery</h1>
              <p className="text-xs text-ink-500 mt-1">Logged in AS {session.user?.name || 'Qasim'}</p>
            </div>
            <Link 
              href="/admin/designs/new" 
              className="bg-accent-600 text-white text-xs font-bold tracking-widest uppercase px-6 py-3 rounded-none hover:bg-gray-900 transition-colors"
            >
              + New Design Entry
            </Link>
          </div>

          {designs.length === 0 ? (
            <div className="bg-paper rounded-none shadow-sm border border-ink-100 p-10 text-center text-sm text-ink-500">
              No design entries found. Click "+ New Design Entry" to upload your first set!
            </div>
          ) : (
            <div className="space-y-4">
              {designs.map((design) => (
                <div key={design.id} className="bg-paper p-4 border border-ink-100 rounded-none flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between shadow-sm hover:border-ink-100 transition-colors">
                  <div className="flex items-center gap-4">
                    {design.images?.[0] && (
                      <img src={design.images[0]} alt={design.title} className="w-12 h-12 object-cover rounded-none border" />
                    )}
                    <div>
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="text-[10px] font-bold tracking-widest uppercase text-accent-600">{design.category}</span>
                        <button
                          onClick={() => toggleFeatured(design)}
                          className={`text-[9px] font-bold tracking-widest uppercase px-2 py-0.5 rounded-none transition-colors cursor-pointer ${
                            design.featured ? 'bg-accent-600 text-white hover:bg-gray-900' : 'bg-ink-100 text-ink-300 hover:bg-ink-100'
                          }`}
                        >
                          {design.featured ? '★ Featured' : '☆ Feature'}
                        </button>
                      </div>
                      <h2 className="text-base font-medium text-ink-900">{design.title}</h2>
                      <span className="text-[10px] text-ink-300 font-mono">{design.images?.length || 0} image(s) attached</span>
                    </div>
                  </div>
                  <div className="flex items-center flex-wrap gap-4">
                    <Link href={`/admin/designs/edit/${design.id}`} className="text-xs font-bold tracking-widest text-ink-500 hover:text-accent-600 uppercase">
                      Edit
                    </Link>
                    <button onClick={() => deleteDesign(design.id, design.title)} className="text-xs font-bold tracking-widest text-red-500 hover:text-red-700 uppercase">
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