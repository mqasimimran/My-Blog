'use client'

import { useState, useEffect } from 'react'
import { Moon, Sun } from '@phosphor-icons/react'

export default function DarkModeToggle() {
  const [isDark, setIsDark] = useState(false)

  useEffect(() => {
    setIsDark(document.documentElement.classList.contains('dark'))
  }, [])

  const toggle = () => {
    const next = !isDark
    setIsDark(next)
    document.documentElement.classList.toggle('dark', next)
    localStorage.setItem('theme', next ? 'dark' : 'light')
  }

  return (
    <button
      onClick={toggle}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      className="grid h-10 w-10 place-items-center text-ink-700 transition-colors duration-200 hover:text-accent-600"
    >
      {isDark ? <Sun size={20} weight="regular" aria-hidden /> : <Moon size={20} weight="regular" aria-hidden />}
    </button>
  )
}
