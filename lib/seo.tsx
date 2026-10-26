import type { Metadata } from 'next'
import { siteConfig, SITE_URL } from '@/site.config'

// Shared SEO helpers: page metadata (title, description, canonical address, share image) and
// structured data (JSON-LD) that lets Google show rich results.
export const clip = (s: string | null | undefined, n = 158) => {
  const t = (s || '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim()
  return t.length > n ? t.slice(0, n - 1).replace(/\s+\S*$/, '') + '\u2026' : t
}

export function pageMeta({ title, description, path, image, type = 'website', noindex = false }: {
  title: string; description?: string | null; path: string; image?: string | null; type?: 'website' | 'article'; noindex?: boolean
}): Metadata {
  const desc = clip(description) || undefined
  // Without its own image, a page keeps the site's share image (setting openGraph here would otherwise
  // replace the site-wide one and leave the page with none).
  const images = [{ url: image || '/opengraph-image' }]
  return {
    title, description: desc,
    // Canonical and hreflang come from the root layout, which knows the page's real (language) address.
    openGraph: { title, description: desc, url: path, type, siteName: siteConfig.name, images },
    twitter: { card: 'summary_large_image', title, description: desc, images: images.map((i) => i.url) },
    ...(noindex ? { robots: { index: false, follow: false } } : {}),
  }
}

export const author = { '@type': 'Person', name: siteConfig.name, url: SITE_URL }
export const absolute = (u?: string | null) => (!u ? undefined : u.startsWith('http') ? u : `${SITE_URL}${u.startsWith('/') ? '' : '/'}${u}`)

/** <script type="application/ld+json"> with the data safely escaped. */
export function JsonLd({ data }: { data: Record<string, unknown> }) {
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({ '@context': 'https://schema.org', ...data }).replace(/</g, '\\u003c') }} />
}
