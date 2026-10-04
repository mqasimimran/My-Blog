'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import { adminApi } from '@/lib/adminApi'
import AdminNav from '@/app/admin/AdminNav'

type ClientLogo = {
  id: string
  name: string
  image_url: string
  dark_image_url: string | null
  link_url: string | null
  order_index: number
}

export default function AdminLogosPage() {
  const { data: session, status } = useSession()
  const [logos, setLogos] = useState<ClientLogo[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function fetchLogos() {
      let data: any = null
      let error: any = null
      try { data = await adminApi.list('client_logos', { orderBy: 'order_index', ascending: true }) } catch (e: any) { error = e }

      if (error) console.error('Error fetching client logos:', error)
      else setLogos(data || [])
      setIsLoading(false)
    }

    if (status === 'authenticated') fetchLogos()
  }, [status])

  async function deleteLogo(id: string, name: string) {
    if (!confirm(`Remove "${name}" from the homepage logos strip?`)) return
    let error: any = null
    try { await adminApi.remove('client_logos', id) } catch (e: any) { error = e }
    if (error) {
      alert('Error deleting logo: ' + error.message)
    } else {
      setLogos(logos.filter((l) => l.id !== id))
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
      <AdminNav />

      <main className="flex-1 p-10 overflow-y-auto">
        <div className="max-w-5xl mx-auto">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-10">
            <div>
              <h1 className="text-3xl font-light tracking-wide uppercase text-ink-900">Manage Client Logos</h1>
              <p className="text-xs text-ink-500 mt-1">Shown in the "Work Seen At" strip on the homepage</p>
            </div>
            <Link
              href="/admin/logos/new"
              className="bg-accent-600 text-white text-xs font-bold tracking-widest uppercase px-6 py-3 rounded-none hover:bg-gray-900 transition-colors"
            >
              + New Logo
            </Link>
          </div>

          {logos.length === 0 ? (
            <div className="bg-paper rounded-none shadow-sm border border-ink-100 p-10 text-center text-sm text-ink-500">
              No logos yet. Click "+ New Logo" to add the first one.
            </div>
          ) : (
            <div className="space-y-4">
              {logos.map((logo) => (
                <div key={logo.id} className="bg-paper p-4 border border-ink-100 rounded-none flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between shadow-sm hover:border-ink-100 transition-colors">
                  <div className="flex items-center gap-4">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={logo.image_url} alt={logo.name} className="w-16 h-12 object-contain border border-ink-100 bg-paper" />
                    <div>
                      <h2 className="text-base font-medium text-ink-900">{logo.name}</h2>
                      <span className="text-[10px] text-ink-300 font-mono">
                        {logo.dark_image_url ? 'has dark-mode variant' : 'single image (no dark variant)'}
                        {logo.link_url ? ' · links out' : ''}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center flex-wrap gap-4">
                    <Link href={`/admin/logos/edit/${logo.id}`} className="text-xs font-bold tracking-widest text-ink-500 hover:text-accent-600 uppercase">
                      Edit
                    </Link>
                    <button onClick={() => deleteLogo(logo.id, logo.name)} className="text-xs font-bold tracking-widest text-red-500 hover:text-red-700 uppercase">
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
