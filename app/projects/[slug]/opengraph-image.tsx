import { ImageResponse } from 'next/og'
import { createClient } from '@supabase/supabase-js'

export const runtime = 'nodejs'
export const alt = 'Project'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default async function Image({ params }: { params: { slug: string } }) {
  const { data: project } = await supabase
    .from('projects')
    .select('title, category, tech_stack')
    .eq('slug', params.slug)
    .single()

  const title = project?.title || 'Muhammad Qasim Imran'
  const category = project?.category || 'Project'
  const stack = project?.tech_stack || ''

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          backgroundColor: '#0f0f10',
          padding: '80px',
          fontFamily: 'sans-serif',
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div
            style={{
              fontSize: 20,
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
              fontSize: 60,
              lineHeight: 1.15,
              color: '#ffffff',
              fontWeight: 600,
              display: 'flex',
            }}
          >
            {title}
          </div>
          {stack && (
            <div style={{ fontSize: 20, color: '#9ca3af', marginTop: 24, display: 'flex', fontFamily: 'monospace' }}>
              {stack}
            </div>
          )}
        </div>
        <div style={{ fontSize: 22, color: '#6b7280', display: 'flex' }}>
          Muhammad Qasim Imran — Portfolio
        </div>
      </div>
    ),
    { ...size }
  )
}
