import type { MetadataRoute } from 'next'

// Keep this in sync with SITE_URL in app/layout.tsx and app/sitemap.ts
const SITE_URL = 'https://muhammadqasimimran.vercel.app'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/admin', '/admin/'],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  }
}
