'use client'

import { useState, useEffect } from 'react'

import { siteConfig } from '@/site.config'
import { useLocale } from '@/app/components/LocaleProvider'

function articleFor(word: string): 'a' | 'an' {
  return /^[aeiou]/i.test(word) ? 'an' : 'a'
}

export default function RoleCycler() {
  const { locale } = useLocale()
  const ur = locale === 'ur' && siteConfig.urdu.roles.length > 0
  const ROLES = ur ? siteConfig.urdu.roles : siteConfig.hero.roles
  const [index, setIndex] = useState(0)
  const [fadeIn, setFadeIn] = useState(true)
  const [reducedMotion, setReducedMotion] = useState(false)

  useEffect(() => {
    setReducedMotion(window.matchMedia('(prefers-reduced-motion: reduce)').matches)
  }, [])

  useEffect(() => {
    if (reducedMotion) return
    const interval = setInterval(() => {
      setFadeIn(false)
      setTimeout(() => {
        setIndex((i) => (i + 1) % ROLES.length)
        setFadeIn(true)
      }, 250)
    }, 2200)
    return () => clearInterval(interval)
  }, [reducedMotion, ROLES.length])

  const role = ROLES[index % ROLES.length]

  // Every role is stacked in the same grid cell, with only the current one visible. The box is
  // therefore always exactly as big as the LONGEST role at the current screen width: one line when
  // it fits, two when it doesn't. Switching roles never moves the page, and there is no guessed
  // blank space reserved under short roles. Hidden roles are hidden from screen readers too.
  return (
    <>
      {ur ? '\u0627\u06cc\u06a9' : articleFor(role)}{' '}
      <span className="inline-grid text-accent-600">
        {ROLES.map((r) => (
          <span
            key={r}
            aria-hidden={r !== role}
            className="[grid-area:1/1] transition-opacity duration-300 ease-[var(--ease-smooth)]"
            style={{ opacity: r !== role ? 0 : reducedMotion || fadeIn ? 1 : 0 }}
          >
            {r}
          </span>
        ))}
      </span>
    </>
  )
}
