'use client'

import { useState } from 'react'

export default function PreviewLinkField({ path, token }: { path: string; token: string }) {
  const [copied, setCopied] = useState(false)

  if (!token) return null

  const url = typeof window !== 'undefined' ? `${window.location.origin}${path}${token}` : `${path}${token}`

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // clipboard API unavailable — the field is still selectable/copyable by hand
    }
  }

  return (
    <div>
      <label className="block text-[10px] font-bold tracking-widest uppercase text-ink-500 mb-2">
        Shareable Preview Link <span className="text-ink-300 font-normal normal-case">(works even while unpublished)</span>
      </label>
      <div className="flex gap-2">
        <input type="text" readOnly value={url} onFocus={(e) => e.target.select()} className="w-full p-3 border border-ink-100 rounded-none text-xs text-ink-700 font-mono bg-paper" />
        <button type="button" onClick={copy} className="shrink-0 px-4 py-2 bg-gray-900 text-white text-xs font-bold uppercase tracking-wider rounded-none hover:bg-accent-600 transition-colors">
          {copied ? 'Copied ✓' : 'Copy'}
        </button>
      </div>
    </div>
  )
}
