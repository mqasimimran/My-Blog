'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import AvailabilityBadge from '@/app/components/AvailabilityBadge'

type ServicePackage = {
  id: string
  price: string
}

type Service = {
  id: string
  slug: string | null
  name: string
  tagline: string | null
  description: string | null
  includes: string | null
  icon: string | null
  cover_image: string | null
  starting_price: string | null
  service_packages: ServicePackage[]
}

const PROCESS = [
  {
    step: '01',
    title: 'Discovery Call',
    description: "A short conversation to understand what you're trying to build and whether it's a good fit.",
  },
  {
    step: '02',
    title: 'Proposal & Timeline',
    description: 'A clear scope, timeline, and quote — no surprises once work starts.',
  },
  {
    step: '03',
    title: 'Design & Build',
    description: "Regular check-ins as the work progresses, so you're never waiting in the dark for a big reveal.",
  },
  {
    step: '04',
    title: 'Delivery & Support',
    description: 'Final handoff plus a short support window to fix anything that comes up after launch.',
  },
]

function parsePrice(price: string): number | null {
  const match = price.replace(/,/g, '').match(/\d+(\.\d+)?/)
  return match ? parseFloat(match[0]) : null
}

export default function ServicesPage() {
  const [services, setServices] = useState<Service[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function fetchServices() {
      const { data, error } = await supabase
        .from('services')
        .select('id, slug, name, tagline, description, includes, icon, cover_image, starting_price, service_packages(id, price)')
        .eq('active', true)
        .order('order_index', { ascending: true })

      if (error) console.error('Error fetching services:', error)
      else setServices((data as unknown as Service[]) || [])
      setIsLoading(false)
    }

    fetchServices()
  }, [])

  return (
    <main className="min-h-screen bg-white font-sans">

      {/* Header */}
      <section className="bg-gradient-to-br from-slate-100 to-white py-24 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <div className="flex justify-center mb-6">
            <AvailabilityBadge />
          </div>
          <h1 className="text-4xl md:text-6xl font-light tracking-wide uppercase text-gray-900 mb-6">
            Services
          </h1>
          <p className="text-gray-500 text-sm md:text-base leading-relaxed max-w-xl mx-auto">
            I take on a limited number of freelance projects across development and design.
            Pick the service that matches what you need, or reach out if you're not sure.
          </p>
        </div>
      </section>

      {/* Gig Cards */}
      <section className="max-w-7xl mx-auto px-6 py-20">
        {isLoading ? (
          <div className="text-center py-20 text-gray-400 text-xs font-mono uppercase tracking-widest">
            Loading services...
          </div>
        ) : services.length === 0 ? (
          <div className="text-center py-20 text-gray-400 text-sm">
            No services listed yet.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((service) => {
              const packagePrices = (service.service_packages || [])
                .map((p) => parsePrice(p.price))
                .filter((n): n is number => n !== null)
              const startingAt = packagePrices.length > 0
                ? `Starting at $${Math.min(...packagePrices)}`
                : service.starting_price

              const hasPackages = (service.service_packages || []).length > 0
              const includesList = service.includes
                ? service.includes.split('\n').map((line) => line.trim()).filter(Boolean)
                : []

              const cardInner = (
                <>
                  <div className="h-40 bg-gray-100 flex items-center justify-center overflow-hidden">
                    {service.cover_image ? (
                      <img src={service.cover_image} alt={service.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    ) : (
                      <span className="text-5xl">{service.icon || '✦'}</span>
                    )}
                  </div>
                  <div className="p-6 flex flex-col flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      {!service.cover_image && service.icon && <span className="text-xl">{service.icon}</span>}
                      <h2 className="text-xl font-medium text-gray-900">{service.name}</h2>
                    </div>
                    {service.tagline && (
                      <p className="text-[#aa002a] text-xs font-bold tracking-[0.1em] uppercase mb-3">
                        {service.tagline}
                      </p>
                    )}
                    {service.description && (
                      <p className="text-sm text-gray-600 leading-relaxed mb-4 line-clamp-3">
                        {service.description}
                      </p>
                    )}
                    {!hasPackages && includesList.length > 0 && (
                      <ul className="space-y-1.5 mb-4">
                        {includesList.slice(0, 4).map((item) => (
                          <li key={item} className="flex items-start gap-2 text-xs text-gray-500">
                            <span className="text-[#aa002a] mt-0.5">→</span>
                            {item}
                          </li>
                        ))}
                      </ul>
                    )}
                    <div className="mt-auto pt-4 border-t border-gray-100 flex items-center justify-between">
                      {startingAt && (
                        <span className="text-xs font-bold uppercase tracking-widest text-gray-900">{startingAt}</span>
                      )}
                      <span className="text-[10px] font-bold uppercase tracking-widest text-[#aa002a]">
                        {hasPackages ? 'View Packages →' : 'Get In Touch →'}
                      </span>
                    </div>
                  </div>
                </>
              )

              return hasPackages && service.slug ? (
                <Link
                  key={service.id}
                  href={`/services/${service.slug}`}
                  className="group border border-gray-200 rounded-xl overflow-hidden flex flex-col hover:shadow-lg transition-shadow bg-white"
                >
                  {cardInner}
                </Link>
              ) : (
                <Link
                  key={service.id}
                  href="/contact"
                  className="group border border-gray-200 rounded-xl overflow-hidden flex flex-col hover:shadow-lg transition-shadow bg-white"
                >
                  {cardInner}
                </Link>
              )
            })}
          </div>
        )}
      </section>

      {/* Process */}
      <section className="bg-gray-50 border-t border-gray-200 py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-light tracking-wide uppercase text-gray-900 mb-12 text-center">
            How It Works
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {PROCESS.map((item) => (
              <div key={item.step}>
                <div className="text-4xl font-light text-gray-200 mb-3">{item.step}</div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">{item.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-gray-900 text-white py-24 px-6">
        <div className="max-w-3xl mx-auto text-center space-y-8">
          <h2 className="text-3xl md:text-5xl font-light tracking-wide uppercase">
            Have A Project In Mind?
          </h2>
          <p className="text-gray-400 text-sm md:text-base leading-relaxed max-w-xl mx-auto">
            Tell me a bit about what you need and I'll get back to you with a quote and timeline.
          </p>
          <div className="pt-4">
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 bg-[#aa002a] text-white text-xs font-bold tracking-[0.2em] uppercase px-8 py-4 rounded hover:bg-white hover:text-gray-900 transition-colors"
            >
              Request A Quote <span>↗</span>
            </Link>
          </div>
        </div>
      </section>

    </main>
  )
}
