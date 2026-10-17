'use client'

import { useState, useEffect } from 'react'
import Image from '@/components/SafeImage'
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

  // Nothing added yet: don't show an empty section on the homepage
  if (isLoading || logos.length === 0) return null

  // Every logo gets an equal cell and is fitted into the same height box, so wide wordmarks
  // and square emblems look the same size. Up to 8 logos sit in one row on large screens.
  const rowClass = logos.length <= 8 ? 'lg:grid-flow-col lg:auto-cols-fr lg:grid-cols-none' : 'lg:grid-cols-6'

  return (
    <section className="container-page py-12 md:py-14">
      <p className="text-sm text-ink-500">Work seen at</p>
      <ul className={`mt-8 grid grid-cols-2 gap-x-8 gap-y-8 sm:grid-cols-3 md:grid-cols-4 ${rowClass}`}>
        {logos.map((logo) => {
          const imgClass = 'h-auto max-h-11 w-auto max-w-full object-contain'
          const LogoImages = (
            <>
              <Image src={logo.image_url} alt={logo.name} width={400} height={120} className={`${imgClass} ${logo.dark_image_url ? 'dark:hidden' : ''}`} />
              {logo.dark_image_url && (
                <Image src={logo.dark_image_url} alt={logo.name} width={400} height={120} className={`hidden ${imgClass} dark:block`} />
              )}
            </>
          )
          const cellClass =
            'flex h-14 items-center justify-center opacity-70 grayscale transition-[opacity,filter] duration-300 hover:opacity-100 hover:grayscale-0'

          return (
            <li key={logo.id}>
              {logo.link_url ? (
                <a href={logo.link_url} target="_blank" rel="noopener noreferrer" className={cellClass}>
                  {LogoImages}
                </a>
              ) : (
                <div className={cellClass}>{LogoImages}</div>
              )}
            </li>
          )
        })}
      </ul>
    </section>
  )
}
