'use client'

import { useState, useEffect, use } from 'react'
import { useSession, signOut } from 'next-auth/react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'

type ServicePackage = {
  id: string
  tier: string
  price: string
  delivery_days: number | null
  revisions: string | null
  features: string | null
  order_index: number
  isNew?: boolean
}

export default function ManagePackagesPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: serviceId } = use(params)
  const { data: session, status } = useSession()

  const [serviceName, setServiceName] = useState('')
  const [packages, setPackages] = useState<ServicePackage[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [savingId, setSavingId] = useState<string | null>(null)

  useEffect(() => {
    async function fetchData() {
      const { data: service } = await supabase.from('services').select('name').eq('id', serviceId).single()
      if (service) setServiceName(service.name)

      const { data, error } = await supabase
        .from('service_packages')
        .select('*')
        .eq('service_id', serviceId)
        .order('order_index', { ascending: true })

      if (error) console.error('Error fetching packages:', error)
      else setPackages(data || [])
      setIsLoading(false)
    }

    if (status === 'authenticated') fetchData()
  }, [serviceId, status])

  function addBlankPackage() {
    const tempId = `new-${Date.now()}`
    const suggestedTier = packages.length === 0 ? 'Basic' : packages.length === 1 ? 'Standard' : packages.length === 2 ? 'Premium' : ''
    setPackages(prev => [...prev, {
      id: tempId,
      tier: suggestedTier,
      price: '',
      delivery_days: null,
      revisions: '',
      features: '',
      order_index: prev.length,
      isNew: true,
    }])
  }

  function updateField(id: string, field: keyof ServicePackage, value: string | number | null) {
    setPackages(prev => prev.map(p => p.id === id ? { ...p, [field]: value } : p))
  }

  async function savePackage(pkg: ServicePackage) {
    if (!pkg.tier || !pkg.price) {
      alert('Tier name and price are required.')
      return
    }
    setSavingId(pkg.id)

    if (pkg.isNew) {
      const { data, error } = await supabase.from('service_packages').insert([{
        service_id: serviceId,
        tier: pkg.tier,
        price: pkg.price,
        delivery_days: pkg.delivery_days,
        revisions: pkg.revisions,
        features: pkg.features,
        order_index: pkg.order_index,
      }]).select().single()

      if (error) {
        alert('Error saving package: ' + error.message)
      } else {
        setPackages(prev => prev.map(p => p.id === pkg.id ? { ...data, isNew: false } : p))
      }
    } else {
      const { error } = await supabase.from('service_packages').update({
        tier: pkg.tier,
        price: pkg.price,
        delivery_days: pkg.delivery_days,
        revisions: pkg.revisions,
        features: pkg.features,
      }).eq('id', pkg.id)

      if (error) alert('Error updating package: ' + error.message)
    }
    setSavingId(null)
  }

  async function deletePackage(pkg: ServicePackage) {
    if (!confirm(`Delete the "${pkg.tier}" package?`)) return

    if (!pkg.isNew) {
      const { error } = await supabase.from('service_packages').delete().eq('id', pkg.id)
      if (error) {
        alert('Error deleting: ' + error.message)
        return
      }
    }
    setPackages(prev => prev.filter(p => p.id !== pkg.id))
  }

  if (status === 'loading' || isLoading) {
    return <div className="min-h-screen bg-slate-50 flex items-center justify-center font-mono text-xs uppercase tracking-widest text-gray-400">Loading packages...</div>
  }

  if (!session) return null

  return (
    <div className="min-h-screen bg-slate-50 flex font-sans">
      <aside className="w-64 bg-[#0B1120] text-white p-6 flex flex-col justify-between hidden md:flex">
        <div>
          <h2 className="text-xl font-light tracking-wide uppercase mb-10 text-white">Admin</h2>
          <nav className="flex flex-col gap-4 text-xs font-bold tracking-widest uppercase">
            <Link href="/admin/services" className="text-gray-400 hover:text-white transition-colors">
              ← Back to Services
            </Link>
            <Link href={`/admin/services/edit/${serviceId}`} className="text-gray-400 hover:text-white transition-colors">
              Edit Service Details
            </Link>
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
          <Link href="/admin/services" className="text-[10px] font-bold tracking-widest uppercase text-gray-400 hover:text-gray-900 block mb-4 md:hidden">
            ← Back to Services
          </Link>
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-light tracking-wide uppercase text-gray-900">Packages</h1>
              <p className="text-xs text-gray-500 mt-1">for {serviceName || 'this service'} — Basic / Standard / Premium tiers, like a Fiverr gig</p>
            </div>
            <button
              onClick={addBlankPackage}
              className="bg-[#aa002a] text-white text-xs font-bold tracking-widest uppercase px-6 py-3 rounded hover:bg-gray-900 transition-colors"
            >
              + Add Package
            </button>
          </div>

          {packages.length === 0 ? (
            <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-10 text-center text-sm text-gray-500">
              No packages yet. Click "+ Add Package" to create your first tier (e.g. Basic).
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {packages.map((pkg) => (
                <div key={pkg.id} className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm space-y-4">
                  <div>
                    <label className="block text-[10px] font-bold tracking-widest uppercase text-gray-500 mb-1">Tier Name</label>
                    <input
                      type="text"
                      value={pkg.tier}
                      onChange={(e) => updateField(pkg.id, 'tier', e.target.value)}
                      placeholder="Basic"
                      className="w-full border-b border-gray-300 py-1.5 outline-none focus:border-gray-900 text-sm font-medium"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold tracking-widest uppercase text-gray-500 mb-1">Price</label>
                    <input
                      type="text"
                      value={pkg.price}
                      onChange={(e) => updateField(pkg.id, 'price', e.target.value)}
                      placeholder="$25"
                      className="w-full border-b border-gray-300 py-1.5 outline-none focus:border-gray-900 text-sm"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] font-bold tracking-widest uppercase text-gray-500 mb-1">Delivery (days)</label>
                      <input
                        type="number"
                        value={pkg.delivery_days ?? ''}
                        onChange={(e) => updateField(pkg.id, 'delivery_days', e.target.value ? parseInt(e.target.value) : null)}
                        placeholder="3"
                        className="w-full border-b border-gray-300 py-1.5 outline-none focus:border-gray-900 text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold tracking-widest uppercase text-gray-500 mb-1">Revisions</label>
                      <input
                        type="text"
                        value={pkg.revisions ?? ''}
                        onChange={(e) => updateField(pkg.id, 'revisions', e.target.value)}
                        placeholder="2 revisions"
                        className="w-full border-b border-gray-300 py-1.5 outline-none focus:border-gray-900 text-sm"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold tracking-widest uppercase text-gray-500 mb-1">Features (one per line)</label>
                    <textarea
                      value={pkg.features ?? ''}
                      onChange={(e) => updateField(pkg.id, 'features', e.target.value)}
                      rows={5}
                      placeholder={'1 logo concept\nPNG + JPG files\nSource file'}
                      className="w-full border border-gray-200 p-2 outline-none focus:border-gray-900 text-xs font-mono"
                    />
                  </div>
                  <div className="flex items-center justify-between pt-2">
                    <button
                      onClick={() => deletePackage(pkg)}
                      className="text-xs font-bold uppercase tracking-widest text-red-500 hover:text-red-700"
                    >
                      Delete
                    </button>
                    <button
                      onClick={() => savePackage(pkg)}
                      disabled={savingId === pkg.id}
                      className="bg-gray-900 text-white text-xs font-bold uppercase tracking-widest px-4 py-2 rounded hover:bg-[#aa002a] transition-colors disabled:opacity-60"
                    >
                      {savingId === pkg.id ? 'Saving...' : pkg.isNew ? 'Create' : 'Save'}
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
