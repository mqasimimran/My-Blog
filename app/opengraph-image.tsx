import { ImageResponse } from 'next/og'

import { siteConfig } from '@/site.config'
export const runtime = 'edge'
export const alt = `${siteConfig.name} - ${siteConfig.jobTitle}`
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
            background: siteConfig.brand.accent,
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
            color: siteConfig.brand.accent,
            marginBottom: 28,
            display: 'flex',
          }}
        >
          {siteConfig.jobTitle}
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
          {siteConfig.name}
        </div>
        <div
          style={{
            fontSize: 24,
            color: '#6b6b6b',
            marginTop: 32,
            display: 'flex',
          }}
        >
          {siteConfig.skillsLine}
        </div>
      </div>
    ),
    { ...size }
  )
}
