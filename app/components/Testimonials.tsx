'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

type Testimonial = {
  id: string
  name: string
  role: string | null
  quote: string
  avatar_url: string | null
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

  // Nothing added yet — don't show an empty section on the homepage
  if (!isLoading && testimonials.length === 0) return null
  if (isLoading) return null

  return (
    <section className="max-w-7xl mx-auto px-6 py-20 font-sans bg-white">
      <div className="max-w-lg mb-12">
        <h2 className="text-3xl font-light tracking-wide uppercase text-gray-900 mb-3">
          What People Say
        </h2>
        <p className="text-sm text-gray-500 leading-relaxed">
          A few words from people I've worked with.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {testimonials.map((t) => (
          <div key={t.id} className="border border-gray-200 rounded-xl p-8 flex flex-col">
            <p className="text-[#aa002a] text-3xl font-serif leading-none mb-4">"</p>
            <p className="text-gray-700 text-sm leading-relaxed mb-6 flex-1">{t.quote}</p>
            <div className="flex items-center gap-3 pt-4 border-t border-gray-100">
              {t.avatar_url ? (
                <img src={t.avatar_url} alt={t.name} className="w-10 h-10 rounded-full object-cover" />
              ) : (
                <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 text-xs font-bold uppercase">
                  {t.name.charAt(0)}
                </div>
              )}
              <div>
                <p className="text-sm font-medium text-gray-900">{t.name}</p>
                {t.role && <p className="text-xs text-gray-400">{t.role}</p>}
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
