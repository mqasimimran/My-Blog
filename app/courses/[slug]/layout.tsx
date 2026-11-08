import { getCourseOverview } from '@/lib/courseLesson'
import type { Metadata } from 'next'
import { SITE_URL } from '@/site.config'
import { JsonLd, absolute, author, clip, pageMeta } from '@/lib/seo'

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params; const {course: c} = await getCourseOverview(slug)
  return pageMeta({ title: `${c.title} (free course)`, description: c.description, path: `/courses/${slug}`, image: c.cover_image })
}
export default async function Layout({ children, params }: { children: React.ReactNode; params: Promise<{ slug: string }> }) {
  const { slug } = await params; const {course: c} = await getCourseOverview(slug)
  return (<>{c && <JsonLd data={{ '@type': 'Course', name: c.title, description: clip(c.description) || c.title, url: `${SITE_URL}/courses/${slug}`, provider: author, isAccessibleForFree: true,
    educationalLevel: c.level || undefined, image: absolute(c.cover_image), offers: { '@type': 'Offer', price: 0, priceCurrency: 'USD', category: 'Free' },
    hasCourseInstance: { '@type': 'CourseInstance', courseMode: 'Online', courseWorkload: 'PT1H' } }} />}{children}</>)
}
