'use client'

import { use, useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ArrowLeft, ArrowRight, CheckCircle } from '@phosphor-icons/react'
import { supabase } from '@/lib/supabase'
import { useLocale } from '@/app/components/LocaleProvider'
import PostQuiz from '@/app/components/PostQuiz'
import { getDone, markDone } from '@/lib/courseProgress'

type L = { id: string; slug: string; title: string; content: string | null; quiz: string | null; minutes: number | null; order_index: number }

export default function LessonPage({ params }: { params: Promise<{ slug: string; lesson: string }> }) {
  const { slug, lesson } = use(params)
  const { tx } = useLocale()
  const router = useRouter()
  const [course, setCourse] = useState<{ id: string; title: string; lessons: L[] } | null>(null)
  const [done, setDone] = useState<string[]>([])
  const [missing, setMissing] = useState(false)
  useEffect(() => {
    supabase.from('courses').select('id, title, course_lessons(id, slug, title, content, quiz, minutes, order_index)').eq('slug', slug).eq('published', true).maybeSingle().then(({ data }) => {
      if (!data) { setMissing(true); return }
      const lessons = ((data as any).course_lessons as L[]).sort((a, b) => a.order_index - b.order_index)
      if (!lessons.some((l) => l.slug === lesson)) { setMissing(true); return }
      setCourse({ id: (data as any).id, title: (data as any).title, lessons }); setDone(getDone((data as any).id))
    })
  }, [slug, lesson])
  if (missing) return <main className="container-page pb-24 pt-20"><h1 className="type-h2 text-ink-900">{tx('Lesson not found')}</h1><Link href={`/courses/${slug}`} className="link-draw mt-6 inline-block">{tx('Back to the course')}</Link></main>
  if (!course) return <main className="container-page pb-24 pt-20"><div className="h-60 bg-ink-50 motion-safe:animate-pulse" /></main>
  const i = course.lessons.findIndex((l) => l.slug === lesson), l = course.lessons[i], prev = course.lessons[i - 1], next = course.lessons[i + 1]
  const complete = () => { markDone(course.id, l.id); setDone(getDone(course.id)); router.push(next ? `/courses/${slug}/${next.slug}` : `/courses/${slug}`) }
  return (
    <main className="container-page pb-24 pt-12 md:pt-16">
      <Link href={`/courses/${slug}`} className="type-meta hover:text-ink-900" dir="auto">{course.title}</Link>
      <p className="mt-6 font-mono text-sm text-ink-500">{tx('Lesson')} {i + 1} / {course.lessons.length}{l.minutes ? ` \u00b7 ${l.minutes} min` : ''}</p>
      <h1 className="type-h1 mt-2 max-w-[24ch] text-ink-900" dir="auto">{l.title}</h1>
      {l.content && <div className="prose prose-lg mt-10 max-w-3xl" dir="auto" dangerouslySetInnerHTML={{ __html: l.content }} />}
      <div className="max-w-3xl"><PostQuiz text={l.quiz} /></div>
      <div className="mt-14 flex max-w-3xl flex-wrap items-center justify-between gap-4 border-t border-ink-100 pt-8">
        {prev ? <Link href={`/courses/${slug}/${prev.slug}`} className="inline-flex items-center gap-2 text-sm font-medium text-ink-900 hover:text-accent-600"><ArrowLeft size={16} aria-hidden /> {tx('Previous')}</Link> : <span />}
        <button onClick={complete} className="inline-flex h-12 items-center gap-2 bg-ink-900 px-6 text-sm font-medium text-paper hover:bg-accent-600 hover:text-on-accent">
          {done.includes(l.id) ? <CheckCircle size={18} weight="fill" aria-hidden /> : null}{next ? tx('Mark complete and continue') : tx('Finish the course')} {next && <ArrowRight size={16} aria-hidden />}
        </button>
      </div>
    </main>
  )
}
