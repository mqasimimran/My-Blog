'use client'

import { useState, useEffect } from 'react'
import { useSession, signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'

type Service = {
  id: string
  name: string
  tagline: string | null
  order_index: number
  active: boolean
}

export default function AdminServicesPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [services, setServices] = useState<Service[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function fetchServices() {
      const { data, error } = await supabase
        .from('services')
        .select('id, name, tagline, order_index, active')
        .order('order_index', { ascending: true })

      if (error) {
        console.error('Error fetching services:', error)
      } else {
        setServices(data || [])
      }
      setIsLoading(false)
    }

    if (status === 'authenticated') {
      fetchServices()
    }
  }, [status])

  async function moveItem(index: number, direction: 'up' | 'down') {
    if ((direction === 'up' && index === 0) || (direction === 'down' && index === services.length - 1)) return

    const targetIndex = direction === 'up' ? index - 1 : index + 1
    const current = services[index]
    const target = services[targetIndex]

    const { error: err1 } = await supabase.from('services').update({ order_index: target.order_index }).eq('id', current.id)
    const { error: err2 } = await supabase.from('services').update({ order_index: current.order_index }).eq('id', target.id)

    if (err1 || err2) {
      alert('Error updating order')
    } else {
      const reordered = [...services]
      reordered[index] = target
      reordered[targetIndex] = current
      setServices(reordered)
    }
  }

  async function toggleActive(service: Service) {
    const { error } = await supabase.from('services').update({ active: !service.active }).eq('id', service.id)
    if (error) {
      alert('Error updating: ' + error.message)
    } else {
      setServices(prev => prev.map(s => s.id === service.id ? { ...s, active: !s.active } : s))
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
            <Link href="/admin/services" className="text-[#aa002a]">
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
        <div className="max-w-5xl mx-auto">
          <div className="flex justify-between items-center mb-10">
            <div>
              <h1 className="text-3xl font-light tracking-wide uppercase text-gray-900">Manage Services</h1>
              <p className="text-xs text-gray-500 mt-1">Logged in AS {session.user?.name || 'Qasim'}</p>
            </div>
            <Link
              href="/admin/services/new"
              className="bg-[#aa002a] text-white text-xs font-bold tracking-widest uppercase px-6 py-3 rounded hover:bg-gray-900 transition-colors"
            >
              + New Service
            </Link>
          </div>

          {services.length === 0 ? (
            <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-10 text-center text-sm text-gray-500">
              No services found. Click "+ New Service" to add your first offering!
            </div>
          ) : (
            <div className="space-y-4">
              {services.map((service, index) => (
                <div key={service.id} className="bg-white p-4 border border-gray-200 rounded-lg flex items-center justify-between shadow-sm hover:border-gray-300 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="flex flex-col gap-1">
                      <button
                        onClick={() => moveItem(index, 'up')}
                        disabled={index === 0}
                        className="w-6 h-6 bg-gray-100 hover:bg-gray-200 disabled:opacity-30 rounded flex items-center justify-center text-[10px] font-bold transition-colors cursor-pointer"
                        title="Move Up"
                      >
                        ▲
                      </button>
                      <button
                        onClick={() => moveItem(index, 'down')}
                        disabled={index === services.length - 1}
                        className="w-6 h-6 bg-gray-100 hover:bg-gray-200 disabled:opacity-30 rounded flex items-center justify-center text-[10px] font-bold transition-colors cursor-pointer"
                        title="Move Down"
                      >
                        ▼
                      </button>
                    </div>
                    <div>
                      <div className="flex items-center gap-3 mb-1">
                        {!service.active && (
                          <span className="text-[9px] font-bold tracking-widest uppercase bg-amber-50 text-amber-700 px-2 py-0.5 rounded">Hidden</span>
                        )}
                      </div>
                      <h2 className="text-base font-medium text-gray-900">{service.name}</h2>
                      {service.tagline && <p className="text-xs text-gray-500">{service.tagline}</p>}
                    </div>
                  </div>
                  <div className="flex items-center gap-6">
                    <button
                      onClick={() => toggleActive(service)}
                      className="text-xs font-bold tracking-widest text-gray-500 hover:text-gray-900 uppercase cursor-pointer"
                    >
                      {service.active ? 'Hide' : 'Show'}
                    </button>
                    <Link href={`/admin/services/${service.id}/packages`} className="text-xs font-bold tracking-widest text-gray-500 hover:text-[#aa002a] uppercase">
                      Packages
                    </Link>
                    <Link href={`/admin/services/edit/${service.id}`} className="text-xs font-bold tracking-widest text-gray-500 hover:text-[#aa002a] uppercase">
                      Edit
                    </Link>
                    <form onSubmit={async (e) => {
                      e.preventDefault()
                      if (!confirm(`Are you sure you want to delete "${service.name}"?`)) return

                      const { error } = await supabase.from('services').delete().eq('id', service.id)
                      if (error) {
                        alert('Error deleting: ' + error.message)
                      } else {
                        setServices(prev => prev.filter(s => s.id !== service.id))
                      }
                    }}>
                      <button
                        type="submit"
                        className="text-xs font-bold tracking-widest text-red-500 hover:text-red-700 uppercase cursor-pointer py-2"
                      >
                        Delete
                      </button>
                    </form>
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
