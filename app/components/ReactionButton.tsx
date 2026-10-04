'use client'

import { useState, useEffect } from 'react'

export default function ReactionButton({ slug, initialCount }: { slug: string; initialCount: number }) {
  const [count, setCount] = useState(initialCount)
  const [hasReacted, setHasReacted] = useState(false)

  useEffect(() => {
    setHasReacted(!!localStorage.getItem(`reacted_${slug}`))
  }, [slug])

  async function handleReact() {
    if (hasReacted) return

    setHasReacted(true)
    setCount((c) => c + 1)
    localStorage.setItem(`reacted_${slug}`, 'true')

    try {
      const res = await fetch('/api/reactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug }),
      })
      if (res.ok) {
        const data = await res.json()
        if (typeof data.count === 'number') setCount(data.count)
      }
    } catch (err) {
      console.error('Error saving reaction:', err)
    }
  }

  return (
    <button
      onClick={handleReact}
      disabled={hasReacted}
      className={`inline-flex items-center gap-2 text-sm font-medium px-4 py-2 rounded-full border transition-colors ${
        hasReacted
          ? 'border-accent-600/30 bg-accent-600/5 text-accent-600 cursor-default'
          : 'border-ink-100 text-ink-700 hover:border-accent-600 hover:text-accent-600'
      }`}
    >
      <span>🔥</span>
      <span>{count > 0 ? `${count} loved this` : 'Loved this?'}</span>
    </button>
  )
}
