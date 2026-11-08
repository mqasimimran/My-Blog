import 'server-only'
import { cache } from 'react'
import { notFound } from 'next/navigation'
import { createClient } from '@supabase/supabase-js'
import { sanitizeRichHtml } from '@/lib/sanitizeRichHtml'

const db = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)
export const getCourseOverview = cache(async (slug: string) => {
  const result = await db.from('courses').select('id,title,level,description,cover_image,course_lessons(id,slug,order_index)')
    .eq('slug', slug).eq('published', true).maybeSingle()
  if (result.error) throw new Error('Could not load course')
  if (!result.data) notFound()
  const course = result.data
  const lessons = course.course_lessons.sort((a,b) => a.order_index - b.order_index)
  return {course, lessons}
})

export const getCourseLesson = cache(async (slug: string, lesson: string) => {
  const {course, lessons} = await getCourseOverview(slug)
  const index = lessons.findIndex(item => item.slug === lesson)
  if (index < 0) notFound()
  const {data, error} = await db.from('course_lessons').select('id,title,content,quiz,minutes')
    .eq('id', lessons[index].id).eq('course_id', course.id).maybeSingle()
  if (error) throw new Error('Could not load lesson')
  if (!data) notFound()
  const {content, ...details} = data
  return {course, lessons, index, details, content: sanitizeRichHtml(content || '')}
})
