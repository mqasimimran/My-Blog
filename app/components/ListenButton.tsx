'use client'

import { useEffect, useRef, useState } from 'react'
import { Pause, Play, SpeakerHigh, Stop } from '@phosphor-icons/react'
import { useLocale } from '@/app/components/LocaleProvider'

// "Listen to this post" with the browser's built-in voices: free, no server. Reads the post body
// (#post-body) sentence by sentence (some browsers cut long text off). For Urdu posts it only appears
// on devices that have an Urdu voice.
export default function ListenButton() {
  const { tx } = useLocale()
  const [ok, setOk] = useState(false)
  const [state, setState] = useState<'idle' | 'playing' | 'paused'>('idle')
  const [rate, setRate] = useState(1)
  const queue = useRef<string[]>([])
  const lang = useRef('en')

  useEffect(() => {
    if (!('speechSynthesis' in window)) return
    const body = document.getElementById('post-body')
    lang.current = body?.getAttribute('lang') === 'ur' ? 'ur' : 'en'
    const check = () => setOk(lang.current === 'en' || speechSynthesis.getVoices().some((v) => v.lang.toLowerCase().startsWith('ur')))
    check(); speechSynthesis.addEventListener('voiceschanged', check)
    return () => { speechSynthesis.removeEventListener('voiceschanged', check); speechSynthesis.cancel() }
  }, [])
  if (!ok) return null

  const speakNext = () => {
    const sentence = queue.current.shift()
    if (!sentence) { setState('idle'); return }
    const u = new SpeechSynthesisUtterance(sentence)
    u.lang = lang.current === 'ur' ? 'ur-PK' : 'en-US'; u.rate = rate
    const voice = speechSynthesis.getVoices().find((v) => v.lang.toLowerCase().startsWith(lang.current))
    if (voice) u.voice = voice
    u.onend = speakNext
    speechSynthesis.speak(u)
  }
  const play = () => {
    if (state === 'paused') { speechSynthesis.resume(); setState('playing'); return }
    const text = document.getElementById('post-body')?.innerText || ''
    queue.current = text.replace(/\s+/g, ' ').match(/[^.!?\u06d4\u061f]+[.!?\u06d4\u061f]*/g)?.map((t) => t.trim()).filter(Boolean) || []
    speechSynthesis.cancel(); setState('playing'); speakNext()
  }
  const pause = () => { speechSynthesis.pause(); setState('paused') }
  const stop = () => { queue.current = []; speechSynthesis.cancel(); setState('idle') }

  return (
    <div className="mt-6 flex flex-wrap items-center gap-3" aria-label={tx('Listen to this post')} role="group">
      {state === 'playing' ? (
        <button type="button" onClick={pause} className="inline-flex h-10 items-center gap-2 border border-ink-900 px-4 text-sm font-medium text-ink-900 hover:bg-ink-900 hover:text-paper"><Pause size={16} weight="fill" aria-hidden /> {tx('Pause')}</button>
      ) : (
        <button type="button" onClick={play} className="inline-flex h-10 items-center gap-2 bg-ink-900 px-4 text-sm font-medium text-paper hover:bg-accent-600 hover:text-on-accent">
          {state === 'paused' ? <Play size={16} weight="fill" aria-hidden /> : <SpeakerHigh size={16} weight="fill" aria-hidden />} {state === 'paused' ? tx('Resume') : tx('Listen to this post')}
        </button>
      )}
      {state !== 'idle' && <button type="button" onClick={stop} aria-label={tx('Stop')} className="grid h-10 w-10 place-items-center border border-ink-100 text-ink-700 hover:border-ink-900"><Stop size={16} weight="fill" aria-hidden /></button>}
      <label className="flex items-center gap-2 text-sm text-ink-500">
        <span className="sr-only">{tx('Speed')}</span>
        <select value={rate} onChange={(e) => setRate(Number(e.target.value))} className="h-10 border border-ink-100 bg-transparent px-2 text-sm text-ink-700">
          {[0.75, 1, 1.25, 1.5].map((r) => <option key={r} value={r}>{r}×</option>)}
        </select>
      </label>
    </div>
  )
}
