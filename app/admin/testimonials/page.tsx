'use client'

import { useState, useEffect } from 'react'
import { useSession, signOut } from 'next-auth/react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'

type Testimonial = {
  id: string
  name: string
  role: string | null
  quote: string
  avatar_url: string | null
  order_index: number
  active: boolean
}

export default function AdminTestimonialsPage() {
  const { data: session, status } = useSession()
  const [testimonials, setTestimonials] = useState<Testimonial[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function fetchTestimonials() {
      const { data, error } = await supabase
        .from('testimonials')
        .select('*')
        .order('order_index', { ascending: true })

      if (error) console.error('Error fetching testimonials:', error)
      else setTestimonials(data || [])
      setIsLoading(false)
    }

    if (status === 'authenticated') fetchTestimonials()
  }, [status])

  async function moveItem(index: number, direction: 'up' | 'down') {
    if ((direction === 'up' && index === 0) || (direction === 'down' && index === testimonials.length - 1)) return

    const targetIndex = direction === 'up' ? index - 1 : index + 1
    const current = testimonials[index]
    const target = testimonials[targetIndex]

    const { error: err1 } = await supabase.from('testimonials').update({ order_index: target.order_index }).eq('id', current.id)
    const { error: err2 } = await supabase.from('testimonials').update({ order_index: current.order_index }).eq('id', target.id)

    if (err1 || err2) {
      alert('Error updating order')
    } else {
      const reordered = [...testimonials]
      reordered[index] = target
      reordered[targetIndex] = current
      setTestimonials(reordered)
    }
  }

  async function toggleActive(t: Testimonial) {
    const { error } = await supabase.from('testimonials').update({ active: !t.active }).eq('id', t.id)
    if (error) alert('Error updating: ' + error.message)
    else setTestimonials(prev => prev.map(x => x.id === t.id ? { ...x, active: !x.active } : x))
  }

  async function deleteTestimonial(t: Testimonial) {
    if (!confirm(`Delete the testimonial from "${t.name}"?`)) return
    const { error } = await supabase.from('testimonials').delete().eq('id', t.id)
    if (error) alert('Error deleting: ' + error.message)
    else setTestimonials(prev => prev.filter(x => x.id !== t.id))
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
            <Link href="/admin" className="text-gray-400 hover:text-white transition-colors">Blogs / Articles</Link>
            <Link href="/admin/projects" className="text-gray-400 hover:text-white transition-colors">Projects</Link>
            <Link href="/admin/designs" className="text-gray-400 hover:text-white transition-colors">Design Gallery</Link>
            <Link href="/admin/services" className="text-gray-400 hover:text-white transition-colors">Services</Link>
            <Link href="/admin/journey" className="text-gray-400 hover:text-white transition-colors">My Journey</Link>
            <Link href="/admin/testimonials" className="text-[#aa002a]">Testimonials</Link>
            <Link href="/admin/newsletter" className="text-gray-400 hover:text-white transition-colors">Newsletter</Link>
            <Link href="/admin/settings" className="text-gray-400 hover:text-white transition-colors">Site Settings</Link>
            <Link href="/admin/messages" className="text-gray-400 hover:text-white transition-colors">Messages</Link>
            <Link href="/admin/resume" className="text-gray-400 hover:text-white transition-colors pt-2 border-t border-gray-800">Resume Manager</Link>
          </nav>
        </div>
        <div>
          <button onClick={() => signOut({ callbackUrl: '/admin/login' })} className="w-full text-left text-xs font-bold tracking-widest uppercase text-gray-400 hover:text-red-400 transition-colors pt-6 border-t border-gray-800">
            ← Log Out
          </button>
        </div>
      </aside>

      <main className="flex-1 p-10 overflow-y-auto">
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-between items-center mb-10">
            <div>
              <h1 className="text-3xl font-light tracking-wide uppercase text-gray-900">Testimonials</h1>
              <p className="text-xs text-gray-500 mt-1">Only add quotes from people who actually gave them to you</p>
            </div>
            <Link href="/admin/testimonials/new" className="bg-[#aa002a] text-white text-xs font-bold tracking-widest uppercase px-6 py-3 rounded hover:bg-gray-900 transition-colors">
              + New Testimonial
            </Link>
          </div>

          {testimonials.length === 0 ? (
            <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-10 text-center text-sm text-gray-500">
              No testimonials yet. This section stays hidden on the homepage until you add one.
            </div>
          ) : (
            <div className="space-y-4">
              {testimonials.map((t, index) => (
                <div key={t.id} className="bg-white p-4 border border-gray-200 rounded-lg flex items-center justify-between shadow-sm hover:border-gray-300 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="flex flex-col gap-1">
                      <button onClick={() => moveItem(index, 'up')} disabled={index === 0} className="w-6 h-6 bg-gray-100 hover:bg-gray-200 disabled:opacity-30 rounded flex items-center justify-center text-[10px] font-bold transition-colors cursor-pointer">▲</button>
                      <button onClick={() => moveItem(index, 'down')} disabled={index === testimonials.length - 1} className="w-6 h-6 bg-gray-100 hover:bg-gray-200 disabled:opacity-30 rounded flex items-center justify-center text-[10px] font-bold transition-colors cursor-pointer">▼</button>
                    </div>
                    {t.avatar_url ? (
                      <img src={t.avatar_url} alt={t.name} className="w-12 h-12 rounded-full object-cover" />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 text-sm font-bold uppercase">{t.name.charAt(0)}</div>
                    )}
                    <div>
                      <div className="flex items-center gap-2 mb-0.5">
                        {!t.active && <span className="text-[9px] font-bold tracking-widest uppercase bg-amber-50 text-amber-700 px-2 py-0.5 rounded">Hidden</span>}
                        <h2 className="text-base font-medium text-gray-900">{t.name}</h2>
                      </div>
                      {t.role && <p className="text-xs text-gray-500">{t.role}</p>}
                      <p className="text-xs text-gray-400 italic mt-1 max-w-md truncate">"{t.quote}"</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-6">
                    <button onClick={() => toggleActive(t)} className="text-xs font-bold tracking-widest text-gray-500 hover:text-gray-900 uppercase cursor-pointer">
                      {t.active ? 'Hide' : 'Show'}
                    </button>
                    <Link href={`/admin/testimonials/edit/${t.id}`} className="text-xs font-bold tracking-widest text-gray-500 hover:text-[#aa002a] uppercase">Edit</Link>
                    <button onClick={() => deleteTestimonial(t)} className="text-xs font-bold tracking-widest text-red-500 hover:text-red-700 uppercase cursor-pointer py-2">Delete</button>
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
