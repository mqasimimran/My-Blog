'use client'

import { useState, useEffect } from 'react'
import { ButtonLink } from '@/app/components/ui/Button'
import EmptyState from '@/app/components/EmptyState'
import { SkeletonBlogList } from '@/app/components/Skeleton'
import { supabase } from '@/lib/supabase'
import SplitText from '@/app/components/ui/SplitText'

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
      <p className="text-xs text-ink-300 leading-relaxed">
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
    <main>
      <header className="container-page pb-12 pt-12 md:pb-20 md:pt-20">
        <p className="text-sm font-medium text-ink-500">A journal</p>
        <h1 className="type-display mt-4 text-ink-900"><SplitText text={"My Journey"} /></h1>
        <p className="type-lead mt-6 max-w-[52ch]">
          Not a resume. A running log of how a Computer Science student ended up also being a designer, a game developer, and whatever comes next.
        </p>
      </header>

      {/* Timeline: the date stays in view on the left while you read each entry */}
      <section className="container-page pb-24">
        {isLoading ? (
          <SkeletonBlogList count={2} />
        ) : entries.length === 0 ? (
          <EmptyState icon="sparkle" title="The journey hasn't been written yet" description="Check back soon." />
        ) : (
          <ol className="border-b border-ink-100">
            {entries.map((entry) => {
              const paragraphs = entry.body ? entry.body.split('\n').map((p) => p.trim()).filter(Boolean) : []
              return (
                <li key={entry.id} className="grid gap-6 border-t border-ink-100 py-14 md:grid-cols-12 md:gap-10 md:py-20">
                  <div className="md:col-span-3">
                    <p className="type-meta text-accent-600 md:sticky md:top-28">{entry.date_label}</p>
                  </div>
                  <article className="md:col-span-9">
                    <h2 className="type-h2 max-w-[22ch] text-ink-900">{entry.title}</h2>
                    {paragraphs.length > 0 && (
                      <div className="mt-6 max-w-[62ch] space-y-4 text-[17px] leading-[1.75] text-ink-700">
                        {paragraphs.map((paragraph, i) => (
                          <p key={i}>{paragraph}</p>
                        ))}
                      </div>
                    )}
                    {entry.image_url && (
                      <div className="mt-10 overflow-hidden bg-ink-50">
                        <img src={entry.image_url} alt={entry.title} loading="lazy" className="h-auto max-h-[560px] w-full object-cover" />
                      </div>
                    )}
                  </article>
                </li>
              )
            })}
          </ol>
        )}
      </section>

      {/* Closing note */}
      <section className="bg-ink-50">
        <div className="container-page section-y grid gap-8 lg:grid-cols-12 lg:items-end">
          <p className="type-h3 max-w-[40ch] font-medium text-ink-900 lg:col-span-8 md:text-[1.75rem] md:leading-snug">
            Still figuring a lot of this out as I go. If any part of it overlaps with something you&rsquo;re building, I&rsquo;d like to hear about it.
          </p>
          <div className="lg:col-span-4 lg:justify-self-end">
            <ButtonLink href="/contact">Get in touch</ButtonLink>
          </div>
        </div>
      </section>
    </main>
  )
}
