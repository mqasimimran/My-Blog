'use client'

import { useState } from 'react'
import { adminStorage } from '@/lib/adminStorage'

export type WallpaperFile = { label: string; width: number | ''; height: number | ''; url: string }
const PRESETS: Omit<WallpaperFile, 'url'>[] = [
  { label: 'Phone', width: 1080, height: 2400 }, { label: 'Desktop', width: 1920, height: 1080 },
  { label: 'Desktop 4K', width: 3840, height: 2160 }, { label: 'Tablet', width: 2048, height: 2732 },
]

// One file per resolution. Set the price to 0 for a free wallpaper. Files are uploaded at full
// quality (not compressed), since wallpapers need every pixel.
export default function WallpaperFiles({ files, onChange }: { files: WallpaperFile[]; onChange: (f: WallpaperFile[]) => void }) {
  const [busy, setBusy] = useState<number | null>(null)
  const [error, setError] = useState('')
  const set = (i: number, patch: Partial<WallpaperFile>) => onChange(files.map((f, k) => (k === i ? { ...f, ...patch } : f)))
  async function upload(i: number, file: File) {
    setBusy(i); setError('')
    const name = `wallpapers/${Math.random().toString(36).slice(2)}-${file.name.replace(/[^a-z0-9.]+/gi, '-').toLowerCase()}`
    const { error: e } = await adminStorage.from('blog-images').upload(name, file, { optimize: false })
    if (e) setError('Upload failed: ' + e.message)
    else {
      const url = adminStorage.from('blog-images').getPublicUrl(name).data.publicUrl
      const img = new Image(); img.onload = () => set(i, { url, width: files[i].width || img.naturalWidth, height: files[i].height || img.naturalHeight }); img.onerror = () => set(i, { url }); img.src = URL.createObjectURL(file)
    }
    setBusy(null)
  }
  return (
    <div>
      <p className="block text-[10px] font-bold tracking-widest uppercase text-ink-500 mb-2">Resolutions</p>
      <p className="mb-4 text-xs text-ink-500">Add one file per size. Price 0 = free (download buttons on the page); otherwise buyers get every size after paying. The first product image is the preview.</p>
      <div className="space-y-3">
        {files.map((f, i) => (
          <div key={i} className="grid grid-cols-12 items-center gap-2 border border-ink-100 p-3">
            <input aria-label={`Size ${i + 1} name`} value={f.label} onChange={(e) => set(i, { label: e.target.value })} placeholder="e.g. Desktop 4K" className="col-span-12 border-b border-ink-100 py-1.5 text-sm outline-none md:col-span-3" />
            <input aria-label={`Size ${i + 1} width`} type="number" value={f.width} onChange={(e) => set(i, { width: e.target.value ? Number(e.target.value) : '' })} placeholder="Width" className="col-span-4 border-b border-ink-100 py-1.5 text-sm outline-none md:col-span-2" />
            <input aria-label={`Size ${i + 1} height`} type="number" value={f.height} onChange={(e) => set(i, { height: e.target.value ? Number(e.target.value) : '' })} placeholder="Height" className="col-span-4 border-b border-ink-100 py-1.5 text-sm outline-none md:col-span-2" />
            <label className="col-span-12 cursor-pointer text-xs font-medium uppercase tracking-[0.08em] text-ink-900 md:col-span-4">
              {busy === i ? 'Uploading...' : f.url ? '\u2713 File added (replace)' : 'Upload file'}
              <input type="file" accept="image/*" className="sr-only" onChange={(e) => { const file = e.target.files?.[0]; if (file) upload(i, file); e.target.value = '' }} />
            </label>
            <button type="button" aria-label={`Remove size ${i + 1}`} onClick={() => onChange(files.filter((_, k) => k !== i))} className="col-span-4 text-right text-ink-500 hover:text-error md:col-span-1">✕</button>
          </div>
        ))}
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        {PRESETS.filter((p) => !files.some((f) => f.label === p.label)).map((p) => (
          <button key={p.label} type="button" onClick={() => onChange([...files, { ...p, url: '' }])} className="border border-ink-100 px-3 py-1.5 text-xs text-ink-700 hover:border-ink-900">+ {p.label} ({p.width}×{p.height})</button>
        ))}
        <button type="button" onClick={() => onChange([...files, { label: '', width: '', height: '', url: '' }])} className="border border-ink-100 px-3 py-1.5 text-xs text-ink-700 hover:border-ink-900">+ Custom size</button>
      </div>
      {error && <p role="alert" className="mt-2 text-xs text-error">{error}</p>}
    </div>
  )
}
