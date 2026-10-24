'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { useLocale } from '@/app/components/LocaleProvider'
import SplitText from '@/app/components/ui/SplitText'
import { getDone } from '@/lib/courseProgress'

type C = { id: string; slug: string; title: string; description: string | null; cover_image: string | null; level: string | null; course_lessons: { id: string }[] }

// Free mini-courses. Progress is saved in the visitor's browser.
export default function CoursesPage() {
  const { tx } = useLocale()
  const [courses, setCourses] = useState<C[]>([])
  const [done, setDone] = useState<Record<string, number>>({})
  const [loading, setLoading] = useState(true)
  useEffect(() => {
    supabase.from('courses').select('id, slug, title, description, cover_image, level, course_lessons(id)').eq('published', true).order('order_index').then(({ data }) => {
      const list = (data as C[]) || []; setCourses(list); setDone(Object.fromEntries(list.map((c) => [c.id, getDone(c.id).filter((id) => c.course_lessons.some((l) => l.id === id)).length]))); setLoading(false)
    })
  }, [])
  return (
    <main className="container-page pb-24 pt-12 md:pt-20">
      <h1 className="type-display text-ink-900"><SplitText text={tx('Courses')} /></h1>
      <p className="type-lead mt-6 max-w-[52ch]">{tx('Free short courses on AI, computer science and design. Learn at your own pace; your progress is saved on this device.')}</p>
      {loading ? <div className="mt-12 h-48 bg-ink-50 motion-safe:animate-pulse" /> : courses.length === 0 ? <p className="mt-12 text-ink-500">{tx('The first course is on its way. Check back soon.')}</p> : (
        <ul className="mt-12 grid gap-6 md:grid-cols-2">
          {courses.map((c) => { const total = c.course_lessons.length, n = done[c.id] || 0; return (
            <li key={c.id}><Link href={`/courses/${c.slug}`} className="group flex h-full flex-col border border-ink-100 bg-paper-raised transition-colors hover:border-ink-900">
              {c.cover_image && <div className="relative aspect-video overflow-hidden border-b border-ink-100"><img src={c.cover_image} alt="" className="absolute inset-0 h-full w-full object-cover" /></div>}
              <div className="flex flex-1 flex-col p-6">
                <p className="type-meta">{[c.level, `${total} ${tx('lessons')}`].filter(Boolean).join(' \u00b7 ')}</p>
                <h2 className="mt-2 text-2xl font-medium tracking-tight text-ink-900 group-hover:text-accent-600" dir="auto">{c.title}</h2>
                {c.description && <p className="mt-2 flex-1 text-ink-700" dir="auto">{c.description}</p>}
                <div className="mt-5 flex items-center gap-3"><div className="h-1.5 flex-1 bg-ink-100"><div className="h-full bg-accent-600" style={{ width: `${total ? (n / total) * 100 : 0}%` }} /></div><span className="font-mono text-xs text-ink-500">{n}/{total}</span></div>
              </div>
            </Link></li>) })}
        </ul>
      )}
    </main>
  )
}
