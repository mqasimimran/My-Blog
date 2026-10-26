// Serve uploaded images at the size they're shown, through Next's image resizer (WebP/AVIF, cached).
// Spread onto a plain <img>: <img {...responsive(url, '(min-width: 1024px) 33vw, 100vw')} alt="..." />
// Only your own files (/public) and Supabase storage are resized; SVGs and other sites are left as they are.
const WIDTHS = [384, 640, 828, 1200, 1920]

export function responsive(src: string | null | undefined, sizes: string, quality = 75) {
  if (!src) return { src: '' }
  const ok = (src.startsWith('/') && !src.startsWith('//')) || /^https:\/\/[a-z0-9-]+\.supabase\.co\//i.test(src)
  if (!ok || /\.svg(\?|$)/i.test(src)) return { src }
  const url = (w: number) => `/_next/image?url=${encodeURIComponent(src)}&w=${w}&q=${quality}`
  return { src: url(1200), srcSet: WIDTHS.map((w) => `${url(w)} ${w}w`).join(', '), sizes }
}

// Blog card covers: shared by app/blog/page.tsx and the early hint in app/blog/layout.tsx (they must match).
export const BLOG_CARD_SIZES = '(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw'
