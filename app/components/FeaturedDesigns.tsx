'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { SkeletonMasonryGrid } from '@/app/components/Skeleton'
import SectionHeader from '@/app/components/ui/SectionHeader'
import { ButtonLink } from '@/app/components/ui/Button'

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

  // Nothing marked as featured yet: don't show an empty section on the homepage
  if (!isLoading && designs.length === 0) return null

  return (
    <section className="border-t border-ink-100">
      <div className="container-page section-y">
        <SectionHeader
          title="Featured design"
          meta="(Selected pieces)"
          description="A few pieces from the visual design side: brand identities, UI/UX, and promotional work."
          action={<ButtonLink href="/design" variant="text">View full gallery</ButtonLink>}
        />

        <div className="mt-14">
          {isLoading ? (
            <SkeletonMasonryGrid count={4} />
          ) : (
            <div className={`columns-1 gap-6 sm:columns-2 ${designs.length <= 2 ? 'lg:columns-2' : designs.length === 3 ? 'lg:columns-3' : 'lg:columns-4'}`}>
              {designs.map((item) => (
                <Link href={`/design?item=${item.id}`} key={item.id} data-cursor="View" className="group mb-10 block break-inside-avoid">
                  <div className="overflow-hidden bg-ink-50">
                    {item.images?.[0] && (
                      <img
                        src={item.images[0]}
                        alt={item.title}
                        loading="lazy"
                        className="h-auto w-full object-cover transition-transform duration-[900ms] ease-[var(--ease-smooth)] group-hover:scale-[1.03]"
                      />
                    )}
                  </div>
                  <h3 className="mt-3 text-sm font-medium tracking-tight text-ink-900 transition-colors duration-300 group-hover:text-accent-600">{item.title}</h3>
                  <p className="type-meta mt-0.5">{item.category}</p>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
