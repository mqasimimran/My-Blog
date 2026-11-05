'use client'

import { useSyncExternalStore } from 'react'
import { Moon, Sun } from '@phosphor-icons/react'

function subscribe(notify: () => void) {
  const observer = new MutationObserver(notify)
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] })
  return () => observer.disconnect()
}

export default function DarkModeToggle() {
  const isDark = useSyncExternalStore(subscribe, () => document.documentElement.classList.contains('dark'), () => false)

  const toggle = () => {
    const next = !isDark
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
