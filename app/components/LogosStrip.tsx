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

  // A continuous scrolling row. Short lists are repeated so the row is always full.
  const row = logos.length >= 8 ? logos : Array.from({ length: Math.ceil(8 / logos.length) }, () => logos).flat()

  return (
    <section className="border-b border-ink-100 bg-paper py-10 md:py-12">
      <p className="text-center text-sm text-ink-500">Work seen at</p>
      <div className="mt-8 overflow-hidden [mask-image:linear-gradient(90deg,transparent,#000_8%,#000_92%,transparent)]">
        <div className="animate-marquee items-center" style={{ animationDuration: `${row.length * 4}s` }}>
          {[0, 1].map((copy) => (
            <ul key={copy} aria-hidden={copy === 1} className="flex shrink-0 items-center gap-16 pr-16">
              {row.map((logo, i) => {
                const imgClass = 'h-auto max-h-10 w-auto max-w-[170px] object-contain'
                const images = (
                  <>
                    <Image src={logo.image_url} alt={copy === 0 && i < logos.length ? logo.name : ''} width={400} height={120} className={`${imgClass} ${logo.dark_image_url ? 'dark:hidden' : ''}`} />
                    {logo.dark_image_url && <Image src={logo.dark_image_url} alt="" width={400} height={120} className={`hidden ${imgClass} dark:block`} />}
                  </>
                )
                const cell = 'flex h-12 shrink-0 items-center opacity-70 grayscale transition-[opacity,filter] duration-300 hover:opacity-100 hover:grayscale-0'
                return (
                  <li key={`${logo.id}-${i}`}>
                    {logo.link_url ? (
                      <a href={logo.link_url} target="_blank" rel="noopener noreferrer" tabIndex={copy === 1 || i >= logos.length ? -1 : undefined} className={cell}>{images}</a>
                    ) : (
                      <div className={cell}>{images}</div>
                    )}
                  </li>
                )
              })}
            </ul>
          ))}
        </div>
      </div>
    </section>
  )
}
