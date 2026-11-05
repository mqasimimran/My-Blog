'use client'

import { useMediaQuery } from '@/lib/useMediaQuery'
import { useEffect, useRef, useState } from 'react'

export default function CustomCursor() {
  const dotRef = useRef<HTMLDivElement>(null)
  const [isHovering, setIsHovering] = useState(false)
  const [isVisible, setIsVisible] = useState(false)
  const disabled = useMediaQuery('(pointer: coarse), (prefers-reduced-motion: reduce)')

  useEffect(() => {
    if (disabled) return
    function handleMouseMove(e: MouseEvent) {
      setIsVisible(true)
      if (dotRef.current) {
        dotRef.current.style.transform = `translate(${e.clientX}px, ${e.clientY}px)`
      }
      const target = e.target as HTMLElement
      setIsHovering(!!target.closest('a, button, [role="button"], input, textarea, select'))
    }

    function handleMouseLeave() {
      setIsVisible(false)
    }

    window.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseleave', handleMouseLeave)
    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseleave', handleMouseLeave)
    }
  }, [disabled])

  if (disabled) return null

  return (
    <div
      ref={dotRef}
      aria-hidden="true"
      className="hidden md:block fixed top-0 left-0 pointer-events-none z-[200] rounded-full bg-accent-600 mix-blend-difference transition-[width,height,opacity] duration-200 ease-out"
      style={{
        width: isHovering ? 32 : 10,
        height: isHovering ? 32 : 10,
        marginLeft: isHovering ? -16 : -5,
        marginTop: isHovering ? -16 : -5,
        opacity: isVisible ? 1 : 0,
      }}
    />
  )
}
