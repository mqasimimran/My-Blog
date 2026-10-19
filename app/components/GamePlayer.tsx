'use client'

import { useRef, useState } from 'react'
import { ArrowsOut, Play } from '@phosphor-icons/react'

/*
 * A playable WebGL build (e.g. a Unity export hosted on itch.io or in /public/games) shown on its
 * project page. Nothing loads until the visitor clicks Play: builds are large, so the page stays fast
 * for everyone who doesn't play.
 */
export default function GamePlayer({ src, title, poster }: { src: string; title: string; poster?: string | null }) {
  const [playing, setPlaying] = useState(false)
  const frame = useRef<HTMLIFrameElement>(null)

  return (
    <div>
      <div className="relative aspect-video w-full overflow-hidden border border-ink-100 bg-ink-900">
        {playing ? (
          <iframe
            ref={frame}
            src={src}
            title={`${title}, playable build`}
            allow="fullscreen; autoplay; gamepad; accelerometer; gyroscope"
            allowFullScreen
            className="absolute inset-0 h-full w-full"
          />
        ) : (
          <button type="button" onClick={() => { setPlaying(true); window.dispatchEvent(new Event('blur')) }} data-cursor="Play" className="group absolute inset-0 grid place-items-center text-paper">
            {poster && <img src={poster} alt="" aria-hidden className="absolute inset-0 h-full w-full object-cover opacity-40 transition-opacity duration-500 group-hover:opacity-30" />}
            <span className="relative flex flex-col items-center gap-4">
              <span className="grid h-20 w-20 place-items-center rounded-full bg-paper text-ink-900 transition-transform duration-500 ease-[var(--ease-smooth)] group-hover:scale-110">
                <Play size={30} weight="fill" aria-hidden />
              </span>
              <span className="font-display text-2xl uppercase tracking-wide text-white">Play in your browser</span>
              <span className="text-sm text-white/70">Loads the game. It can take a moment.</span>
            </span>
          </button>
        )}
      </div>
      {playing && (
        <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
          <p className="type-meta">Click the game to control it. Best on a computer with a keyboard.</p>
          <button type="button" onClick={() => frame.current?.requestFullscreen?.()} className="inline-flex items-center gap-2 text-sm font-medium text-ink-900 hover:text-accent-600">
            <ArrowsOut size={16} aria-hidden /> Full screen
          </button>
        </div>
      )}
    </div>
  )
}
