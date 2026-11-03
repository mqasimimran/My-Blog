import type { MetadataRoute } from 'next'
import { createClient } from '@supabase/supabase-js'

import { SITE_URL } from '@/site.config'
// Keep this in sync with SITE_URL in app/layout.tsx

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${SITE_URL}/`, changeFrequency: 'weekly', priority: 1 },
    { url: `${SITE_URL}/about`, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${SITE_URL}/projects`, changeFrequency: 'weekly', priority: 0.9 },
    { url: `${SITE_URL}/design`, changeFrequency: 'weekly', priority: 0.8 },
    { url: `${SITE_URL}/blog`, changeFrequency: 'weekly', priority: 0.9 },
    { url: `${SITE_URL}/services`, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${SITE_URL}/resume`, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${SITE_URL}/tech-stack`, changeFrequency: 'monthly', priority: 0.4 },
    { url: `${SITE_URL}/contact`, changeFrequency: 'yearly', priority: 0.5 },
    { url: `${SITE_URL}/privacy`, changeFrequency: 'yearly', priority: 0.3 },
    { url: `${SITE_URL}/shop`, changeFrequency: 'weekly', priority: 0.7 },
    { url: `${SITE_URL}/wallpapers`, changeFrequency: 'weekly', priority: 0.6 },
    { url: `${SITE_URL}/courses`, changeFrequency: 'weekly', priority: 0.8 },
    { url: `${SITE_URL}/roadmap`, changeFrequency: 'monthly', priority: 0.4 },
    { url: `${SITE_URL}/media-kit`, changeFrequency: 'monthly', priority: 0.4 },
    { url: `${SITE_URL}/links`, changeFrequency: 'monthly', priority: 0.3 },
  ]

  const [projectsRes, articlesRes, servicesRes, productsRes, coursesRes, clientsRes] = await Promise.all([
    supabase.from('projects').select('slug, created_at'),
    supabase.from('articles').select('slug, created_at').eq('published', true),
    supabase.from('services').select('slug, created_at').eq('active', true),
    supabase.from('products').select('slug, created_at').eq('active', true),
    supabase.from('courses').select('slug, created_at, course_lessons(slug)').eq('published', true),
    supabase.from('client_logos').select('slug').not('slug', 'is', null).eq('show_on_design', true),
  ])

  const projectRoutes: MetadataRoute.Sitemap = (projectsRes.data || []).map((p) => ({
    url: `${SITE_URL}/projects/${p.slug}`,
    lastModified: p.created_at ? new Date(p.created_at) : undefined,
    changeFrequency: 'monthly',
    priority: 0.7,
  }))

  const articleRoutes: MetadataRoute.Sitemap = (articlesRes.data || []).map((a) => ({
    url: `${SITE_URL}/blog/${a.slug}`,
    lastModified: a.created_at ? new Date(a.created_at) : undefined,
    changeFrequency: 'monthly',
    priority: 0.7,
  }))

  const serviceRoutes: MetadataRoute.Sitemap = (servicesRes.data || [])
    .filter((s) => s.slug)
    .map((s) => ({
      url: `${SITE_URL}/services/${s.slug}`,
      lastModified: s.created_at ? new Date(s.created_at) : undefined,
      changeFrequency: 'monthly',
      priority: 0.6,
    }))

  // Shop products and free courses (with their lessons). Missing tables (before an SQL update) are skipped.
  const productRoutes: MetadataRoute.Sitemap = (productsRes.data || []).filter((p) => p.slug).map((p) => ({ url: `${SITE_URL}/shop/${p.slug}`, lastModified: p.created_at ? new Date(p.created_at) : undefined, changeFrequency: 'monthly', priority: 0.6 }))
  const courseRoutes: MetadataRoute.Sitemap = (coursesRes.data || []).flatMap((c: any) => [
    { url: `${SITE_URL}/courses/${c.slug}`, lastModified: c.created_at ? new Date(c.created_at) : undefined, changeFrequency: 'monthly' as const, priority: 0.7 },
    ...((c.course_lessons || []) as { slug: string }[]).map((l) => ({ url: `${SITE_URL}/courses/${c.slug}/${l.slug}`, changeFrequency: 'monthly' as const, priority: 0.5 })),
  ])
  const clientRoutes: MetadataRoute.Sitemap = (clientsRes.data || []).map((c: any) => ({ url: `${SITE_URL}/design/clients/${c.slug}`, changeFrequency: 'monthly' as const, priority: 0.6 }))
  // Every page in both languages; each entry names its twin so Google pairs them (hreflang).
  const all = [...staticRoutes, ...projectRoutes, ...articleRoutes, ...serviceRoutes, ...productRoutes, ...courseRoutes, ...clientRoutes]
  const urOf = (u: string) => { const p = u.slice(SITE_URL.length) || '/'; return `${SITE_URL}${p === '/' ? '/ur' : `/ur${p}`}` }
  return all.flatMap((e) => {
    const languages = { en: e.url, ur: urOf(e.url) }
    return [{ ...e, alternates: { languages } }, { ...e, url: urOf(e.url), priority: (e.priority ?? 0.5) * 0.8, alternates: { languages } }]
  })
}
