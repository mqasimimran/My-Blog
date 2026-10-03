'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { supabase } from '@/lib/supabase'

type ClientLogo = {
  id: string
  name: string
  image_url: string
  dark_image_url: string | null
  link_url: string | null
}

export default function LogosStrip() {
  const [logos, setLogos] = useState<ClientLogo[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function fetchLogos() {
      const { data, error } = await supabase
        .from('client_logos')
        .select('id, name, image_url, dark_image_url, link_url')
        .order('order_index', { ascending: true })

      if (error) console.error('Error fetching client logos:', error)
      else setLogos(data || [])
      setIsLoading(false)
    }
    fetchLogos()
  }, [])

  // Nothing added yet — don't show an empty section on the homepage
  if (isLoading || logos.length === 0) return null

  return (
    <section className="max-w-5xl mx-auto px-6 py-14 font-sans">
      <p className="text-center text-[10px] font-bold tracking-[0.2em] uppercase text-ink-300 mb-8">
        Work Seen At
      </p>
      <div className="flex flex-wrap items-center justify-center gap-x-16 gap-y-8">
        {logos.map((logo) => {
          const LogoImages = (
            <>
              <Image
                src={logo.image_url}
                alt={logo.name}
                width={400}
                height={120}
                className={`h-7 sm:h-8 w-auto max-w-[160px] object-contain ${logo.dark_image_url ? 'dark:hidden' : ''}`}
              />
              {logo.dark_image_url && (
                <Image
                  src={logo.dark_image_url}
                  alt={logo.name}
                  width={400}
                  height={120}
                  className="h-7 sm:h-8 w-auto max-w-[160px] object-contain hidden dark:block"
                />
              )}
            </>
          )

          const wrapperClass = 'h-7 sm:h-8 opacity-60 hover:opacity-100 transition-opacity grayscale hover:grayscale-0'

          return logo.link_url ? (
            <a key={logo.id} href={logo.link_url} target="_blank" rel="noopener noreferrer" className={wrapperClass}>
              {LogoImages}
            </a>
          ) : (
            <div key={logo.id} className={wrapperClass}>
              {LogoImages}
            </div>
          )
        })}
      </div>
    </section>
  )
}
