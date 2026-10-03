'use client'

import { useState, useEffect } from 'react'

export default function SplashScreen() {
  const [show, setShow] = useState(false)
  const [fadingOut, setFadingOut] = useState(false)

  useEffect(() => {
    // Only on the very first page load of a session, not every navigation
    // or repeat visit — repeat-visit splash screens just annoy people.
    if (sessionStorage.getItem('splash_shown')) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      sessionStorage.setItem('splash_shown', 'true')
      return
    }

    setShow(true)
    sessionStorage.setItem('splash_shown', 'true')

    const fadeTimer = setTimeout(() => setFadingOut(true), 650)
    const removeTimer = setTimeout(() => setShow(false), 950)
    return () => {
      clearTimeout(fadeTimer)
      clearTimeout(removeTimer)
    }
  }, [])

  if (!show) return null

  return (
    <div
      className={`fixed inset-0 z-[300] bg-paper flex items-center justify-center transition-opacity duration-300 ${
        fadingOut ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
    >
      <div className="w-14 h-14 rounded-none bg-accent-600 text-white flex items-center justify-center text-xl font-bold animate-pulse">
        MQ
      </div>
    </div>
  )
}
