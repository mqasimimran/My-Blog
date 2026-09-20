import type { MetadataRoute } from 'next'
import { createClient } from '@supabase/supabase-js'

// Keep this in sync with SITE_URL in app/layout.tsx
const SITE_URL = 'https://muhammadqasimimran.vercel.app'

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
  ]

  const [projectsRes, articlesRes, servicesRes] = await Promise.all([
    supabase.from('projects').select('slug, created_at'),
    supabase.from('articles').select('slug, created_at').eq('published', true),
    supabase.from('services').select('slug, created_at').eq('active', true),
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

  return [...staticRoutes, ...projectRoutes, ...articleRoutes, ...serviceRoutes]
}
