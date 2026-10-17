'use client'

import { useEffect, useRef } from 'react'

/*
 * A soft blur lens that follows the cursor over whatever it wraps (the hero headline), blurring
 * the letters it passes over. Mouse/trackpad only, and off for reduced motion.
 */
export default function BlurLens({ children }: { children: React.ReactNode }) {
  const wrap = useRef<HTMLDivElement>(null)
  const lens = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const w = wrap.current
    const l = lens.current
    if (!w || !l) return
    if (!window.matchMedia('(pointer: fine)').matches || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    let x = 0, y = 0, cx = 0, cy = 0, raf = 0, inside = false

    const tick = () => {
      cx += (x - cx) * 0.18
      cy += (y - cy) * 0.18
      l.style.transform = `translate3d(${cx}px, ${cy}px, 0)`
      raf = Math.abs(x - cx) + Math.abs(y - cy) > 0.3 ? requestAnimationFrame(tick) : 0
    }
    const move = (e: PointerEvent) => {
      const r = w.getBoundingClientRect()
      x = e.clientX - r.left
      y = e.clientY - r.top
      if (!inside) {
        inside = true
        cx = x
        cy = y
        l.setAttribute('data-show', '')
      }
      if (!raf) raf = requestAnimationFrame(tick)
    }
    const leave = () => {
      inside = false
      l.removeAttribute('data-show')
    }
    w.addEventListener('pointermove', move)
    w.addEventListener('pointerleave', leave)
    return () => {
      w.removeEventListener('pointermove', move)
      w.removeEventListener('pointerleave', leave)
      cancelAnimationFrame(raf)
    }
  }, [])

  return (
    <div ref={wrap} className="blur-lens-wrap">
      {children}
      <div ref={lens} aria-hidden className="blur-lens" />
    </div>
  )
}
