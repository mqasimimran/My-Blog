import { ImageResponse } from 'next/og'

import { siteConfig } from '@/site.config'
export const size = { width: 180, height: 180 }
export const contentType = 'image/png'

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: siteConfig.brand.accent,
          color: 'white',
          fontSize: 84,
          fontWeight: 700,
          fontFamily: 'sans-serif',
        }}
      >
        {siteConfig.initials}
      </div>
    ),
    { ...size }
  )
}
