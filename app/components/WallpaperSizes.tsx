'use client'

import { useEffect, useState } from 'react'
import { DownloadSimple } from '@phosphor-icons/react'
import { useLocale } from '@/app/components/LocaleProvider'

type Size = { index: number; label: string; width: number | null; height: number | null }

// A wallpaper's resolutions: free ones get a download button per size; paid ones list what's included.
export default function WallpaperSizes({ productId }: { productId: string }) {
  const { tx } = useLocale()
  const [d, setD] = useState<{ free: boolean; sizes: Size[] } | null>(null)
  useEffect(() => { fetch(`/api/wallpapers/${productId}`).then((r) => r.json()).then(setD).catch(() => {}) }, [productId])
  if (!d?.sizes.length) return null
  const dims = (s: Size) => (s.width && s.height ? `${s.width} \u00d7 ${s.height}` : '')
  return (
    <div className="mt-10">
      <p className="type-meta">{d.free ? tx('Free download') : tx('Includes these sizes')}</p>
      <ul className="mt-3 border-t border-ink-100">
        {d.sizes.map((s) => (
          <li key={s.index} className="flex items-center justify-between gap-4 border-b border-ink-100 py-3">
            <span><span className="text-[15px] font-medium text-ink-900">{s.label}</span> <span className="ms-2 font-mono text-sm text-ink-500" dir="ltr">{dims(s)}</span></span>
            {d.free && (
              <a href={`/api/wallpapers/${productId}/download?i=${s.index}`} className="inline-flex h-10 items-center gap-2 bg-ink-900 px-4 text-sm font-medium text-paper hover:bg-accent-600 hover:text-on-accent">
                <DownloadSimple size={16} aria-hidden /> {tx('Download')}
              </a>
            )}
          </li>
        ))}
      </ul>
    </div>
  )
}
