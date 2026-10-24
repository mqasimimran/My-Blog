'use client'

import { useEffect, useState } from 'react'

// Floating buttons (WhatsApp, the assistant) slide away while you scroll DOWN, so they never sit on
// top of what you're reading on a phone, and come back as soon as you scroll UP. Near the top of the
// page they always show.
export function useHideOnScroll(minScroll = 200, threshold = 8) {
  const [hidden, setHidden] = useState(false)
  useEffect(() => {
    let last = window.scrollY
    let ticking = false
    const onScroll = () => {
      if (ticking) return
      ticking = true
      requestAnimationFrame(() => {
        const y = window.scrollY
        if (Math.abs(y - last) > threshold) {
          setHidden(y > last && y > minScroll)
          last = y
        }
        ticking = false
      })
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [minScroll, threshold])
  return hidden
}
