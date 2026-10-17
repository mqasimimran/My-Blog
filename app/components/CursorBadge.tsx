'use client'

import { useEffect, useRef, useState } from 'react'

/*
 * A circle that follows the cursor and says what clicking will do ("View", "Read", "Open").
 * Add data-cursor="View" to any link or button to use it. Mouse/trackpad only (no touch).
 * Position is written straight to the element each frame, so moving the mouse never re-renders.
 */
export default function CursorBadge() {
  const ref = useRef<HTMLDivElement>(null)
  const [label, setLabel] = useState('')

  useEffect(() => {
    if (!window.matchMedia('(pointer: fine)').matches) return
    const el = ref.current
    if (!el) return
    const ease = window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 1 : 0.2
    let x = -200, y = -200, cx = x, cy = y, raf = 0, current = ''

    const update = (target: Element | null) => {
      const next = target?.closest?.('[data-cursor]')?.getAttribute('data-cursor') || ''
      if (next !== current) {
        current = next
        setLabel(next)
      }
    }
    const tick = () => {
      cx += (x - cx) * ease
      cy += (y - cy) * ease
      el.style.transform = `translate3d(${cx}px, ${cy}px, 0)`
      raf = Math.abs(x - cx) + Math.abs(y - cy) > 0.3 ? requestAnimationFrame(tick) : 0
    }
    const onMove = (e: PointerEvent) => {
      x = e.clientX
      y = e.clientY
      update(e.target as Element)
      if (!raf) raf = requestAnimationFrame(tick)
    }
    // Scrolling moves cards under a still mouse, so check again what is under it.
    const onScroll = () => update(document.elementFromPoint(x, y))
    const onLeave = () => update(null)

    window.addEventListener('pointermove', onMove, { passive: true })
    window.addEventListener('scroll', onScroll, { passive: true })
    document.addEventListener('pointerleave', onLeave)
    return () => {
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('scroll', onScroll)
      document.removeEventListener('pointerleave', onLeave)
      cancelAnimationFrame(raf)
    }
  }, [])

  return (
    <div ref={ref} aria-hidden className="cursor-badge z-cursor" data-show={label ? '' : undefined}>
      <span>{label}</span>
    </div>
  )
}
