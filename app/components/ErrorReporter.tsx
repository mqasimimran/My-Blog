'use client'

import { useEffect } from 'react'

// Sends errors that happen in visitors' browsers to /api/report-error (each message once per page view).
export default function ErrorReporter() {
  useEffect(() => {
    const seen = new Set<string>()
    const send = (message: string, stack?: string) => {
      if (!message || seen.has(message) || seen.size > 10) return
      seen.add(message)
      navigator.sendBeacon?.('/api/report-error', new Blob([JSON.stringify({ message: message.slice(0, 500), stack: (stack || '').slice(0, 2000), url: location.href })], { type: 'application/json' }))
    }
    const onError = (e: ErrorEvent) => send(e.message, e.error?.stack)
    const onRejection = (e: PromiseRejectionEvent) => send(e.reason instanceof Error ? e.reason.message : String(e.reason), e.reason?.stack)
    window.addEventListener('error', onError); window.addEventListener('unhandledrejection', onRejection)
    return () => { window.removeEventListener('error', onError); window.removeEventListener('unhandledrejection', onRejection) }
  }, [])
  return null
}
