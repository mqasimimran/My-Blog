import { ImageResponse } from 'next/og'
import { createClient } from '@supabase/supabase-js'

export const runtime = 'edge'
export const alt = 'Blog post'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default async function Image({ params }: { params: { slug: string } }) {
  const { data: article } = await supabase
    .from('articles')
    .select('title, category')
    .eq('slug', params.slug)
    .single()

  const title = article?.title || 'Muhammad Qasim Imran'
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
          <div style={{ width: 56, height: 6, background: '#aa002a', marginBottom: 32, display: 'flex' }} />
          <div
            style={{
              fontSize: 22,
              fontWeight: 700,
              letterSpacing: 4,
              textTransform: 'uppercase',
              color: '#aa002a',
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
            Muhammad Qasim Imran
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
