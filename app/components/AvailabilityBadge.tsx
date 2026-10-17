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

  // The dot is a real status signal (availability), not decoration, so it is the one place green appears.
  return (
    <p className="inline-flex items-center gap-2.5 text-sm font-medium text-ink-700">
      <span className="relative flex h-2 w-2" aria-hidden>
        <span className="absolute inline-flex h-full w-full rounded-full bg-success opacity-60 motion-safe:animate-ping" />
        <span className="relative inline-flex h-2 w-2 rounded-full bg-success" />
      </span>
      {message}
    </p>
  )
}
