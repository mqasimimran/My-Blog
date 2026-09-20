'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

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

    const { error } = await supabase.from('articles').update({ reaction_count: count + 1 }).eq('slug', slug)
    if (error) {
      console.error('Error saving reaction:', error)
    }
  }

  return (
    <button
      onClick={handleReact}
      disabled={hasReacted}
      className={`inline-flex items-center gap-2 text-sm font-medium px-4 py-2 rounded-full border transition-colors ${
        hasReacted
          ? 'border-[#aa002a]/30 bg-[#aa002a]/5 text-[#aa002a] cursor-default'
          : 'border-gray-200 text-gray-600 hover:border-[#aa002a] hover:text-[#aa002a]'
      }`}
    >
      <span>🔥</span>
      <span>{count > 0 ? `${count} loved this` : 'Loved this?'}</span>
    </button>
  )
}
