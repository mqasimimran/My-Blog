'use client'

import { useEffect, useRef } from 'react'

/*
 * One line of text sized to fill its container exactly. It is measured once the font has loaded
 * and again whenever the container resizes, so any text fits on any screen. Before that it uses a
 * deliberately small estimate, so it can never spill over the edge.
 */
export default function FitText({ text, className = '', max = 176 }: { text: string; className?: string; max?: number }) {
  const box = useRef<HTMLDivElement>(null)
  const line = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    const b = box.current
    const t = line.current
    if (!b || !t) return
    const fit = () => {
      t.style.fontSize = '100px'
      const width = t.scrollWidth
      if (!width) return
      t.style.fontSize = `${Math.min(max, (b.clientWidth / width) * 100 * 0.995)}px`
    }
    fit()
    document.fonts?.ready.then(fit)
    const ro = new ResizeObserver(fit)
    ro.observe(b)
    return () => ro.disconnect()
  }, [text, max])

  return (
    <div ref={box} className="w-full overflow-hidden">
      <span
        ref={line}
        className={`inline-block whitespace-nowrap ${className}`}
        style={{ fontSize: `min(${max}px, calc((min(100vw, 1360px) - 6rem) / ${(text.length * 0.62).toFixed(2)}))` }}
      >
        {text}
      </span>
    </div>
  )
}
