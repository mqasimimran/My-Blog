'use client'

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'

/*
 * Animation for the whole site, from one place (it lives in layout.tsx).
 *
 * Headings, paragraphs, cards, list items, images and forms inside the page ease up into
 * place. Rules:
 *  - Anything already on screen when the page first paints is left alone, so nothing that is
 *    visible ever blinks. (The hero has its own CSS entrance instead.)
 *  - Anything below the fold waits, then animates in as it scrolls into view, staggered
 *    with its siblings.
 *  - Content that appears later (data loading in, a new page, a filter change) animates in.
 *  - Nothing is hidden until JavaScript runs, so the site works without it.
 *  - Turned off completely for visitors who ask for reduced motion.
 * Only opacity and transform are animated (cheap for the browser).
 */
const TARGETS = 'h1, h2, h3, h4, p, li, article, figure, form, blockquote, img, video, table, pre, [data-animate]'
const SKIP = '[data-no-animate], nav, header[role="banner"], [role="dialog"], .animate-pulse, .animate-marquee, .hero-enter, .hero-photo'

export default function ScrollAnimator() {
  const pathname = usePathname()

  useEffect(() => {
    const root = document.getElementById('main')
    if (!root || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    // Only our own data-* markers are ever written. React ignores attributes it doesn't render,
    // so this can't clash with React finishing a page that loads a moment later (Suspense).
    const enter = (el: Element) => {
      el.setAttribute('data-rv', 'in')
      if (el.hasAttribute('data-rv-split')) {
        // Letter-by-letter headline: wait for the last letter, then tidy up.
        const n = el.querySelectorAll('.ch').length
        window.setTimeout(() => el.removeAttribute('data-rv'), n * 22 + 900)
        return
      }
      const done = (e: Event) => {
        if (e.target !== el) return // ignore animations of things inside it
        el.removeAttribute('data-rv')
        el.removeEventListener('animationend', done)
      }
      el.addEventListener('animationend', done)
    }

    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            enter(e.target)
            io.unobserve(e.target)
          }
        }
      },
      { threshold: 0.08, rootMargin: '0px 0px -6% 0px' }
    )

    // React tags every element it has finished setting up. Parts of a page can finish later (inside
    // Suspense), so untagged elements are left alone until a later check, or React would see the
    // markers as a mismatch.
    const isReady = (el: Element) => Object.keys(el).some((k) => k.startsWith('__reactFiber$'))

    // Pick the outermost matching elements only, so a card animates as one piece.
    const collect = (scope: Element) => {
      const found: Element[] = []
      const candidates = scope.matches?.(TARGETS) ? [scope, ...scope.querySelectorAll(TARGETS)] : [...scope.querySelectorAll(TARGETS)]
      for (const el of candidates) {
        if (el.hasAttribute('data-rv-t') || el.closest(SKIP) || !isReady(el)) continue
        if (el.parentElement?.closest('[data-rv-t]')) continue
        if (getComputedStyle(el).position === 'fixed') continue
        el.setAttribute('data-rv-t', '')
        if (el.matches('h1, h2')) el.setAttribute(el.querySelector('.ch') ? 'data-rv-split' : 'data-rv-h', '') // headlines reveal
        let i = 0
        for (let s = el.previousElementSibling; s; s = s.previousElementSibling) if (s.hasAttribute('data-rv-t')) i++
        el.setAttribute('data-rv-i', String(Math.min(i, 8)))
        found.push(el)
      }
      return found
    }

    const place = (els: Element[], isNew: boolean) => {
      for (const el of els) {
        const r = el.getBoundingClientRect()
        const onScreen = r.top < window.innerHeight * 0.94 && r.bottom > 0
        if (onScreen) {
          // Just appeared: ease it in. Headlines also reveal on first load, like the reference.
          if (isNew || el.hasAttribute('data-rv-split')) enter(el)
        } else {
          el.setAttribute('data-rv', 'hidden') // below the fold: wait for it
          io.observe(el)
        }
      }
    }

    // Anything already waiting (e.g. from a previous run of this effect) gets watched again.
    root.querySelectorAll('[data-rv="hidden"]').forEach((el) => io.observe(el))
    place(collect(root), false)
    // Pick up parts of the page that finish loading a little later.
    const timers = [300, 900, 2000].map((ms) => window.setTimeout(() => place(collect(root), false), ms))

    let queued: Element[] = []
    let frame = 0
    const mo = new MutationObserver((records) => {
      for (const r of records) r.addedNodes.forEach((n) => n.nodeType === 1 && queued.push(n as Element))
      if (!frame)
        frame = requestAnimationFrame(() => {
          frame = 0
          const batch = queued
          queued = []
          const els = batch.flatMap((n) => (n.isConnected ? collect(n) : []))
          place(els, true)
        })
    })
    mo.observe(root, { childList: true, subtree: true })

    return () => {
      io.disconnect()
      mo.disconnect()
      cancelAnimationFrame(frame)
      timers.forEach((t) => window.clearTimeout(t))
      // Never leave anything stranded invisible: release whatever was still waiting, so the next
      // run (React runs effects twice in development, and again on navigation) picks it up fresh.
      root.querySelectorAll('[data-rv="hidden"]').forEach((el) => {
        el.removeAttribute('data-rv')
        el.removeAttribute('data-rv-t')
      })
    }
  }, [pathname])

  return null
}
