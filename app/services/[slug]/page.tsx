'use client'

import { useState, useEffect, use } from 'react'
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
}

type Service = {
  id: string
  name: string
  tagline: string | null
  description: string | null
  icon: string | null
  cover_image: string | null
}

export default function ServiceDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params)
  const [service, setService] = useState<Service | null>(null)
  const [packages, setPackages] = useState<ServicePackage[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    async function fetchService() {
      const { data: serviceData, error: serviceError } = await supabase
        .from('services')
        .select('id, name, tagline, description, icon, cover_image')
        .eq('slug', slug)
        .single()

      if (serviceError || !serviceData) {
        setNotFound(true)
        setIsLoading(false)
        return
      }

      setService(serviceData)

      const { data: packageData, error: packageError } = await supabase
        .from('service_packages')
        .select('*')
        .eq('service_id', serviceData.id)
        .order('order_index', { ascending: true })

      if (packageError) console.error('Error fetching packages:', packageError)
      else setPackages(packageData || [])

      setIsLoading(false)
    }

    fetchService()
  }, [slug])

  if (isLoading) {
    return (
      <main className="min-h-screen bg-white flex items-center justify-center">
        <p className="text-gray-400 text-xs font-mono uppercase tracking-widest">Loading...</p>
      </main>
    )
  }

  if (notFound || !service) {
    return (
      <main className="min-h-screen bg-white flex flex-col items-center justify-center gap-6 px-6 text-center">
        <p className="text-gray-500">This service couldn't be found.</p>
        <Link href="/services" className="text-[#aa002a] text-xs font-bold uppercase tracking-widest">← Back to Services</Link>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-white font-sans">

      {/* Header */}
      <section className="bg-gradient-to-br from-slate-100 to-white pt-24 pb-16 px-6">
        <div className="max-w-4xl mx-auto">
          <Link href="/services" className="text-[10px] font-bold uppercase tracking-widest text-gray-400 hover:text-gray-900 transition-colors block mb-6">
            ← All Services
          </Link>
          <div className="flex items-center gap-3 mb-3">
            {service.icon && <span className="text-3xl">{service.icon}</span>}
            <h1 className="text-3xl md:text-5xl font-light tracking-wide text-gray-900">{service.name}</h1>
          </div>
          {service.tagline && (
            <p className="text-[#aa002a] text-sm font-bold tracking-[0.15em] uppercase mb-6">{service.tagline}</p>
          )}
          {service.description && (
            <p className="text-gray-600 leading-relaxed max-w-2xl">{service.description}</p>
          )}
        </div>
      </section>

      {/* Package Cards */}
      <section className="max-w-6xl mx-auto px-6 py-16">
        {packages.length === 0 ? (
          <div className="text-center py-16 text-gray-400 text-sm">
            No packages set up for this service yet.
          </div>
        ) : (
          <div className={`grid grid-cols-1 gap-6 ${packages.length === 2 ? 'md:grid-cols-2 max-w-3xl mx-auto' : 'md:grid-cols-3'}`}>
            {packages.map((pkg, index) => {
              const isMiddle = packages.length === 3 && index === 1
              const featuresList = pkg.features
                ? pkg.features.split('\n').map((line) => line.trim()).filter(Boolean)
                : []

              return (
                <div
                  key={pkg.id}
                  className={`rounded-xl border flex flex-col p-8 ${
                    isMiddle ? 'border-[#aa002a] shadow-lg relative' : 'border-gray-200'
                  }`}
                >
                  {isMiddle && (
                    <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#aa002a] text-white text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full">
                      Most Popular
                    </span>
                  )}
                  <p className="text-xs font-bold uppercase tracking-[0.2em] text-gray-500 mb-2">{pkg.tier}</p>
                  <p className="text-3xl font-light text-gray-900 mb-4">{pkg.price}</p>

                  <div className="flex items-center gap-4 text-xs text-gray-500 mb-6 pb-6 border-b border-gray-100">
                    {pkg.delivery_days && <span>{pkg.delivery_days}-day delivery</span>}
                    {pkg.delivery_days && pkg.revisions && <span>·</span>}
                    {pkg.revisions && <span>{pkg.revisions}</span>}
                  </div>

                  <ul className="space-y-3 mb-8 flex-1">
                    {featuresList.map((feature) => (
                      <li key={feature} className="flex items-start gap-2 text-sm text-gray-700">
                        <span className="text-[#aa002a] mt-0.5">✓</span>
                        {feature}
                      </li>
                    ))}
                  </ul>

                  <Link
                    href={`/contact?subject=${encodeURIComponent(`${service.name} — ${pkg.tier} package`)}&message=${encodeURIComponent(`Hi Qasim, I'd like to get started on the ${pkg.tier} package (${pkg.price}) for ${service.name}.`)}`}
                    className={`text-center text-xs font-bold uppercase tracking-widest px-6 py-3 rounded transition-colors ${
                      isMiddle ? 'bg-[#aa002a] text-white hover:bg-gray-900' : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                    }`}
                  >
                    Get Started
                  </Link>
                </div>
              )
            })}
          </div>
        )}
      </section>

    </main>
  )
}
