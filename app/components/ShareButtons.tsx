'use client'

import { useState } from 'react'

export default function ShareButtons({ url, title }: { url: string; title: string }) {
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
      <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Share</span>
      <a
        href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`}
        target="_blank"
        rel="noopener noreferrer"
        className="w-8 h-8 flex items-center justify-center rounded-full border border-gray-200 text-gray-500 hover:border-[#aa002a] hover:text-[#aa002a] transition-colors text-xs font-bold"
        aria-label="Share on LinkedIn"
      >
        in
      </a>
      <a
        href={`https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`}
        target="_blank"
        rel="noopener noreferrer"
        className="w-8 h-8 flex items-center justify-center rounded-full border border-gray-200 text-gray-500 hover:border-[#aa002a] hover:text-[#aa002a] transition-colors text-xs font-bold"
        aria-label="Share on X"
      >
        𝕏
      </a>
      <button
        onClick={handleCopy}
        className="text-[10px] font-bold uppercase tracking-widest text-gray-500 hover:text-[#aa002a] transition-colors border border-gray-200 rounded-full px-3 py-2"
      >
        {copied ? 'Copied!' : 'Copy Link'}
      </button>
    </div>
  )
}
