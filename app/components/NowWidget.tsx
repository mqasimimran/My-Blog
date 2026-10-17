'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

export default function NowWidget() {
  const [nowText, setNowText] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function fetchNow() {
      const { data, error } = await supabase.from('site_settings').select('now_text').eq('id', 1).single()
      if (!error && data?.now_text) setNowText(data.now_text)
      setIsLoading(false)
    }
    fetchNow()
  }, [])

  if (isLoading || !nowText) return null

  return (
    <div className="container-page pb-4">
      <div className="flex max-w-3xl flex-col gap-2 border-l-2 border-accent-600 pl-5 sm:flex-row sm:gap-8">
        <p className="type-meta shrink-0 pt-1">Right now</p>
        <p className="text-base leading-relaxed text-ink-700">{nowText}</p>
      </div>
    </div>
  )
}
