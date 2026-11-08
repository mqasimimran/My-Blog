'use client'

import { useSyncExternalStore } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ArrowLeft, ArrowRight, CheckCircle } from '@phosphor-icons/react'
import { useLocale } from '@/app/components/LocaleProvider'
import PostQuiz from '@/app/components/PostQuiz'
import { getDone, markDone } from '@/lib/courseProgress'

type Lesson = { id: string; title: string; quiz: string | null; minutes: number | null }
function subscribe(listener: () => void) {
  window.addEventListener('storage', listener)
  return () => window.removeEventListener('storage', listener)
}

export default function LessonView({ slug, course, lesson: l, index, total, previous, next, children }: {
  slug: string; course: {id: string; title: string}; lesson: Lesson; index: number; total: number
  previous?: string; next?: string; children: React.ReactNode
}) {
  const {tx} = useLocale()
  const router = useRouter()
  const done = useSyncExternalStore(subscribe, () => getDone(course.id).includes(l.id), () => false)
  const complete = () => {
    markDone(course.id, l.id)
    router.push(next ? `/courses/${slug}/${next}` : `/courses/${slug}`)
  }
  return (
    <main className="container-page pb-24 pt-12 md:pt-16">
      <Link href={`/courses/${slug}`} className="type-meta hover:text-ink-900" dir="auto">{course.title}</Link>
      <p className="mt-6 font-mono text-sm text-ink-500">{tx('Lesson')} {index + 1} / {total}{l.minutes ? ` \u00b7 ${l.minutes} min` : ''}</p>
      <h1 className="type-h1 mt-2 max-w-[24ch] text-ink-900" dir="auto">{l.title}</h1>
      {children}
      <div className="max-w-3xl"><PostQuiz text={l.quiz} /></div>
      <div className="mt-14 flex max-w-3xl flex-wrap items-center justify-between gap-4 border-t border-ink-100 pt-8">
        {previous ? <Link href={`/courses/${slug}/${previous}`} className="inline-flex items-center gap-2 text-sm font-medium text-ink-900 hover:text-accent-600"><ArrowLeft size={16} aria-hidden /> {tx('Previous')}</Link> : <span />}
        <button onClick={complete} className="inline-flex h-12 items-center gap-2 bg-ink-900 px-6 text-sm font-medium text-paper hover:bg-accent-600 hover:text-on-accent">
          {done ? <CheckCircle size={18} weight="fill" aria-hidden /> : null}{next ? tx('Mark complete and continue') : tx('Finish the course')} {next && <ArrowRight size={16} aria-hidden />}
        </button>
      </div>
    </main>
  )
}
