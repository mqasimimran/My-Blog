'use client'

import { use, useEffect, useState } from 'react'
import Link from 'next/link'
import { CheckCircle, Circle } from '@phosphor-icons/react'
import { supabase } from '@/lib/supabase'
import { useLocale } from '@/app/components/LocaleProvider'
import SplitText from '@/app/components/ui/SplitText'
import { getDone } from '@/lib/courseProgress'

type L = { id: string; slug: string; title: string; minutes: number | null; order_index: number }
type C = { id: string; slug: string; title: string; description: string | null; level: string | null; course_lessons: L[] }

export default function CoursePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params)
  const { tx } = useLocale()
  const [c, setC] = useState<C | null>(null)
  const [done, setDone] = useState<string[]>([])
  const [missing, setMissing] = useState(false)
  useEffect(() => {
    supabase.from('courses').select('id, slug, title, description, level, course_lessons(id, slug, title, minutes, order_index)').eq('slug', slug).eq('published', true).maybeSingle().then(({ data }) => {
      if (!data) { setMissing(true); return }
      const course = data as C; course.course_lessons.sort((a, b) => a.order_index - b.order_index); setC(course); setDone(getDone(course.id))
    })
  }, [slug])
  if (missing) return <main className="container-page pb-24 pt-20"><h1 className="type-h2 text-ink-900">{tx('Course not found')}</h1><Link href="/courses" className="link-draw mt-6 inline-block">{tx('All courses')}</Link></main>
  if (!c) return <main className="container-page pb-24 pt-20"><div className="h-40 bg-ink-50 motion-safe:animate-pulse" /></main>
  const total = c.course_lessons.length, n = c.course_lessons.filter((l) => done.includes(l.id)).length
  const next = c.course_lessons.find((l) => !done.includes(l.id)) || c.course_lessons[0]
  return (
    <main className="container-page pb-24 pt-12 md:pt-20">
      <Link href="/courses" className="type-meta hover:text-ink-900">{tx('All courses')}</Link>
      <h1 className="type-display mt-4 max-w-[18ch] text-ink-900"><SplitText text={c.title} /></h1>
      {c.description && <p className="type-lead mt-6 max-w-[56ch]" dir="auto">{c.description}</p>}
      <div className="mt-8 flex max-w-xl items-center gap-3"><div className="h-2 flex-1 bg-ink-100" role="progressbar" aria-valuenow={n} aria-valuemax={total} aria-label={tx('Your progress')}><div className="h-full bg-accent-600" style={{ width: `${total ? (n / total) * 100 : 0}%` }} /></div><span className="font-mono text-sm">{n}/{total}</span></div>
      {next && <Link href={`/courses/${c.slug}/${next.slug}`} className="mt-8 inline-flex h-12 items-center bg-ink-900 px-6 text-sm font-medium text-paper hover:bg-accent-600 hover:text-on-accent">{n === 0 ? tx('Start the course') : n === total ? tx('Review the course') : tx('Continue')}</Link>}
      <ol className="mt-12 max-w-3xl divide-y divide-ink-100 border-y border-ink-100">
        {c.course_lessons.map((l, i) => (
          <li key={l.id}><Link href={`/courses/${c.slug}/${l.slug}`} className="flex items-center gap-4 py-4 hover:text-accent-600">
            {done.includes(l.id) ? <CheckCircle size={22} weight="fill" aria-label={tx('Done')} className="shrink-0 text-success" /> : <Circle size={22} aria-hidden className="shrink-0 text-ink-300" />}
            <span className="font-mono text-sm text-ink-500">{String(i + 1).padStart(2, '0')}</span><span className="flex-1 text-[17px] text-ink-900" dir="auto">{l.title}</span>{l.minutes && <span className="text-sm text-ink-500">{l.minutes} min</span>}
          </Link></li>))}
      </ol>
    </main>
  )
}
