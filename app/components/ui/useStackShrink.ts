'use client'

import { useEffect, type RefObject } from 'react'

/*
 * For a list of sticky, stacking cards: as the next card slides over a pinned one, the pinned card
 * scales down slightly and dims, like the reference. Each list item's first child is the card that
 * moves. Updated at most once per frame; off for reduced motion.
 */
export default function useStackShrink(list: RefObject<HTMLElement | null>, deps: unknown[], top = 72, amount = 0.08) {
  useEffect(() => {
    const el = list.current
    if (!el || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    let raf = 0

    const update = () => {
      raf = 0
      const items = Array.from(el.children) as HTMLElement[]
      items.forEach((item, i) => {
        const card = item.firstElementChild as HTMLElement | null
        if (!card) return
        const next = items[i + 1]
        let p = 0
        if (next) {
          const h = item.offsetHeight || 1
          p = Math.min(1, Math.max(0, 1 - (next.getBoundingClientRect().top - top) / h))
        }
        card.style.transformOrigin = 'center top'
        card.style.transform = p ? `scale(${(1 - amount * p).toFixed(4)})` : ''
        card.style.filter = p ? `brightness(${(1 - 0.12 * p).toFixed(3)})` : ''
      })
    }
    const schedule = () => {
      if (!raf) raf = requestAnimationFrame(update)
    }

    update()
    window.addEventListener('scroll', schedule, { passive: true })
    window.addEventListener('resize', schedule)
    return () => {
      window.removeEventListener('scroll', schedule)
      window.removeEventListener('resize', schedule)
      cancelAnimationFrame(raf)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [list, top, amount, ...deps])
}
