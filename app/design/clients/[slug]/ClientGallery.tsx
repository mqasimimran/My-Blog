'use client'

import SaveDesign, { BriefLink } from '@/app/components/SaveDesign'
import { mediaCover, youtubeClip } from '@/lib/portfolioVideo'
import PortfolioVideo from '@/app/components/PortfolioVideo'
import SiteImage from '@/components/SiteImage'
import { useEffect, useState } from 'react'
import { CaretLeft, CaretRight, X } from '@phosphor-icons/react'

type D = { id: string; title: string; category: string | null; images: string[] | null }

// A client's designs, with a simple lightbox (arrows, Escape to close).
export default function ClientGallery({ designs }: { designs: D[] }) {
  const items = designs.flatMap((d) => (d.images || []).map((src, index) => ({ src, d, index })))
  const [open, setOpen] = useState<number | null>(null)
  useEffect(() => {
    if (open === null) return
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(null); if (e.key === 'ArrowRight') setOpen((i) => (i! + 1) % items.length); if (e.key === 'ArrowLeft') setOpen((i) => (i! - 1 + items.length) % items.length) }
    window.addEventListener('keydown', onKey); return () => window.removeEventListener('keydown', onKey)
  }, [open, items.length])
  if (!items.length) return <p className="mt-10 text-ink-500">Designs for this client are coming soon.</p>
  return (
    <>
      <div className="mt-6"><BriefLink /></div>
      <ul className="mt-10 columns-1 gap-4 sm:columns-2 md:columns-3">
        {items.map(({ src, d, index }, i) => index === 0 && (
          <li key={d.id} className="mb-4 break-inside-avoid"><button type="button" onClick={() => setOpen(i)} className="group block w-full text-start" aria-label={`Open ${d.title}`}>
            <div className="border border-ink-100 bg-ink-50">
              <SiteImage src={mediaCover(src)} sizes={'(min-width: 768px) 33vw, (min-width: 640px) 50vw, 100vw'} alt={d.title} loading={i < 3 ? 'eager' : 'lazy'} className="block h-auto w-full object-contain" />
            </div>
            <p className="mt-2 text-[15px] font-medium text-ink-900 group-hover:text-accent-600" dir="auto">{d.title}</p>
            {d.category && <p className="text-xs text-ink-500">{d.category}</p>}
          </button><SaveDesign id={d.id} /></li>
        ))}
      </ul>
      {open !== null && (
        <div role="dialog" aria-modal="true" aria-label={items[open].d.title} className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4" onClick={() => setOpen(null)}>
          {youtubeClip(items[open].src) ? (
            <div className="w-full text-white" onClick={(e) => e.stopPropagation()}>
              <PortfolioVideo src={items[open].src} title={items[open].d.title} />
            </div>
          ) : <SiteImage src={items[open].src} sizes={'100vw'} quality={85} alt={items[open].d.title} className="max-h-[88vh] max-w-full object-contain" onClick={(e) => e.stopPropagation()} />}
          <button type="button" aria-label="Close" onClick={() => setOpen(null)} className="absolute end-4 top-4 grid h-11 w-11 place-items-center bg-white/10 text-white"><X size={22} /></button>
          {items.length > 1 && <>
            <button type="button" aria-label="Previous" onClick={(e) => { e.stopPropagation(); setOpen((open - 1 + items.length) % items.length) }} className="absolute start-4 top-1/2 grid h-11 w-11 -translate-y-1/2 place-items-center bg-white/10 text-white"><CaretLeft size={22} /></button>
            <button type="button" aria-label="Next" onClick={(e) => { e.stopPropagation(); setOpen((open + 1) % items.length) }} className="absolute end-4 top-1/2 grid h-11 w-11 -translate-y-1/2 place-items-center bg-white/10 text-white"><CaretRight size={22} /></button>
          </>}
          <p className="absolute bottom-4 start-4 text-sm text-white/80">{items[open].d.title} &middot; {open + 1}/{items.length}</p>
        </div>
      )}
    </>
  )
}
