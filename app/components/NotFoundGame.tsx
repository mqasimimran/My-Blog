'use client'

import { useEffect, useRef, useState } from 'react'
import { useLocale } from '@/app/components/LocaleProvider'

// A tiny endless runner for the 404 page: jump over the blocks. Space / up arrow / click / tap.
// Drawn in the site's own colours; starts only when the visitor chooses to play; best score is kept.
export default function NotFoundGame() {
  const { tx } = useLocale()
  const canvas = useRef<HTMLCanvasElement>(null)
  const [state, setState] = useState<'idle' | 'playing' | 'over'>('idle')
  const [score, setScore] = useState(0)
  const [best, setBest] = useState(0)
  const game = useRef({ y: 0, vy: 0, obstacles: [] as { x: number; w: number; h: number }[], speed: 6, t: 0, score: 0, raf: 0 })

  useEffect(() => { try { setBest(Number(localStorage.getItem('nf-best') || 0)) } catch {} }, [])

  const jump = () => {
    if (state !== 'playing') { start(); return }
    const g = game.current
    if (g.y === 0) g.vy = 12.5
  }

  function start() {
    const g = game.current
    Object.assign(g, { y: 0, vy: 0, obstacles: [], speed: 6, t: 0, score: 0 })
    setScore(0); setState('playing')
  }

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.code === 'Space' || e.code === 'ArrowUp') { e.preventDefault(); jump() } }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  })

  useEffect(() => {
    const c = canvas.current
    if (!c) return
    const ctx = c.getContext('2d')!
    const css = getComputedStyle(document.documentElement)
    const ink = css.getPropertyValue('--color-ink-900').trim() || '#111110'
    const line = css.getPropertyValue('--color-ink-300').trim() || '#bbb'
    const accent = css.getPropertyValue('--color-accent-600').trim() || '#b0233f'
    const dpr = window.devicePixelRatio || 1
    const W = c.clientWidth, H = 180
    c.width = W * dpr; c.height = H * dpr; ctx.scale(dpr, dpr)
    const ground = H - 28, P = 26
    const draw = () => {
      const g = game.current
      ctx.clearRect(0, 0, W, H)
      ctx.fillStyle = line; ctx.fillRect(0, ground, W, 2)
      ctx.fillStyle = accent; ctx.fillRect(48, ground - P - g.y, P, P)
      ctx.fillStyle = ink; for (const o of g.obstacles) ctx.fillRect(o.x, ground - o.h, o.w, o.h)
    }
    if (state !== 'playing') { draw(); return }
    const tick = () => {
      const g = game.current
      g.t++; g.vy -= 0.75; g.y = Math.max(0, g.y + g.vy); if (g.y === 0) g.vy = 0
      g.speed = 6 + g.t / 400
      for (const o of g.obstacles) o.x -= g.speed
      g.obstacles = g.obstacles.filter((o) => o.x + o.w > 0)
      const last = g.obstacles[g.obstacles.length - 1]
      if (!last || last.x < W - (240 + Math.random() * 260)) g.obstacles.push({ x: W + 10, w: 16 + Math.random() * 18, h: 24 + Math.random() * 30 })
      g.score = Math.floor(g.t / 6)
      const hit = g.obstacles.some((o) => 48 < o.x + o.w && 48 + P > o.x && g.y < o.h)
      draw()
      if (g.t % 6 === 0) setScore(g.score)
      if (hit) {
        setScore(g.score); setState('over')
        setBest((b) => { const nb = Math.max(b, g.score); try { localStorage.setItem('nf-best', String(nb)) } catch {} return nb })
        return
      }
      g.raf = requestAnimationFrame(tick)
    }
    game.current.raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(game.current.raf)
  }, [state])

  return (
    <div className="mt-14 max-w-3xl">
      <div className="flex items-baseline justify-between text-sm text-ink-500">
        <span>{tx('While you’re here')}</span>
        <span className="font-mono tabular-nums">{tx('Score')} {score} · {tx('Best')} {best}</span>
      </div>
      <div className="relative mt-3 border border-ink-100 bg-paper-raised">
        <canvas ref={canvas} onPointerDown={jump} role="img" aria-label={tx('A small jumping game')} className="block h-[180px] w-full cursor-pointer touch-manipulation" />
        {state !== 'playing' && (
          <button type="button" onClick={start} className="absolute inset-0 grid place-items-center text-sm font-medium text-ink-900">
            <span className="bg-paper-raised px-4 py-2">{state === 'over' ? tx('Game over. Play again') : tx('Press space or tap to play')}</span>
          </button>
        )}
      </div>
    </div>
  )
}
