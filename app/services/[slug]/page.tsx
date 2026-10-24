'use client'

import { useState, useEffect, use, Suspense } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { siteConfig } from '@/site.config'
import { ArrowLeft, ArrowRight, Check } from '@phosphor-icons/react'
import { SkeletonBlock } from '@/app/components/Skeleton'
import EmptyState from '@/app/components/EmptyState'
import SplitText from '@/app/components/ui/SplitText'
import { useLocale } from '@/app/components/LocaleProvider'
import ServiceDetails from '@/app/components/ServiceDetails'
import ServiceRequestForm from '@/app/components/ServiceRequestForm'

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
  const { tx } = useLocale()
  const { slug } = use(params)
  const [service, setService] = useState<Service | null>(null)
  const [packages, setPackages] = useState<ServicePackage[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    async function fetchService() {
      // The detailed fields come from an SQL update; until it's run, load the basic ones.
      const BASIC = 'id, name, tagline, description, icon, cover_image'
      let { data: serviceData, error: serviceError } = await supabase.from('services').select(`${BASIC}, deliverables, ideal_for, process, tools, turnaround, faq`).eq('slug', slug).single()
      if (serviceError && /deliverables|ideal_for|process|tools|turnaround|faq/.test(serviceError.message)) ({ data: serviceData, error: serviceError } = await supabase.from('services').select(BASIC).eq('slug', slug).single())

      if (serviceError || !serviceData) {
        setNotFound(true)
        setIsLoading(false)
        return
      }

      setService(serviceData as any)

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

  const backLink = (
    <Link href="/services" className="inline-flex items-center gap-2 text-sm font-medium text-ink-500 transition-colors duration-200 hover:text-ink-900">
      <ArrowLeft size={16} aria-hidden /> {tx("All services")}
    </Link>
  )

  if (isLoading) {
    return (
      <main className="container-page pb-24 pt-10 md:pt-14">
        <div className="mt-12 max-w-3xl space-y-5">
          <SkeletonBlock className="h-14 w-2/3" />
          <SkeletonBlock className="h-5 w-full" />
        </div>
        <div className="mt-16 grid gap-6 md:grid-cols-3">
          {[0, 1, 2].map((i) => <SkeletonBlock key={i} className="h-96 w-full" />)}
        </div>
      </main>
    )
  }

  if (notFound || !service) {
    return (
      <main className="container-page pb-24 pt-10">
        {backLink}
        <EmptyState icon="search" title={tx("This service couldn't be found")} description={tx("It may have been removed or renamed.")} />
      </main>
    )
  }

  return (
    <main className="pb-24 pt-10 md:pt-14">
      <div className="container-page">
        {backLink}
        <header className="mt-12 max-w-3xl md:mt-16">
          <div className="flex items-center gap-4">
            {service.icon && <span className="text-4xl">{service.icon}</span>}
            <h1 className="type-display text-ink-900"><SplitText text={service.name} /></h1>
          </div>
          {service.tagline && <p className="mt-5 text-lg font-medium text-accent-600">{service.tagline}</p>}
          {service.description && <p className="type-lead mt-5 max-w-[56ch]">{service.description}</p>}
        </header>
      </div>

      {/* Packages, compared side by side */}
      <ServiceDetails service={service as any} part="intro" />

      <section className="container-page mt-16 md:mt-20">
        {packages.length === 0 ? (
          <EmptyState icon="inbox" title={tx("No packages set up for this service yet")} description={tx("Get in touch for a custom quote.")} />
        ) : (
          <div className={`grid grid-cols-1 gap-6 ${packages.length === 2 ? 'md:grid-cols-2' : 'md:grid-cols-3'}`}>
            {packages.map((pkg, index) => {
              const isFeatured = packages.length === 3 && index === 1
              const featuresList = pkg.features ? pkg.features.split('\n').map((line) => line.trim()).filter(Boolean) : []
                            const contactHref = `?package=${encodeURIComponent(pkg.tier)}#request`

              return (
                <div
                  key={pkg.id}
                  className={`flex flex-col border bg-paper-raised p-8 ${isFeatured ? 'border-ink-900 border-t-4 border-t-accent-600' : 'border-ink-100'}`}
                >
                  <div className="flex items-baseline justify-between gap-4">
                    <p className="text-sm font-medium text-ink-900">{pkg.tier}</p>
                    {isFeatured && <p className="type-meta text-accent-600">{tx("Most popular")}</p>}
                  </div>
                  <p className="mt-4 text-[2.5rem] font-semibold leading-none tracking-[-0.04em] text-ink-900 tabular-nums">{pkg.price}</p>

                  {(pkg.delivery_days || pkg.revisions) && (
                    <p className="type-meta mt-5 flex flex-wrap gap-x-4 border-b border-ink-100 pb-6">
                      {pkg.delivery_days && <span>{tx('{days}-day delivery').replace('{days}', String(pkg.delivery_days))}</span>}
                      {pkg.revisions && <span>{pkg.revisions}</span>}
                    </p>
                  )}

                  <ul className="mb-10 mt-6 flex-1 space-y-3">
                    {featuresList.map((feature) => (
                      <li key={feature} className="flex items-start gap-2.5 text-[15px] text-ink-700">
                        <Check size={16} weight="bold" aria-hidden className="mt-1 shrink-0 text-accent-600" />
                        {feature}
                      </li>
                    ))}
                  </ul>

                  <Link
                    href={contactHref}
                    className={`group inline-flex h-12 items-center justify-center gap-2 text-sm font-medium tracking-tight transition-[background-color,color,transform,border-color] duration-300 ease-[var(--ease-smooth)] active:translate-y-px ${
                      isFeatured ? 'bg-ink-900 text-paper hover:bg-accent-600 hover:text-on-accent' : 'border border-ink-900 text-ink-900 hover:bg-ink-900 hover:text-paper'
                    }`}
                  >
                    {tx("Get started")}
                    <ArrowRight size={16} weight="bold" aria-hidden className="transition-transform duration-300 group-hover:translate-x-0.5" />
                  </Link>
                </div>
              )
            })}
          </div>
        )}
      </section>

      <ServiceDetails service={service as any} part="faq" />
      <Suspense fallback={null}><ServiceRequestForm serviceName={service.name} packages={packages.map((p) => p.tier)} /></Suspense>
    </main>
  )
}
