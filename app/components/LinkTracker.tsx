'use client'

import { useEffect } from 'react'

// Counts taps on the Links page so you can see which links people actually use.
export default function LinkTracker() {
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      const a = (e.target as HTMLElement).closest('a') as HTMLAnchorElement | null
      if (!a) return
      const label = (a.innerText || a.getAttribute('aria-label') || a.href).trim().split('\n')[0]
      navigator.sendBeacon?.('/api/track-link', new Blob([JSON.stringify({ label })], { type: 'application/json' }))
    }
    document.addEventListener('click', onClick, true)
    return () => document.removeEventListener('click', onClick, true)
  }, [])
  return null
}
