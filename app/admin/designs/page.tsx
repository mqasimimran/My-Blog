'use client'

import { useState, useEffect } from 'react'
import { useSession, signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'

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
      <div className="min-h-screen bg-slate-50 flex items-center justify-center font-mono text-sm text-gray-500">
        Loading admin portal...
      </div>
    )
  }

  if (!session) return null

  return (
    <div className="min-h-screen bg-slate-50 flex">
      
      {/* Sidebar matching your exact admin dashboard theme */}
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
            <Link href="/admin/designs" className="text-[#aa002a]">
              Design Gallery
            </Link>
            <Link href="/admin/services" className="text-gray-400 hover:text-white transition-colors">
              Services
            </Link>
            <Link href="/admin/journey" className="text-gray-400 hover:text-white transition-colors">
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

        {/* Logout Button */}
        <div>
          <button 
            onClick={() => signOut({ callbackUrl: '/admin/login' })}
            className="w-full text-left text-xs font-bold tracking-widest uppercase text-gray-400 hover:text-red-400 transition-colors pt-6 border-t border-gray-800"
          >
            ← Log Out
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-10 overflow-y-auto">
        <div className="max-w-5xl mx-auto">
          <div className="flex justify-between items-center mb-10">
            <div>
              <h1 className="text-3xl font-light tracking-wide uppercase text-gray-900">Manage Design Gallery</h1>
              <p className="text-xs text-gray-500 mt-1">Logged in AS {session.user?.name || 'Qasim'}</p>
            </div>
            <Link 
              href="/admin/designs/new" 
              className="bg-[#aa002a] text-white text-xs font-bold tracking-widest uppercase px-6 py-3 rounded hover:bg-gray-900 transition-colors"
            >
              + New Design Entry
            </Link>
          </div>

          {designs.length === 0 ? (
            <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-10 text-center text-sm text-gray-500">
              No design entries found. Click "+ New Design Entry" to upload your first set!
            </div>
          ) : (
            <div className="space-y-4">
              {designs.map((design) => (
                <div key={design.id} className="bg-white p-4 border border-gray-200 rounded-lg flex items-center justify-between shadow-sm hover:border-gray-300 transition-colors">
                  <div className="flex items-center gap-4">
                    {design.images?.[0] && (
                      <img src={design.images[0]} alt={design.title} className="w-12 h-12 object-cover rounded border" />
                    )}
                    <div>
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="text-[10px] font-bold tracking-widest uppercase text-[#aa002a]">{design.category}</span>
                        <button
                          onClick={() => toggleFeatured(design)}
                          className={`text-[9px] font-bold tracking-widest uppercase px-2 py-0.5 rounded transition-colors cursor-pointer ${
                            design.featured ? 'bg-[#aa002a] text-white hover:bg-gray-900' : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
                          }`}
                        >
                          {design.featured ? '★ Featured' : '☆ Feature'}
                        </button>
                      </div>
                      <h2 className="text-base font-medium text-gray-900">{design.title}</h2>
                      <span className="text-[10px] text-gray-400 font-mono">{design.images?.length || 0} image(s) attached</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-6">
                    <Link href={`/admin/designs/edit/${design.id}`} className="text-xs font-bold tracking-widest text-gray-500 hover:text-[#aa002a] uppercase">
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