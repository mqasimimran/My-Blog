'use client'

import { useState, useEffect } from 'react'
import { useSession, signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { adminApi } from '@/lib/adminApi'
import AdminNav from '@/app/admin/AdminNav'

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
      let data: any = null
      let error: any = null
      try { data = await adminApi.list('services', { select: 'id, name, tagline, order_index, active', orderBy: 'order_index', ascending: true }) } catch (e: any) { error = e }

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

    let err1: any = null
    try { await adminApi.update('services', current.id, { order_index: target.order_index }) } catch (e: any) { err1 = e }
    let err2: any = null
    try { await adminApi.update('services', target.id, { order_index: current.order_index }) } catch (e: any) { err2 = e }

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
    let error: any = null
    try { await adminApi.update('services', service.id, { active: !service.active }) } catch (e: any) { error = e }
    if (error) {
      alert('Error updating: ' + error.message)
    } else {
      setServices(prev => prev.map(s => s.id === service.id ? { ...s, active: !s.active } : s))
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
    <div className="min-h-screen bg-paper flex flex-col md:flex-row font-sans">
      <AdminNav />

      <main className="flex-1 p-10 overflow-y-auto">
        <div className="max-w-5xl mx-auto">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-10">
            <div>
              <h1 className="text-3xl font-light tracking-wide uppercase text-ink-900">Manage Services</h1>
              <p className="text-xs text-ink-500 mt-1">Logged in AS {session.user?.name || 'Qasim'}</p>
            </div>
            <Link
              href="/admin/services/new"
              className="bg-accent-600 text-white text-xs font-bold tracking-widest uppercase px-6 py-3 rounded-none hover:bg-gray-900 transition-colors"
            >
              + New Service
            </Link>
          </div>

          {services.length === 0 ? (
            <div className="bg-paper rounded-none shadow-sm border border-ink-100 p-10 text-center text-sm text-ink-500">
              No services found. Click "+ New Service" to add your first offering!
            </div>
          ) : (
            <div className="space-y-4">
              {services.map((service, index) => (
                <div key={service.id} className="bg-paper p-4 border border-ink-100 rounded-none flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between shadow-sm hover:border-ink-100 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="flex flex-col gap-1">
                      <button
                        onClick={() => moveItem(index, 'up')}
                        disabled={index === 0}
                        className="w-6 h-6 bg-ink-100 hover:bg-ink-100 disabled:opacity-30 rounded-none flex items-center justify-center text-[10px] font-bold transition-colors cursor-pointer"
                        title="Move Up"
                      >
                        ▲
                      </button>
                      <button
                        onClick={() => moveItem(index, 'down')}
                        disabled={index === services.length - 1}
                        className="w-6 h-6 bg-ink-100 hover:bg-ink-100 disabled:opacity-30 rounded-none flex items-center justify-center text-[10px] font-bold transition-colors cursor-pointer"
                        title="Move Down"
                      >
                        ▼
                      </button>
                    </div>
                    <div>
                      <div className="flex items-center gap-3 mb-1">
                        {!service.active && (
                          <span className="text-[9px] font-bold tracking-widest uppercase bg-amber-50 text-amber-700 px-2 py-0.5 rounded-none">Hidden</span>
                        )}
                      </div>
                      <h2 className="text-base font-medium text-ink-900">{service.name}</h2>
                      {service.tagline && <p className="text-xs text-ink-500">{service.tagline}</p>}
                    </div>
                  </div>
                  <div className="flex items-center flex-wrap gap-4">
                    <button
                      onClick={() => toggleActive(service)}
                      className="text-xs font-bold tracking-widest text-ink-500 hover:text-ink-900 uppercase cursor-pointer"
                    >
                      {service.active ? 'Hide' : 'Show'}
                    </button>
                    <Link href={`/admin/services/${service.id}/packages`} className="text-xs font-bold tracking-widest text-ink-500 hover:text-accent-600 uppercase">
                      Packages
                    </Link>
                    <Link href={`/admin/services/edit/${service.id}/packages`} className="text-xs font-bold tracking-widest text-ink-500 hover:text-accent-600 uppercase">
                      Edit
                    </Link>
                    <form onSubmit={async (e) => {
                      e.preventDefault()
                      if (!confirm(`Are you sure you want to delete "${service.name}"?`)) return

                      let error: any = null
                      try { await adminApi.remove('services', service.id) } catch (e: any) { error = e }
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
