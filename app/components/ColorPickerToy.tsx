'use client'

import { useState } from 'react'

const PALETTES = [
  { name: 'Maroon (current)', color: '#aa002a' },
  { name: 'Forest', color: '#1a5c3a' },
  { name: 'Navy', color: '#1e3a6d' },
  { name: 'Amber', color: '#b8730a' },
]

export default function ColorPickerToy() {
  const [isOpen, setIsOpen] = useState(false)
  const [selected, setSelected] = useState(PALETTES[0].color)

  return (
    <div className="fixed bottom-6 right-6 z-40 hidden md:block">
      {isOpen && (
        <div className="mb-3 bg-paper rounded-none shadow-xl border border-ink-100 p-5 w-64">
          <p className="text-[10px] font-bold uppercase tracking-widest text-ink-300 mb-1">Just a toy</p>
          <p className="text-xs text-ink-500 mb-4">Preview an alternate accent color — this doesn't change the real site, just this little card.</p>

          <div className="flex gap-2 mb-4">
            {PALETTES.map((p) => (
              <button
                key={p.color}
                onClick={() => setSelected(p.color)}
                aria-label={p.name}
                className={`w-7 h-7 rounded-full border-2 transition-transform ${selected === p.color ? 'scale-110 border-ink-900' : 'border-transparent'}`}
                style={{ backgroundColor: p.color }}
              />
            ))}
          </div>

          <div className="space-y-3 border-t border-ink-100 pt-4">
            <button
              className="w-full text-white text-xs font-bold uppercase tracking-widest py-2.5 rounded-none transition-colors"
              style={{ backgroundColor: selected }}
            >
              Sample Button
            </button>
            <div className="flex items-center gap-2 text-xs">
              <span className="font-bold uppercase tracking-widest px-2 py-1 rounded-full text-white" style={{ backgroundColor: selected }}>
                Badge
              </span>
              <a href="#" onClick={(e) => e.preventDefault()} className="underline" style={{ color: selected }}>
                A sample link
              </a>
            </div>
          </div>
        </div>
      )}

      <button
        onClick={() => setIsOpen((v) => !v)}
        className="w-12 h-12 rounded-full shadow-lg flex items-center justify-center text-white text-lg bg-gray-900 hover:scale-105 transition-transform"
        aria-label="Toggle color preview toy"
      >
        🎨
      </button>
    </div>
  )
}
