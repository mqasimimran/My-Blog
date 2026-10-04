'use client'

import { useState, useEffect } from 'react'
import { useSession, signOut } from 'next-auth/react'
import Link from 'next/link'
import { adminApi } from '@/lib/adminApi'
import AdminNav from '@/app/admin/AdminNav'

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
      let data: any = null
      let error: any = null
      try { data = await adminApi.list('testimonials', { orderBy: 'order_index', ascending: true }) } catch (e: any) { error = e }

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

    let err1: any = null
    try { await adminApi.update('testimonials', current.id, { order_index: target.order_index }) } catch (e: any) { err1 = e }
    let err2: any = null
    try { await adminApi.update('testimonials', target.id, { order_index: current.order_index }) } catch (e: any) { err2 = e }

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
    let error: any = null
    try { await adminApi.update('testimonials', t.id, { active: !t.active }) } catch (e: any) { error = e }
    if (error) alert('Error updating: ' + error.message)
    else setTestimonials(prev => prev.map(x => x.id === t.id ? { ...x, active: !x.active } : x))
  }

  async function deleteTestimonial(t: Testimonial) {
    if (!confirm(`Delete the testimonial from "${t.name}"?`)) return
    let error: any = null
    try { await adminApi.remove('testimonials', t.id) } catch (e: any) { error = e }
    if (error) alert('Error deleting: ' + error.message)
    else setTestimonials(prev => prev.filter(x => x.id !== t.id))
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
              <h1 className="text-3xl font-light tracking-wide uppercase text-ink-900">Testimonials</h1>
              <p className="text-xs text-ink-500 mt-1">Only add quotes from people who actually gave them to you</p>
            </div>
            <Link href="/admin/testimonials/new" className="bg-accent-600 text-white text-xs font-bold tracking-widest uppercase px-6 py-3 rounded-none hover:bg-gray-900 transition-colors">
              + New Testimonial
            </Link>
          </div>

          {testimonials.length === 0 ? (
            <div className="bg-paper rounded-none shadow-sm border border-ink-100 p-10 text-center text-sm text-ink-500">
              No testimonials yet. This section stays hidden on the homepage until you add one.
            </div>
          ) : (
            <div className="space-y-4">
              {testimonials.map((t, index) => (
                <div key={t.id} className="bg-paper p-4 border border-ink-100 rounded-none flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between shadow-sm hover:border-ink-100 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="flex flex-col gap-1">
                      <button onClick={() => moveItem(index, 'up')} disabled={index === 0} className="w-6 h-6 bg-ink-100 hover:bg-ink-100 disabled:opacity-30 rounded-none flex items-center justify-center text-[10px] font-bold transition-colors cursor-pointer">▲</button>
                      <button onClick={() => moveItem(index, 'down')} disabled={index === testimonials.length - 1} className="w-6 h-6 bg-ink-100 hover:bg-ink-100 disabled:opacity-30 rounded-none flex items-center justify-center text-[10px] font-bold transition-colors cursor-pointer">▼</button>
                    </div>
                    {t.avatar_url ? (
                      <img src={t.avatar_url} alt={t.name} className="w-12 h-12 rounded-full object-cover" />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-ink-100 flex items-center justify-center text-ink-300 text-sm font-bold uppercase">{t.name.charAt(0)}</div>
                    )}
                    <div>
                      <div className="flex items-center gap-2 mb-0.5">
                        {!t.active && <span className="text-[9px] font-bold tracking-widest uppercase bg-amber-50 text-amber-700 px-2 py-0.5 rounded-none">Hidden</span>}
                        <h2 className="text-base font-medium text-ink-900">{t.name}</h2>
                      </div>
                      {t.role && <p className="text-xs text-ink-500">{t.role}</p>}
                      <p className="text-xs text-ink-300 italic mt-1 max-w-md truncate">"{t.quote}"</p>
                    </div>
                  </div>
                  <div className="flex items-center flex-wrap gap-4">
                    <button onClick={() => toggleActive(t)} className="text-xs font-bold tracking-widest text-ink-500 hover:text-ink-900 uppercase cursor-pointer">
                      {t.active ? 'Hide' : 'Show'}
                    </button>
                    <Link href={`/admin/testimonials/edit/${t.id}`} className="text-xs font-bold tracking-widest text-ink-500 hover:text-accent-600 uppercase">Edit</Link>
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
