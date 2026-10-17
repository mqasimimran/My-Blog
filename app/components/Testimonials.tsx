'use client'

import { useState, useEffect } from 'react'
import Image from '@/components/SafeImage'
import { supabase } from '@/lib/supabase'
import SectionHeader from '@/app/components/ui/SectionHeader'

type Testimonial = {
  id: string
  name: string
  role: string | null
  quote: string
  avatar_url: string | null
}

export function Person({ t }: { t: Testimonial }) {
  return (
    <div className="flex items-center gap-3">
      {t.avatar_url ? (
        <div className="relative h-11 w-11 shrink-0 overflow-hidden bg-ink-50">
          <Image src={t.avatar_url} alt={t.name} fill sizes="44px" className="object-cover" />
        </div>
      ) : (
        <div className="grid h-11 w-11 shrink-0 place-items-center bg-ink-50 text-sm font-medium text-ink-700" aria-hidden>
          {t.name.charAt(0)}
        </div>
      )}
      <div>
        <p className="text-sm font-medium text-ink-900">{t.name}</p>
        {t.role && <p className="type-meta mt-0.5">{t.role}</p>}
      </div>
    </div>
  )
}

export default function Testimonials() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function fetchTestimonials() {
      const { data, error } = await supabase
        .from('testimonials')
        .select('id, name, role, quote, avatar_url')
        .eq('active', true)
        .order('order_index', { ascending: true })

      if (error) console.error('Error fetching testimonials:', error)
      else setTestimonials(data || [])
      setIsLoading(false)
    }

    fetchTestimonials()
  }, [])

  // Nothing added yet: don't show an empty section on the homepage
  if (isLoading || testimonials.length === 0) return null

  return (
    <section className="border-t border-ink-100">
      <div className="container-page section-y">
        <SectionHeader title="What people say" meta={`(${testimonials.length} kind ${testimonials.length === 1 ? 'word' : 'words'})`} />

        {/* Each card sticks under the navbar; the next one slides up and covers it. */}
        <ul className="mt-12">
          {testimonials.map((t) => (
            <li data-no-animate key={t.id} className="sticky top-[72px] bg-paper pb-6">
              <figure className="grid border border-ink-100 bg-paper md:min-h-[400px] md:grid-cols-12">
                <div className="relative aspect-[4/3] border-b border-ink-100 bg-ink-50 md:col-span-4 md:aspect-auto md:border-b-0 md:border-r">
                  {t.avatar_url ? (
                    <Image src={t.avatar_url} alt={t.name} fill sizes="(max-width: 768px) 100vw, 33vw" className="object-cover" />
                  ) : (
                    <div className="absolute inset-0 grid place-items-center font-display text-[6rem] uppercase text-ink-300" aria-hidden>{t.name.charAt(0)}</div>
                  )}
                </div>
                <div className="flex flex-col justify-center p-8 md:col-span-8 md:p-12">
                  <p className="type-meta text-ink-900">{t.name}</p>
                  <blockquote className="mt-5 max-w-[44ch] text-[clamp(1.25rem,1.05rem+0.8vw,1.75rem)] font-medium leading-[1.35] tracking-[-0.02em] text-ink-900">&ldquo;{t.quote}&rdquo;</blockquote>
                  {t.role && <figcaption className="mt-6 text-sm text-ink-500">{t.name}, {t.role}</figcaption>}
                </div>
              </figure>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
