import { ImageResponse } from 'next/og'

export const runtime = 'edge'
export const alt = 'Muhammad Qasim Imran — Software Engineer & Graphic Designer'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'flex-start',
          backgroundColor: '#ffffff',
          padding: '90px',
          fontFamily: 'sans-serif',
        }}
      >
        <div
          style={{
            width: 56,
            height: 6,
            background: '#aa002a',
            marginBottom: 36,
            display: 'flex',
          }}
        />
        <div
          style={{
            fontSize: 22,
            fontWeight: 700,
            letterSpacing: 6,
            textTransform: 'uppercase',
            color: '#aa002a',
            marginBottom: 28,
            display: 'flex',
          }}
        >
          Software Engineer &amp; Graphic Designer
        </div>
        <div
          style={{
            fontSize: 72,
            fontWeight: 700,
            letterSpacing: 1,
            color: '#0a0a0a',
            display: 'flex',
          }}
        >
          Muhammad Qasim Imran
        </div>
        <div
          style={{
            fontSize: 24,
            color: '#6b6b6b',
            marginTop: 32,
            display: 'flex',
          }}
        >
          Web Development · Graphic Design · Unity Game Development
        </div>
      </div>
    ),
    { ...size }
  )
}
