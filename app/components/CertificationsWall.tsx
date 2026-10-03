'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

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

  // Nothing added yet — don't show an empty section on the homepage
  if (!isLoading && certs.length === 0) return null
  if (isLoading) return null

  return (
    <section className="max-w-7xl mx-auto px-6 py-20 font-sans bg-paper">
      <div className="max-w-lg mb-12">
        <h2 className="text-3xl font-light tracking-wide uppercase text-ink-900 mb-3">
          Licenses &amp; Certifications
        </h2>
        <p className="text-sm text-ink-500 leading-relaxed">
          Verified credentials across software, design, and AI.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {certs.map((cert) => {
          const link = cert.verify_url || cert.image_url
          const linkLabel = cert.verify_url ? 'Verify' : 'View Certificate'

          const CardInner = (
            <>
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 shrink-0 bg-accent-600 text-white flex items-center justify-center text-sm font-bold uppercase rounded-none">
                  {cert.issuer.charAt(0)}
                </div>
                <div className="min-w-0">
                  <h3 className="text-sm font-medium text-ink-900 leading-snug group-hover:text-accent-600 transition-colors">
                    {cert.title}
                  </h3>
                  <p className="text-xs text-ink-500 mt-0.5">{cert.issuer}</p>
                </div>
              </div>
              <div className="flex items-center justify-between mt-6 pt-4 border-t border-ink-100">
                {cert.date && (
                  <span className="text-[10px] tracking-wider uppercase text-ink-300">
                    Issued {cert.date}
                  </span>
                )}
                {link && (
                  <span className="text-xs font-bold tracking-wide text-ink-500 group-hover:text-accent-600 transition-colors ml-auto">
                    {linkLabel} ↗
                  </span>
                )}
              </div>
            </>
          )

          const cardClass =
            'group bg-paper border border-ink-100 rounded-none p-5 shadow-sm hover:border-accent-600 transition-all flex flex-col justify-between'

          return link ? (
            <a key={cert.id} href={link} target="_blank" rel="noopener noreferrer" className={cardClass}>
              {CardInner}
            </a>
          ) : (
            <div key={cert.id} className={cardClass}>
              {CardInner}
            </div>
          )
        })}
      </div>
    </section>
  )
}
