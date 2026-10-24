'use client'

import { useState } from 'react'
import { useLocale } from '@/app/components/LocaleProvider'

export default function ShareButtons({ url, title }: { url: string; title: string }) {
  const { tx } = useLocale()
  const [copied, setCopied] = useState(false)

  const encodedUrl = encodeURIComponent(url)
  const encodedTitle = encodeURIComponent(title)

  async function handleCopy() {
    await navigator.clipboard.writeText(url)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="flex items-center gap-3">
      <span className="text-xs font-medium text-ink-300">{tx("Share")}</span>
      <a
        href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`}
        target="_blank"
        rel="noopener noreferrer"
        className="w-8 h-8 flex items-center justify-center rounded-full border border-ink-100 text-ink-500 hover:border-accent-600 hover:text-accent-600 transition-colors text-xs font-bold"
        aria-label={tx("Share on LinkedIn")}
      >
        in
      </a>
      <a
        href={`https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`}
        target="_blank"
        rel="noopener noreferrer"
        className="w-8 h-8 flex items-center justify-center rounded-full border border-ink-100 text-ink-500 hover:border-accent-600 hover:text-accent-600 transition-colors text-xs font-bold"
        aria-label={tx("Share on X")}
      >
        𝕏
      </a>
      <button
        onClick={handleCopy}
        className="text-xs font-medium text-ink-500 hover:text-accent-600 transition-colors border border-ink-100 rounded-full px-3 py-2"
      >
        {copied ? 'Copied!' : 'Copy Link'}
      </button>
    </div>
  )
}
