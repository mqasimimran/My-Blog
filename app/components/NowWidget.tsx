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
    <div className="max-w-7xl mx-auto px-6 -mt-2 mb-2">
      <div className="bg-white border border-gray-200 rounded-xl p-6 flex items-start gap-4">
        <span className="relative flex h-2.5 w-2.5 mt-1.5 shrink-0">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#aa002a] opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#aa002a]"></span>
        </span>
        <div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1">Right Now</p>
          <p className="text-sm text-gray-700 leading-relaxed">{nowText}</p>
        </div>
      </div>
    </div>
  )
}
