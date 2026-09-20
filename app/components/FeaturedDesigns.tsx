'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { SkeletonMasonryGrid } from '@/app/components/Skeleton'

type DesignItem = {
  id: string
  title: string
  category: string
  images: string[]
}

export default function FeaturedDesigns() {
  const [designs, setDesigns] = useState<DesignItem[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function fetchFeaturedDesigns() {
      const { data, error } = await supabase
        .from('designs')
        .select('id, title, category, images')
        .eq('featured', true)
        .order('created_at', { ascending: false })
        .limit(4)

      if (error) console.error('Error fetching featured designs:', error)
      else setDesigns(data || [])
      setIsLoading(false)
    }

    fetchFeaturedDesigns()
  }, [])

  // Nothing marked as featured yet — don't show an empty section on the homepage
  if (!isLoading && designs.length === 0) return null

  return (
    <section className="max-w-7xl mx-auto px-6 py-20 font-sans bg-white border-t border-gray-100">

      <div className="flex flex-col lg:flex-row lg:items-end justify-between mb-12 gap-8">
        <div className="max-w-lg">
          <h2 className="text-3xl font-light tracking-wide uppercase text-gray-900 mb-3">
            Featured Design
          </h2>
          <p className="text-sm text-gray-500 leading-relaxed">
            A few pieces from the visual design side — brand identities, UI/UX, and promotional work.
          </p>
        </div>
        <Link
          href="/design"
          className="text-[10px] font-bold tracking-widest uppercase text-gray-900 hover:text-[#aa002a] transition-colors flex items-center gap-1 shrink-0"
        >
          View Full Gallery ↗
        </Link>
      </div>

      {isLoading ? (
        <SkeletonMasonryGrid count={4} />
      ) : (
        <div className="columns-1 sm:columns-2 lg:columns-4 gap-6 space-y-6">
          {designs.map((item) => (
            <Link
              href={`/design?item=${item.id}`}
              key={item.id}
              className="group break-inside-avoid relative block rounded-lg overflow-hidden bg-gray-100 shadow-sm hover:shadow-xl transition-shadow"
            >
              {item.images?.[0] && (
                <img
                  src={item.images[0]}
                  alt={item.title}
                  loading="lazy"
                  className="w-full h-auto object-cover transform group-hover:scale-105 transition-transform duration-700 ease-out"
                />
              )}
              <div className="absolute inset-0 bg-gray-900/0 group-hover:bg-gray-900/70 transition-colors duration-300 flex flex-col justify-end p-5 opacity-0 group-hover:opacity-100">
                <span className="text-[10px] font-mono tracking-widest uppercase text-[#aa002a] mb-1">
                  {item.category}
                </span>
                <h3 className="text-white text-sm font-medium tracking-wide">
                  {item.title}
                </h3>
              </div>
            </Link>
          ))}
        </div>
      )}

    </section>
  )
}
