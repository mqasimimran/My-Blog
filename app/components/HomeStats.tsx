'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import SectionHeader from '@/app/components/ui/SectionHeader'
import CountUp from '@/app/components/ui/CountUp'
import { useLocale } from '@/app/components/LocaleProvider'
import type { Key } from '@/lib/i18n'

type Stat = { value: number; label: Key }

// Real counts from the site's own content, so the numbers are never made up.
export default function HomeStats() {
  const { t } = useLocale()
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
        { value: projects, label: 'home.stats.projects' as const },
        { value: designs, label: 'home.stats.designs' as const },
        { value: articles, label: 'home.stats.articles' as const },
        { value: certs, label: 'home.stats.certs' as const },
      ].filter((s) => s.value > 0))
    }
    load()
  }, [])

  if (!stats || stats.length === 0) return null

  return (
    <section className="container-page section-y">
      <SectionHeader title={t('home.stats.title')} meta={t('home.stats.meta')} />
      <div className={`mt-12 grid grid-cols-2 border-l border-t border-ink-100 ${stats.length === 4 ? 'lg:grid-cols-4' : stats.length === 3 ? 'lg:grid-cols-3' : ''}`}>
        {stats.map((s) => (
          <div key={t(s.label)} className="border-b border-r border-ink-100 p-6 md:p-8">
            <p className="font-display text-[clamp(3rem,1.8rem+4vw,6rem)] uppercase leading-none text-ink-900">
              <CountUp value={`${s.value}+`} />
            </p>
            <p className="mt-6 max-w-[24ch] text-sm leading-relaxed text-ink-500">{t(s.label)}</p>
          </div>
        ))}
      </div>
    </section>
  )
}
