'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import MagneticButton from '@/app/components/MagneticButton'
import { supabase } from '@/lib/supabase'

type JourneyEntry = {
  id: string
  date_label: string
  title: string
  body: string | null
  image_url: string | null
  order_index: number
}

function ImagePlaceholder() {
  return (
    <div className="w-full aspect-[4/3] border-2 border-dashed border-ink-100 bg-paper/70 rounded-none flex items-center justify-center p-6 text-center">
      <p className="text-[11px] uppercase tracking-[0.15em] text-ink-300 leading-relaxed">
        No photo added yet
      </p>
    </div>
  )
}

export default function AboutJourneyPage() {
  const [entries, setEntries] = useState<JourneyEntry[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function fetchEntries() {
      const { data, error } = await supabase
        .from('journey_entries')
        .select('*')
        .order('order_index', { ascending: true })

      if (error) console.error('Error fetching journey entries:', error)
      else setEntries(data || [])
      setIsLoading(false)
    }

    fetchEntries()
  }, [])

  return (
    <main className="min-h-screen bg-paper font-sans">

      {/* Header */}
      <section className="max-w-3xl mx-auto px-6 pt-24 pb-16 text-center">
        <p className="text-[11px] font-bold tracking-[0.25em] uppercase text-ink-300 mb-4">A Journal</p>
        <h1 className="text-5xl md:text-6xl font-serif text-ink-900 tracking-tight mb-6">
          My Journey
        </h1>
        <p className="text-ink-500 font-serif italic text-lg leading-relaxed">
          Not a resume — a running log of how a Computer Science student
          ended up also being a designer, a game developer, and whatever comes next.
        </p>
      </section>

      {/* Timeline */}
      <section className="max-w-5xl mx-auto px-6 pb-24">
        {isLoading ? (
          <div className="text-center py-20 text-ink-300 text-xs font-mono uppercase tracking-widest">
            Loading...
          </div>
        ) : entries.length === 0 ? (
          <div className="text-center py-20 text-ink-300 text-sm">
            The journey hasn't been written yet — check back soon.
          </div>
        ) : (
          <div className="flex flex-col gap-20 md:gap-28">
            {entries.map((entry, index) => {
              const side = index % 2 === 0 ? 'left' : 'right'
              const paragraphs = entry.body
                ? entry.body.split('\n').map((p) => p.trim()).filter(Boolean)
                : []

              return (
                <article
                  key={entry.id}
                  className={`grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-16 items-center ${
                    side === 'right' ? 'md:[&>*:first-child]:order-2' : ''
                  }`}
                >
                  <div>
                    {entry.image_url ? (
                      <img
                        src={entry.image_url}
                        alt={entry.title}
                        className="w-full h-auto rounded-none shadow-sm object-cover"
                      />
                    ) : (
                      <ImagePlaceholder />
                    )}
                  </div>

                  <div>
                    <p className="text-[11px] font-bold tracking-[0.2em] uppercase text-accent-600 mb-3">
                      {entry.date_label}
                    </p>
                    <h2 className="text-2xl md:text-3xl font-serif text-ink-900 mb-4">
                      {entry.title}
                    </h2>
                    <div className="space-y-4 text-ink-700 leading-relaxed text-sm md:text-base">
                      {paragraphs.map((paragraph, i) => (
                        <p key={i}>{paragraph}</p>
                      ))}
                    </div>
                  </div>
                </article>
              )
            })}
          </div>
        )}
      </section>

      {/* Closing note */}
      <section className="border-t border-ink-100 bg-paper">
        <div className="max-w-2xl mx-auto px-6 py-20 text-center space-y-6">
          <p className="text-ink-500 font-serif italic text-lg leading-relaxed">
            Still figuring a lot of this out as I go. If any part of it overlaps
            with something you're building, I'd like to hear about it.
          </p>
          <MagneticButton>
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 bg-accent-600 text-white text-xs font-bold tracking-[0.2em] uppercase px-8 py-4 rounded-none hover:bg-gray-900 transition-colors"
            >
              Get In Touch <span>↗</span>
            </Link>
          </MagneticButton>
        </div>
      </section>

    </main>
  )
}
