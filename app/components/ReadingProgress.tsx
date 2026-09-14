'use client'

import { useState, useEffect } from 'react'

export default function ReadingProgress() {
  const [completion, setCompletion] = useState(0)

  useEffect(() => {
    const updateScrollCompletion = () => {
      const currentProgress = window.scrollY
      const scrollHeight = document.documentElement.scrollHeight - window.innerHeight
      
      if (scrollHeight) {
        setCompletion(Number((currentProgress / scrollHeight).toFixed(4)) * 100)
      }
    }

    window.addEventListener('scroll', updateScrollCompletion)
    return () => window.removeEventListener('scroll', updateScrollCompletion)
  }, [])

  return (
    <div className="fixed top-0 left-0 w-full h-[3px] bg-transparent z-[9999] pointer-events-none">
    <div 
  className="h-full bg-[#aa002a] transition-all duration-150 ease-out shadow-sm"
  style={{ width: `${completion}%` }}
/>
    </div>
  )
}