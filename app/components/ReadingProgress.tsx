'use client'

import { usePathname } from 'next/navigation'

// A thin bar that fills as you scroll. Only on blog posts, and pure CSS (see .reading-progress
// in globals.css). It used to run on every page and set React state on every scroll event.
export default function ReadingProgress() {
  const pathname = usePathname()
  if (!pathname.startsWith('/blog/')) return null
  return <div aria-hidden className="reading-progress z-progress" />
}
