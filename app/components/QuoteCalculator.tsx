'use client'

import { useState, useEffect, useMemo } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'

type Package = {
  id: string
  tier: string
  price: string
}

type ServiceWithPackages = {
  id: string
  name: string
  service_packages: Package[]
}

function parsePrice(price: string): number | null {
  const match = price.replace(/,/g, '').match(/\d+(\.\d+)?/)
  return match ? parseFloat(match[0]) : null
}

export default function QuoteCalculator() {
  const [services, setServices] = useState<ServiceWithPackages[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selected, setSelected] = useState<Record<string, boolean>>({})

  useEffect(() => {
    async function fetchData() {
      const { data, error } = await supabase
        .from('services')
        .select('id, name, service_packages(id, tier, price)')
        .eq('active', true)
        .order('order_index', { ascending: true })

      if (error) console.error('Error fetching services for quote calculator:', error)
      else setServices((data as unknown as ServiceWithPackages[]) || [])
      setIsLoading(false)
    }
    fetchData()
  }, [])

  const togglePackage = (id: string) => {
    setSelected((prev) => ({ ...prev, [id]: !prev[id] }))
  }

  const { total, selectedLines } = useMemo(() => {
    let sum = 0
    const lines: string[] = []
    for (const service of services) {
      for (const pkg of service.service_packages || []) {
        if (selected[pkg.id]) {
          const parsed = parsePrice(pkg.price)
          if (parsed !== null) sum += parsed
          lines.push(`${service.name} — ${pkg.tier} (${pkg.price})`)
        }
      }
    }
    return { total: sum, selectedLines: lines }
  }, [selected, services])

  const servicesWithPackages = services.filter((s) => (s.service_packages || []).length > 0)

  if (isLoading || servicesWithPackages.length === 0) return null

  const hasSelection = selectedLines.length > 0
  const message = hasSelection
    ? `Hi Qasim, I'd like a quote for:\n\n${selectedLines.map((l) => `- ${l}`).join('\n')}\n\nEstimated starting total: $${total.toLocaleString()}`
    : ''

  return (
    <section className="max-w-4xl mx-auto px-6 py-20 font-sans">
      <div className="max-w-lg mb-10">
        <h2 className="text-3xl font-light tracking-wide uppercase text-ink-900 mb-3">
          Build a Quote
        </h2>
        <p className="text-sm text-ink-500 leading-relaxed">
          Pick what you need and get a ballpark price instantly — no back-and-forth required to get started.
        </p>
      </div>

      <div className="space-y-8">
        {servicesWithPackages.map((service) => (
          <div key={service.id}>
            <h3 className="text-xs font-bold tracking-[0.2em] uppercase text-ink-900 mb-3 pb-2 border-b border-ink-100">
              {service.name}
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {service.service_packages.map((pkg) => (
                <label
                  key={pkg.id}
                  className={`flex items-center justify-between gap-3 px-4 py-3 border rounded-none cursor-pointer transition-colors ${
                    selected[pkg.id] ? 'border-accent-600 bg-accent-600/5' : 'border-ink-100 hover:border-ink-100'
                  }`}
                >
                  <span className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={!!selected[pkg.id]}
                      onChange={() => togglePackage(pkg.id)}
                      className="w-4 h-4 accent-accent-600"
                    />
                    <span className="text-sm text-ink-700">{pkg.tier}</span>
                  </span>
                  <span className="text-sm font-mono text-ink-500">{pkg.price}</span>
                </label>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-10 pt-8 border-t border-ink-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
        <div>
          <p className="text-[10px] font-bold tracking-widest uppercase text-ink-300 mb-1">Estimated Starting Total</p>
          <p className="text-3xl font-light text-ink-900">
            {hasSelection ? `$${total.toLocaleString()}` : '—'}
          </p>
          {hasSelection && (
            <p className="text-xs text-ink-300 mt-1">Based on listed starting prices — final quote may vary with scope.</p>
          )}
        </div>
        <Link
          href={hasSelection ? `/contact?subject=${encodeURIComponent('Quote Request')}&message=${encodeURIComponent(message)}` : '#'}
          aria-disabled={!hasSelection}
          className={`inline-flex items-center justify-center gap-2 text-xs font-bold tracking-[0.2em] uppercase px-8 py-4 rounded-none transition-colors ${
            hasSelection
              ? 'bg-accent-600 text-white hover:bg-gray-900'
              : 'bg-ink-100 text-ink-300 pointer-events-none'
          }`}
        >
          Get This Quote →
        </Link>
      </div>
    </section>
  )
}
