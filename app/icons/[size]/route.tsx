import { ImageResponse } from 'next/og'
import { siteConfig } from '@/site.config'

// App icons for the home screen (192 and 512 px): your initials on your accent colour, matching the
// small site icon. Generous padding so it still looks right when phones crop it into a circle.
export async function GET(_req: Request, { params }: { params: Promise<{ size: string }> }) {
  const n = (await params).size === '512' ? 512 : 192
  return new ImageResponse(
    <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: siteConfig.brand.accent, color: 'white', fontSize: Math.round(n * 0.38), fontWeight: 700, fontFamily: 'sans-serif' }}>
      {siteConfig.initials}
    </div>,
    { width: n, height: n, headers: { 'Cache-Control': 'public, max-age=86400' } },
  )
}
