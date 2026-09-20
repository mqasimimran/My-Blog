'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

export default function AvailabilityBadge() {
  const [available, setAvailable] = useState(false)
  const [message, setMessage] = useState('')
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function fetchStatus() {
      const { data, error } = await supabase.from('site_settings').select('available_for_work, availability_message').eq('id', 1).single()
      if (!error && data) {
        setAvailable(data.available_for_work)
        setMessage(data.availability_message || 'Available for new projects')
      }
      setIsLoading(false)
    }
    fetchStatus()
  }, [])

  if (isLoading || !available) return null

  return (
    <div className="inline-flex items-center gap-2 bg-green-50 text-green-700 text-[11px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-full">
      <span className="relative flex h-2 w-2">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
        <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
      </span>
      {message}
    </div>
  )
}
