import { ImageResponse } from 'next/og'
import { createClient } from '@supabase/supabase-js'

import { siteConfig } from '@/site.config'
export const runtime = 'edge'
export const alt = 'Blog post'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

// Next.js 16 made `params` a Promise. Reading it synchronously (the old way)
// silently produced `undefined`, so every post/project share-card fell back to
// the generic site title instead of the post's own title.
export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const { data: article } = await supabase
    .from('articles')
    .select('title, category')
    .eq('slug', slug)
    .single()

  const title = article?.title || siteConfig.name
  const category = article?.category || 'Blog'

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          backgroundColor: '#ffffff',
          padding: '80px',
          fontFamily: 'sans-serif',
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{ width: 56, height: 6, background: siteConfig.brand.accent, marginBottom: 32, display: 'flex' }} />
          <div
            style={{
              fontSize: 22,
              fontWeight: 700,
              letterSpacing: 4,
              textTransform: 'uppercase',
              color: siteConfig.brand.accent,
              marginBottom: 24,
              display: 'flex',
            }}
          >
            {category}
          </div>
          <div
            style={{
              fontSize: 64,
              fontWeight: 700,
              lineHeight: 1.15,
              color: '#0a0a0a',
              display: 'flex',
            }}
          >
            {title}
          </div>
        </div>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <div style={{ fontSize: 24, color: '#0a0a0a', fontWeight: 600, display: 'flex' }}>
            {siteConfig.name}
          </div>
          <div style={{ fontSize: 18, color: '#a3a3a3', display: 'flex' }}>
            From the Blog
          </div>
        </div>
      </div>
    ),
    { ...size }
  )
}
