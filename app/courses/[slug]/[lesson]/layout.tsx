import { getCourseLesson } from '@/lib/courseLesson'
import type { Metadata } from 'next'
import { pageMeta } from '@/lib/seo'

export async function generateMetadata({ params }: { params: Promise<{ slug: string; lesson: string }> }): Promise<Metadata> {
  const { slug, lesson } = await params
  const { course: c, details: l, content } = await getCourseLesson(slug, lesson)
  return pageMeta({ title: `${l.title} \u00b7 ${c.title}`, description: content, path: `/courses/${slug}/${lesson}`, image: c.cover_image, type: 'article' })
}
export default async function Layout({ children, params }: { children: React.ReactNode; params: Promise<{ slug: string; lesson: string }> }) {
  const { slug, lesson } = await params
  await getCourseLesson(slug, lesson)
  return children
}
