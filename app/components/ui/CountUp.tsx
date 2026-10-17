'use client'

import { useEffect, useRef, useState } from 'react'

/*
 * Rolls a number up from 0 when it scrolls into view. Keeps whatever is around the number:
 * "95%", "120+", "10Y", "$1,999". Renders the final value first (so it is correct with no
 * JavaScript and for search engines). Shows the final value straight away for reduced motion.
 */
export default function CountUp({ value, duration = 1600 }: { value: string; duration?: number }) {
  const [shown, setShown] = useState(value)
  const ref = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    const m = value.match(/^(\D*)(\d[\d,]*\.?\d*)(.*)$/)
    const el = ref.current
    if (!m || !el || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const [, pre, num, post] = m
    const target = parseFloat(num.replace(/,/g, ''))
    const decimals = (num.split('.')[1] || '').length
    const fmt = (n: number) => pre + n.toLocaleString('en-US', { minimumFractionDigits: decimals, maximumFractionDigits: decimals }) + post

    let raf = 0
    setShown(fmt(0))
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return
        io.disconnect()
        const t0 = performance.now()
        const step = (t: number) => {
          const p = Math.min(1, (t - t0) / duration)
          setShown(fmt(target * (1 - Math.pow(1 - p, 3))))
          if (p < 1) raf = requestAnimationFrame(step)
        }
        raf = requestAnimationFrame(step)
      },
      { threshold: 0.4 }
    )
    io.observe(el)
    return () => {
      io.disconnect()
      cancelAnimationFrame(raf)
    }
  }, [value, duration])

  return <span ref={ref} className="tabular-nums">{shown}</span>
}
