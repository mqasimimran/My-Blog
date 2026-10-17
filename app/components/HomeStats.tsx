'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import SectionHeader from '@/app/components/ui/SectionHeader'
import CountUp from '@/app/components/ui/CountUp'

type Stat = { value: number; label: string }

// Real counts from the site's own content, so the numbers are never made up.
export default function HomeStats() {
  const [stats, setStats] = useState<Stat[] | null>(null)

  useEffect(() => {
    async function load() {
      const count = async (table: string, published = true) => {
        let q = supabase.from(table).select('id', { count: 'exact', head: true })
        if (published) q = q.eq('published', true)
        const { count: n } = await q
        return n || 0
      }
      const [projects, designs, articles, certs] = await Promise.all([count('projects'), count('designs'), count('articles'), count('certifications', false)])
      setStats([
        { value: projects, label: 'Projects shipped across software, games and AI' },
        { value: designs, label: 'Design pieces published in the gallery' },
        { value: articles, label: 'Articles written on engineering and design' },
        { value: certs, label: 'Certifications and licenses earned' },
      ].filter((s) => s.value > 0))
    }
    load()
  }, [])

  if (!stats || stats.length === 0) return null

  return (
    <section className="container-page section-y">
      <SectionHeader title="Numbers that reflect the work" meta="(Live from this site)" />
      <div className={`mt-12 grid grid-cols-2 border-l border-t border-ink-100 ${stats.length === 4 ? 'lg:grid-cols-4' : stats.length === 3 ? 'lg:grid-cols-3' : ''}`}>
        {stats.map((s) => (
          <div key={s.label} className="border-b border-r border-ink-100 p-6 md:p-8">
            <p className="font-display text-[clamp(3rem,1.8rem+4vw,6rem)] uppercase leading-none text-ink-900">
              <CountUp value={`${s.value}+`} />
            </p>
            <p className="mt-6 max-w-[24ch] text-sm leading-relaxed text-ink-500">{s.label}</p>
          </div>
        ))}
      </div>
    </section>
  )
}
