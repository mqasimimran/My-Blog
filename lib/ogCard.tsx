import { ImageResponse } from 'next/og'
import { readFile } from 'node:fs/promises'
import { join } from 'node:path'
import { siteConfig } from '@/site.config'

// One share-card design (the preview on LinkedIn, WhatsApp, X...) for the whole site, in the same
// style as the pages: warm paper, frame rails, condensed uppercase headline.
// The share renderer can't read .woff2, so it uses the .woff copy of Anton in app/fonts. Runs on the
// standard Node.js runtime (the Edge runtime is deprecated in Next.js 16).
export const OG_SIZE = { width: 1200, height: 630 }

const PAPER = '#efeeea'
const INK = '#111110'
const MUTED = '#686763'
const LINE = '#d6d4cd'

export async function ogCard({ kicker, title, foot, byline }: { kicker: string; title: string; foot?: string; byline?: string }) {
  const anton = await readFile(join(process.cwd(), 'app', 'fonts', 'anton-latin-400-normal.woff'))
  const size = title.length > 70 ? 70 : title.length > 44 ? 88 : title.length > 24 ? 108 : 132
  const host = siteConfig.url.replace(/^https?:\/\//, '').replace(/^www\./, '').replace(/\/$/, '')

  return new ImageResponse(
    (
      <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', background: PAPER, color: INK, padding: '0 72px', position: 'relative' }}>
        <div style={{ position: 'absolute', left: 40, top: 0, bottom: 0, width: 1, background: LINE, display: 'flex' }} />
        <div style={{ position: 'absolute', right: 40, top: 0, bottom: 0, width: 1, background: LINE, display: 'flex' }} />

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 96, borderBottom: `1px solid ${LINE}` }}>
          <div style={{ display: 'flex', alignItems: 'center', fontSize: 22, letterSpacing: 4, textTransform: 'uppercase', color: MUTED }}>
            <div style={{ width: 14, height: 14, background: siteConfig.brand.accent, marginRight: 16, display: 'flex' }} />
            {kicker}
          </div>
          <div style={{ display: 'flex', background: INK, color: PAPER, fontSize: 20, letterSpacing: 3, textTransform: 'uppercase', padding: '12px 20px' }}>{host}</div>
        </div>

        <div style={{ display: 'flex', flex: 1, alignItems: 'center' }}>
          <div style={{ display: 'flex', fontFamily: 'Anton', fontSize: size, lineHeight: 0.95, textTransform: 'uppercase', maxWidth: 1040 }}>{title}</div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 96, borderTop: `1px solid ${LINE}` }}>
          <div style={{ display: 'flex', fontFamily: 'Anton', fontSize: 34, textTransform: 'uppercase' }}>{byline || siteConfig.name}</div>
          <div style={{ display: 'flex', fontSize: 22, color: MUTED, maxWidth: 560 }}>{foot || siteConfig.jobTitle}</div>
        </div>
      </div>
    ),
    { ...OG_SIZE, fonts: [{ name: 'Anton', data: anton, weight: 400, style: 'normal' }] }
  )
}
