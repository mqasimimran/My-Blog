'use client'

import { useEffect } from 'react'

// Shown if the whole site fails to render (very rare). The error is reported to you.
export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    navigator.sendBeacon?.('/api/report-error', new Blob([JSON.stringify({ message: error.message || 'Site failed to render', stack: `${error.digest || ''}\n${error.stack || ''}`, url: location.href })], { type: 'application/json' }))
  }, [error])
  return (
    <html lang="en"><body style={{ fontFamily: 'system-ui, sans-serif', background: '#efeeea', color: '#111110', display: 'grid', placeItems: 'center', minHeight: '100vh', margin: 0 }}>
      <div style={{ maxWidth: 420, padding: 24, textAlign: 'center' }}>
        <h1 style={{ fontSize: 28, margin: 0 }}>Something went wrong</h1>
        <p style={{ color: '#5f5e59' }}>Sorry about that. It has been reported automatically.</p>
        <button onClick={() => reset()} style={{ marginTop: 12, padding: '12px 20px', background: '#111110', color: '#efeeea', border: 0, cursor: 'pointer' }}>Try again</button>
      </div>
    </body></html>
  )
}
