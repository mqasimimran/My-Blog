'use client'

import DesignAssignment from '@/app/components/admin/DesignAssignment'
import { mediaCover } from '@/lib/portfolioVideo'
import SiteImage from '@/components/SiteImage'
import { asError } from '@/lib/asError'
import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import { adminApi } from '@/lib/adminApi'
import AdminNav from '@/app/admin/AdminNav'

import { siteConfig } from '@/site.config'
type Design = {
  id: string
  title: string
  category: string
  images: string[]
  created_at: string
  client_id: string | null
  campaign_id: string | null
  needs: string[]
  featured: boolean
}

export default function AdminDesignsPage() {
  const { data: session, status } = useSession()
  const [designs, setDesigns] = useState<Design[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const [search, setSearch] = useState('')
  const visibleDesigns = designs.filter(design => design.title.toLowerCase().includes(search.toLowerCase()))
  const [selected, setSelected] = useState<string[]>([])
  const [assignment, setAssignment] = useState({client: '', campaign: '', needs: [] as string[]})
  const [bulkBusy, setBulkBusy] = useState(false)
  const [bulkMessage, setBulkMessage] = useState('')

  async function assignSelected() {
    if (!selected.length || bulkBusy) return
    setBulkBusy(true)
    setBulkMessage('')
    try {
      const fields = {client_id: assignment.client || null, campaign_id: assignment.campaign || null, needs: assignment.needs}
      const changed: Design[] = await adminApi.updateMany('designs', selected, fields)
      setDesigns(current => current.map(design => changed.find(item => item.id === design.id) || design))
      setSelected([])
      setBulkMessage(changed.length + ' designs updated.')
    } catch (error) { setBulkMessage(error instanceof Error ? error.message : 'Could not assign designs.') }
    finally { setBulkBusy(false) }
  }

  // Protect route on client side if unauthenticated


  useEffect(() => {
    async function fetchDesigns() {
      let data = null
      let error: Error | null = null
      try { data = await adminApi.list('designs', { orderBy: 'created_at', ascending: false }) } catch (cause) { error = asError(cause) }

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
    let error: Error | null = null
    try { await adminApi.remove('designs', id) } catch (cause) { error = asError(cause) }
    if (error) {
      alert('Error deleting design')
    } else {
      setDesigns(designs.filter(d => d.id !== id))
    }
  }

  async function toggleFeatured(design: Design) {
    let error: Error | null = null
    try { await adminApi.update('designs', design.id, { featured: !design.featured }) } catch (cause) { error = asError(cause) }
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
              <p className="text-xs text-ink-500 mt-1">Logged in AS {session.user?.name || siteConfig.firstName}</p>
            </div>
            <Link 
              href="/admin/designs/new" 
              className="bg-accent-600 text-white text-xs font-bold tracking-widest uppercase px-6 py-3 rounded-none hover:bg-gray-900 transition-colors"
            >
              + New Design Entry
            </Link>
          </div>

          <div className="mb-6 flex flex-wrap items-center gap-4 border border-ink-100 p-4">
            <Link href="/admin/logos" className="font-medium underline">Manage clients &amp; case studies</Link>
            <Link href="/design#clients" className="text-sm underline">View public client list</Link>
          </div>
          <fieldset disabled={bulkBusy} className="mb-8 space-y-4 border border-ink-100 p-4">
            <legend className="px-2 font-medium">Bulk assignment</legend>
            <label className="block text-sm">Find designs<input type="search" value={search} onChange={e => setSearch(e.target.value)} className="mt-1 block w-full border border-ink-100 bg-paper p-3" placeholder="Search titles, for example Business Fest" /></label>
            <label className="flex gap-2 text-sm"><input type="checkbox" checked={visibleDesigns.length > 0 && visibleDesigns.slice(0,200).every(d => selected.includes(d.id))} onChange={e => setSelected(e.target.checked ? visibleDesigns.slice(0,200).map(d => d.id) : [])} />Select up to 200 matching designs</label>
            <DesignAssignment clientId={assignment.client} campaignId={assignment.campaign} needs={assignment.needs}
              onChange={(client,campaign,needs) => setAssignment({client,campaign,needs})} />
            <p className="text-sm text-ink-500">Applying replaces the client, campaign and purpose tags on the selected designs. Empty choices clear their assignments.</p>
            <button type="button" disabled={!selected.length} onClick={assignSelected} className="bg-ink-900 px-4 py-3 text-paper disabled:opacity-50">{bulkBusy ? 'Applying…' : 'Apply to '+selected.length+' selected'}</button>
            {bulkMessage && <p role="status">{bulkMessage}</p>}
          </fieldset>
          {designs.length === 0 ? (
            <div className="bg-paper rounded-none shadow-sm border border-ink-100 p-10 text-center text-sm text-ink-500">
              No design entries found. Click &quot;+ New Design Entry&quot; to upload your first set!
            </div>
          ) : (
            <div className="space-y-4">
              {visibleDesigns.map((design) => (
                <div key={design.id} className="bg-paper p-4 border border-ink-100 rounded-none flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between shadow-sm hover:border-ink-100 transition-colors">
                  <div className="flex items-center gap-4">
                    <input type="checkbox" disabled={bulkBusy || (!selected.includes(design.id) && selected.length >= 200)} aria-label={'Select '+design.title} checked={selected.includes(design.id)} onChange={e => setSelected(current => e.target.checked ? [...current,design.id] : current.filter(id => id !== design.id))} />
                    {design.images?.[0] && (
                      <SiteImage sizes="48px" src={mediaCover(design.images[0])} alt={design.title} className="w-12 h-12 object-cover rounded-none border" />
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
                      <span className="text-[10px] text-ink-300 font-mono">{design.images?.length || 0} media item(s) attached</span>
                    </div>
                  </div>
                  <div className="flex items-center flex-wrap gap-4">
                    <Link href={'/admin/testimonials?work='+encodeURIComponent('design:'+design.id)} className="text-xs underline">Request testimonials</Link>
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