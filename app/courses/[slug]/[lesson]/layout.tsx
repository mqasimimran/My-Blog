import { cache } from 'react'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { createClient } from '@supabase/supabase-js'
import { pageMeta } from '@/lib/seo'

// Public data only (the public key respects the database's access rules, so drafts stay hidden).
const db = () => createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)

const getLesson = cache(async (slug: string, lesson: string) => {
  const { data: c, error: courseError } = await db().from('courses').select('id, title, cover_image').eq('slug', slug).eq('published', true).maybeSingle()
  if (courseError) throw courseError
  if (!c) notFound()
  const { data: l, error } = await db().from('course_lessons').select('title, content').eq('course_id', c.id).eq('slug', lesson).maybeSingle()
  if (error) throw error
  if (!l) notFound()
  return { c, l }
})

export async function generateMetadata({ params }: { params: Promise<{ slug: string; lesson: string }> }): Promise<Metadata> {
  const { slug, lesson } = await params
  const { c, l } = await getLesson(slug, lesson)
  return pageMeta({ title: `${l.title} \u00b7 ${c.title}`, description: l.content, path: `/courses/${slug}/${lesson}`, image: c.cover_image, type: 'article' })
}
export default async function Layout({ children, params }: { children: React.ReactNode; params: Promise<{ slug: string; lesson: string }> }) {
  const { slug, lesson } = await params
  await getLesson(slug, lesson)
  return children
}
