'use client'

import { useState, useEffect } from 'react'

const ROLES = ['Software Engineer', 'Graphic Designer', 'Game Developer', 'AI Builder']

function articleFor(word: string): 'a' | 'an' {
  return /^[aeiou]/i.test(word) ? 'an' : 'a'
}

export default function RoleCycler() {
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
  }, [reducedMotion])

  const role = ROLES[index]

  // Plain inline spans on purpose — NOT inline-flex. A flex box is treated
  // as one atomic unit when the browser decides where to wrap a line, so
  // "I'm" + [flex box with "a Graphic Designer"] would always force the
  // whole flex box to the next line even when "I'm a" would fit together.
  // Plain inline elements reflow normally, word by word, like regular text.
  return (
    <>
      {articleFor(role)}{' '}
      <span
        className="text-[#aa002a] transition-opacity duration-250 ease-out"
        style={{ opacity: reducedMotion ? 1 : fadeIn ? 1 : 0 }}
      >
        {role}
      </span>
    </>
  )
}
