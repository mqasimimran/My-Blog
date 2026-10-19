'use client'

import { useEffect, useState } from 'react'

// template.tsx re-mounts on every navigation (layout.tsx does not), so it is where each new page
// resets its scroll and plays the page wipe: a solid panel that sweeps up off the screen to reveal
// the page you just clicked through to. It does not play on the first visit, so the first screen
// appears instantly. Content is never hidden waiting for JavaScript.
let firstLoad = true

export default function Template({ children }: { children: React.ReactNode }) {
  const [wipe] = useState(() => !firstLoad)

  useEffect(() => {
    firstLoad = false
    window.scrollTo(0, 0)
  }, [])

  return (
    <>
      {wipe && <div aria-hidden className="page-wipe" />}
      {children}
    </>
  )
}
