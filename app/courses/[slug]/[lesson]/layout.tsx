import type { Metadata } from 'next'
import { createClient } from '@supabase/supabase-js'
import { SITE_URL } from '@/site.config'
import { pageMeta } from '@/lib/seo'

// Public data only (the public key respects the database's access rules, so drafts stay hidden).
const db = () => createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)

export async function generateMetadata({ params }: { params: Promise<{ slug: string; lesson: string }> }): Promise<Metadata> {
  const { slug, lesson } = await params
  const { data: c } = await db().from('courses').select('id, title, cover_image').eq('slug', slug).eq('published', true).maybeSingle()
  const { data: l } = c ? await db().from('course_lessons').select('title, content').eq('course_id', c.id).eq('slug', lesson).maybeSingle() : { data: null }
  if (!c || !l) return { title: 'Lesson not found', robots: { index: false } }
  return pageMeta({ title: `${l.title} \u00b7 ${c.title}`, description: l.content, path: `/courses/${slug}/${lesson}`, image: c.cover_image, type: 'article' })
}
export default function Layout({ children }: { children: React.ReactNode }) { return children }
