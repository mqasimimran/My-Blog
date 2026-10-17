'use client'

import { useEffect } from 'react'

// template.tsx re-mounts on every navigation (layout.tsx does not), which makes it the right
// place to reset scroll to the top of each new page.
//
// It used to also fade every page in from opacity 0 using JavaScript, which meant the WHOLE
// page was invisible until the browser had finished hydrating (slow first paint, and blank
// for anyone without JavaScript). Pages now render visible immediately; the scroll-in
// animation lives on individual sections (see Reveal.tsx).
export default function Template({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])
  return <>{children}</>
}
