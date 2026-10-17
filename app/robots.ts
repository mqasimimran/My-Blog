import type { MetadataRoute } from 'next'

import { SITE_URL_SLASH as SITE_URL } from '@/site.config'
// Keep this in sync with SITE_URL in app/layout.tsx and app/sitemap.ts

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
