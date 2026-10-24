'use client'

import { useEffect } from 'react'

// Registers public/sw.js on the live site (not while developing, so local changes are never cached).
export default function RegisterServiceWorker() {
  useEffect(() => {
    if (process.env.NODE_ENV !== 'production' || !('serviceWorker' in navigator)) return
    navigator.serviceWorker.register('/sw.js').catch(() => {})
  }, [])
  return null
}
