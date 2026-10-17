'use client'

import { useState, useEffect } from 'react'
import { ArrowUpRight } from '@phosphor-icons/react'
import { supabase } from '@/lib/supabase'
import SectionHeader from '@/app/components/ui/SectionHeader'

type Certification = {
  id: string
  title: string
  issuer: string
  date: string | null
  image_url: string | null
  verify_url: string | null
}

export default function CertificationsWall() {
  const [certs, setCerts] = useState<Certification[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function fetchCertifications() {
      const { data, error } = await supabase
        .from('certifications')
        .select('id, title, issuer, date, image_url, verify_url')
        .order('order_index', { ascending: true })

      if (error) console.error('Error fetching certifications:', error)
      else setCerts(data || [])
      setIsLoading(false)
    }

    fetchCertifications()
  }, [])

  // Nothing added yet: don't show an empty section on the homepage
  if (isLoading || certs.length === 0) return null

  return (
    <section className="border-t border-ink-100">
      <div className="container-page section-y grid gap-12 lg:grid-cols-12 lg:gap-x-16">
        <div className="lg:col-span-4">
          <div className="lg:sticky lg:top-32">
            <SectionHeader title="Licenses and certifications" description="Verified credentials across software, design, and AI." meta="(Verified)" />
          </div>
        </div>

        <ul className="border-b border-ink-100 lg:col-span-8">
          {certs.map((cert) => {
            const link = cert.verify_url || cert.image_url
            const linkLabel = cert.verify_url ? 'Verify' : 'View certificate'

            const row = (
              <>
                <div className="min-w-0">
                  <h3 className="text-lg font-medium leading-snug tracking-tight text-ink-900 transition-colors duration-300 group-hover:text-accent-600">{cert.title}</h3>
                  <p className="mt-1 text-[15px] text-ink-500">{cert.issuer}</p>
                </div>
                <div className="flex shrink-0 flex-col items-end gap-2 text-right">
                  {cert.date && <span className="type-meta">Issued {cert.date}</span>}
                  {link && (
                    <span className="inline-flex items-center gap-1 text-sm font-medium text-ink-700 transition-colors duration-300 group-hover:text-accent-600">
                      {linkLabel}
                      <ArrowUpRight size={14} weight="bold" aria-hidden className="transition-transform duration-300 ease-[var(--ease-smooth)] group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                    </span>
                  )}
                </div>
              </>
            )

            const rowClass = 'group flex items-start justify-between gap-6 border-t border-ink-100 py-6'

            return (
              <li key={cert.id}>
                {link ? (
                  <a href={link} target="_blank" rel="noopener noreferrer" className={rowClass}>
                    {row}
                  </a>
                ) : (
                  <div className={rowClass}>{row}</div>
                )}
              </li>
            )
          })}
        </ul>
      </div>
    </section>
  )
}
