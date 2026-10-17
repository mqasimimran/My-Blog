'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from '@/components/SafeImage'
import { supabase } from '@/lib/supabase'
import AvailabilityBadge from '@/app/components/AvailabilityBadge'
import { SkeletonBlogList } from '@/app/components/Skeleton'
import { ButtonLink } from '@/app/components/ui/Button'
import EmptyState from '@/app/components/EmptyState'
import QuoteCalculator from '@/app/components/QuoteCalculator'
import { ArrowUpRight, Check, Sparkle } from '@phosphor-icons/react'
import SplitText from '@/app/components/ui/SplitText'

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
    title: 'Discovery call',
    description: "A short conversation to understand what you're trying to build and whether it's a good fit.",
  },
  {
    step: '02',
    title: 'Proposal and timeline',
    description: 'A clear scope, timeline, and quote. No surprises once work starts.',
  },
  {
    step: '03',
    title: 'Design and build',
    description: "Regular check-ins as the work progresses, so you're never waiting in the dark for a big reveal.",
  },
  {
    step: '04',
    title: 'Delivery and support',
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
    <main>
      <header className="container-page pb-12 pt-12 md:pb-16 md:pt-20">
        <AvailabilityBadge />
        <h1 className="type-display mt-6 text-ink-900"><SplitText text={"Services"} /></h1>
        <p className="type-lead mt-6 max-w-[52ch]">
          I take on a limited number of freelance projects across development and design. Pick the service that matches what you need, or reach out if you&rsquo;re not sure.
        </p>
      </header>

      {/* Services: one full-width row each */}
      <section className="container-page pb-20 md:pb-28">
        {isLoading ? (
          <SkeletonBlogList count={2} />
        ) : services.length === 0 ? (
          <EmptyState icon="inbox" title="No services listed yet" description="Get in touch and tell me what you need." />
        ) : (
          <ul className="border-b border-ink-100">
            {services.map((service) => {
              const packagePrices = (service.service_packages || [])
                .map((p) => parsePrice(p.price))
                .filter((n): n is number => n !== null)
              const startingAt = packagePrices.length > 0 ? `Starting at $${Math.min(...packagePrices)}` : service.starting_price
              const hasPackages = (service.service_packages || []).length > 0
              const includesList = service.includes ? service.includes.split('\n').map((line) => line.trim()).filter(Boolean) : []
              const href = hasPackages && service.slug ? `/services/${service.slug}` : '/contact'

              return (
                <li key={service.id} className="border-t border-ink-100">
                  <Link href={href} data-cursor="View" className="group grid gap-8 py-10 md:grid-cols-12 md:gap-12 md:py-14">
                    <div className="relative grid aspect-[16/10] place-items-center overflow-hidden bg-ink-50 md:col-span-5">
                      {service.cover_image ? (
                        <Image src={service.cover_image} alt={service.name} fill sizes="(max-width: 768px) 100vw, 40vw" className="object-cover transition-transform duration-[900ms] ease-[var(--ease-smooth)] group-hover:scale-[1.03]" />
                      ) : service.icon ? (
                        <span className="text-5xl">{service.icon}</span>
                      ) : (
                        <Sparkle size={48} weight="light" aria-hidden className="text-ink-300" />
                      )}
                    </div>

                    <div className="flex flex-col md:col-span-7">
                      <h2 className="type-h2 text-ink-900 transition-colors duration-300 group-hover:text-accent-600">{service.name}</h2>
                      {service.tagline && <p className="mt-3 text-base font-medium text-accent-600">{service.tagline}</p>}
                      {service.description && <p className="mt-5 max-w-[56ch] text-base leading-relaxed text-ink-700">{service.description}</p>}
                      {!hasPackages && includesList.length > 0 && (
                        <ul className="mt-6 grid gap-2 sm:grid-cols-2">
                          {includesList.slice(0, 6).map((item) => (
                            <li key={item} className="flex items-start gap-2.5 text-[15px] text-ink-700">
                              <Check size={16} weight="bold" aria-hidden className="mt-1 shrink-0 text-accent-600" />
                              {item}
                            </li>
                          ))}
                        </ul>
                      )}
                      <div className="mt-8 flex flex-wrap items-center gap-x-8 gap-y-3 md:mt-auto md:pt-8">
                        {startingAt && <span className="font-mono text-sm tabular-nums text-ink-900">{startingAt}</span>}
                        <span className="inline-flex items-center gap-1.5 text-sm font-medium text-ink-900 transition-colors duration-300 group-hover:text-accent-600">
                          {hasPackages ? 'View packages' : 'Get in touch'}
                          <ArrowUpRight size={16} weight="bold" aria-hidden className="transition-transform duration-300 ease-[var(--ease-smooth)] group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                        </span>
                      </div>
                    </div>
                  </Link>
                </li>
              )
            })}
          </ul>
        )}
      </section>

      {/* Process */}
      <section className="bg-ink-50">
        <div className="container-page section-y">
          <h2 className="type-h2 text-ink-900"><SplitText text={"How it works"} /></h2>
          <ol className="mt-14 grid grid-cols-1 gap-x-10 gap-y-12 sm:grid-cols-2 lg:grid-cols-4">
            {PROCESS.map((item, i) => (
              <li key={item.step} className="border-t-2 border-ink-900 pt-6">
                <p className="type-meta">Step {i + 1}</p>
                <h3 className="type-h3 mt-3 text-ink-900">{item.title}</h3>
                <p className="mt-3 text-[15px] leading-relaxed text-ink-700">{item.description}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Instant quote calculator */}
      <QuoteCalculator />

      {/* Call to action */}
      <section className="border-t border-ink-100">
        <div className="container-page section-y grid gap-8 lg:grid-cols-12 lg:items-end">
          <div className="lg:col-span-7">
            <h2 className="type-h2 text-ink-900"><SplitText text={"Have a project in mind?"} /></h2>
            <p className="type-lead mt-5 max-w-[48ch]">Tell me a bit about what you need and I&rsquo;ll get back to you with a quote and timeline.</p>
          </div>
          <div className="lg:col-span-5 lg:justify-self-end">
            <ButtonLink href="/contact">Request a quote</ButtonLink>
          </div>
        </div>
      </section>
    </main>
  )
}
