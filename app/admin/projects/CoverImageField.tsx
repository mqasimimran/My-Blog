'use client'

import { useState } from 'react'
import { adminStorage } from '@/lib/adminStorage'

// The project's cover picture: shown on project cards (homepage, archive) and at the top of the
// project page. Upload one, or pick one of the project's screenshots. If a project has no cover,
// cards use its first screenshot instead.
export default function CoverImageField({ value, onChange, screenshots = [] }: { value: string | null; onChange: (url: string | null) => void; screenshots?: string[] }) {
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')

  async function upload(file: File) {
    setUploading(true)
    setError('')
    const name = `cover_${Math.random().toString(36).slice(2)}.${file.name.split('.').pop() || 'jpg'}`
    const { error: upErr } = await adminStorage.from('blog-images').upload(name, file)
    if (upErr) setError('Upload failed: ' + upErr.message)
    else onChange(adminStorage.from('blog-images').getPublicUrl(name).data.publicUrl)
    setUploading(false)
  }

  return (
    <div>
      <label className="block text-[10px] font-bold tracking-widest uppercase text-ink-500 mb-2">Cover image</label>
      <p className="mb-3 text-[11px] text-ink-500">Shown on project cards and at the top of the project page. Best at 1600 × 1000 (16:10). No cover? Cards use the first screenshot.</p>
      <div className="flex flex-wrap items-start gap-4">
        <div className="relative aspect-[16/10] w-56 overflow-hidden border border-ink-100 bg-ink-50">
          {value ? <img src={value} alt="Current cover" className="absolute inset-0 h-full w-full object-cover" /> : <span className="absolute inset-0 grid place-items-center text-xs text-ink-500">No cover yet</span>}
        </div>
        <div className="flex flex-col gap-2">
          <label className="inline-flex cursor-pointer items-center bg-ink-900 px-4 py-2 text-xs font-medium uppercase tracking-[0.08em] text-paper hover:bg-accent-600">
            {uploading ? 'Uploading...' : value ? 'Replace image' : 'Upload image'}
            <input type="file" accept="image/*" className="sr-only" disabled={uploading} onChange={(e) => { const f = e.target.files?.[0]; if (f) upload(f); e.target.value = '' }} />
          </label>
          {value && <button type="button" onClick={() => onChange(null)} className="text-left text-xs font-medium uppercase tracking-[0.08em] text-ink-500 hover:text-error">Remove cover</button>}
          {error && <p role="alert" className="text-xs text-error">{error}</p>}
        </div>
      </div>
      {screenshots.length > 0 && (
        <div className="mt-4">
          <p className="mb-2 text-[11px] text-ink-500">Or use a screenshot as the cover:</p>
          <div className="flex flex-wrap gap-2">
            {screenshots.map((src) => (
              <button key={src} type="button" onClick={() => onChange(src)} aria-label="Use this screenshot as the cover"
                className={`relative aspect-[16/10] w-24 overflow-hidden border-2 ${value === src ? 'border-accent-600' : 'border-transparent hover:border-ink-300'}`}>
                <img src={src} alt="" className="absolute inset-0 h-full w-full object-cover" />
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
