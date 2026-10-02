'use client'

import { useEffect, useState } from 'react'

// template.tsx re-mounts on every navigation (unlike layout.tsx, which
// persists) — that's exactly the hook needed for a per-page transition
// effect without touching every individual page.
//
// Important: this only animates opacity, never transform. A `transform` on
// this wrapper — even `translateY(0)` — turns every `position: fixed`
// element inside it (modals, the design lightbox, the command palette, the
// splash screen) into something positioned relative to THIS DIV instead of
// the actual browser viewport, since a transformed ancestor becomes the new
// containing block for fixed descendants. That's a CSS fact, not a bug that
// can be selectively worked around — so no transform-based slide effect
// here, ever.
export default function Template({ children }: { children: React.ReactNode }) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    // Force scroll-to-top on every navigation. Wrapping every page in this
    // animated div interferes with Next's normal built-in scroll-restore
    // behavior, so without this, navigating to a new page while scrolled
    // down on the previous one leaves you scrolled down on the new page too.
    window.scrollTo(0, 0)

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setVisible(true)
      return
    }
    const timer = requestAnimationFrame(() => setVisible(true))
    return () => cancelAnimationFrame(timer)
  }, [])

  return (
    <div
      style={{
        opacity: visible ? 1 : 0,
        transition: 'opacity 0.35s ease-out',
      }}
    >
      {children}
    </div>
  )
}
