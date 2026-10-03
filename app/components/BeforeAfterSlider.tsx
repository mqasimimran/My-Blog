'use client'

import { useState, useRef, useEffect } from 'react'

export default function BeforeAfterSlider({ beforeSrc, afterSrc, alt }: { beforeSrc: string; afterSrc: string; alt: string }) {
  const [position, setPosition] = useState(50)
  const [containerWidth, setContainerWidth] = useState(0)
  const containerRef = useRef<HTMLDivElement>(null)
  const isDragging = useRef(false)

  useEffect(() => {
    function measure() {
      if (containerRef.current) setContainerWidth(containerRef.current.offsetWidth)
    }
    measure()
    window.addEventListener('resize', measure)
    return () => window.removeEventListener('resize', measure)
  }, [])

  function updatePosition(clientX: number) {
    if (!containerRef.current) return
    const rect = containerRef.current.getBoundingClientRect()
    const percent = ((clientX - rect.left) / rect.width) * 100
    setPosition(Math.min(100, Math.max(0, percent)))
  }

  return (
    <div
      ref={containerRef}
      className="relative w-full aspect-[4/3] rounded-none overflow-hidden select-none cursor-ew-resize bg-ink-100"
      onMouseDown={(e) => { isDragging.current = true; updatePosition(e.clientX) }}
      onMouseMove={(e) => { if (isDragging.current) updatePosition(e.clientX) }}
      onMouseUp={() => { isDragging.current = false }}
      onMouseLeave={() => { isDragging.current = false }}
      onTouchStart={(e) => updatePosition(e.touches[0].clientX)}
      onTouchMove={(e) => updatePosition(e.touches[0].clientX)}
    >
      {/* After (full, underneath) */}
      <img src={afterSrc} alt={`${alt} — after`} className="absolute inset-0 w-full h-full object-contain pointer-events-none" draggable={false} />

      {/* Before (clipped to slider position, on top) — the image itself is
          pinned to the container's full width so it stays aligned with the
          "after" image beneath as the clip width changes */}
      <div className="absolute inset-y-0 left-0 overflow-hidden pointer-events-none" style={{ width: `${position}%` }}>
        <img
          src={beforeSrc}
          alt={`${alt} — before`}
          className="absolute inset-y-0 left-0 h-full object-contain"
          style={{ width: containerWidth || '100vw', maxWidth: 'none' }}
          draggable={false}
        />
      </div>

      {/* Handle */}
      <div className="absolute top-0 bottom-0 w-0.5 bg-paper shadow-lg pointer-events-none" style={{ left: `${position}%` }}>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-paper shadow-lg flex items-center justify-center text-ink-500 text-xs">
          ↔
        </div>
      </div>

      <span className="absolute top-3 left-3 text-[9px] font-bold uppercase tracking-widest bg-gray-900/70 text-white px-2 py-1 rounded-none pointer-events-none">Before</span>
      <span className="absolute top-3 right-3 text-[9px] font-bold uppercase tracking-widest bg-gray-900/70 text-white px-2 py-1 rounded-none pointer-events-none">After</span>
    </div>
  )
}
