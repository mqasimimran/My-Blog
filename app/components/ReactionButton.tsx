'use client'

import { useStoredValue, storeValue } from '@/lib/useStoredValue'
import { useState } from 'react'
import { Fire } from '@phosphor-icons/react'

export default function ReactionButton({ slug, initialCount }: { slug: string; initialCount: number }) {
  const [count, setCount] = useState(initialCount)
  const key = 'reacted_' + slug
  const hasReacted = !!useStoredValue(key)
  const [sending, setSending] = useState(false)

  async function handleReact() {
    if (hasReacted || sending) return

    setSending(true)

    try {
      const res = await fetch('/api/reactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug }),
      })
      if (res.ok) {
        storeValue(key, 'true')
        const data = await res.json()
        if (typeof data.count === 'number') setCount(data.count)
      }
    } catch (err) {
      console.error('Error saving reaction:', err)
    } finally {
      setSending(false)
    }
  }

  return (
    <button
      onClick={handleReact}
      disabled={hasReacted || sending}
      className={`inline-flex items-center gap-2 text-sm font-medium px-4 py-2 rounded-full border transition-colors ${
        hasReacted
          ? 'border-accent-600/30 bg-accent-600/5 text-accent-600 cursor-default'
          : 'border-ink-100 text-ink-700 hover:border-accent-600 hover:text-accent-600'
      }`}
    >
      <Fire size={18} weight="fill" aria-hidden />
      <span>{count > 0 ? `${count} loved this` : 'Loved this?'}</span>
    </button>
  )
}
