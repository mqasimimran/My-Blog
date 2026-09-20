'use client'

import { useEffect, useRef, useCallback } from 'react'
import { useSession, signOut } from 'next-auth/react'

const IDLE_LIMIT_MS = 30 * 60 * 1000 // 30 minutes
const WARNING_BEFORE_MS = 60 * 1000 // warn 60 seconds before logging out

const ACTIVITY_EVENTS = ['mousemove', 'mousedown', 'keydown', 'scroll', 'touchstart', 'click'] as const

export default function IdleLogout() {
  const { status } = useSession()
  const idleTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const warningTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const handleLogout = useCallback(() => {
    signOut({ callbackUrl: '/admin/login?reason=idle' })
  }, [])

  const resetTimers = useCallback(() => {
    if (idleTimer.current) clearTimeout(idleTimer.current)
    if (warningTimer.current) clearTimeout(warningTimer.current)

    warningTimer.current = setTimeout(() => {
      // A quiet console note only — this deliberately doesn't interrupt
      // whatever you're doing (e.g. mid-typing in a form) with a popup.
      console.warn('You will be logged out due to inactivity in 60 seconds.')
    }, IDLE_LIMIT_MS - WARNING_BEFORE_MS)

    idleTimer.current = setTimeout(handleLogout, IDLE_LIMIT_MS)
  }, [handleLogout])

  useEffect(() => {
    if (status !== 'authenticated') return

    resetTimers()

    ACTIVITY_EVENTS.forEach((event) => window.addEventListener(event, resetTimers))

    return () => {
      ACTIVITY_EVENTS.forEach((event) => window.removeEventListener(event, resetTimers))
      if (idleTimer.current) clearTimeout(idleTimer.current)
      if (warningTimer.current) clearTimeout(warningTimer.current)
    }
  }, [status, resetTimers])

  return null
}
