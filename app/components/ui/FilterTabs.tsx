'use client'

import { useLocale } from '@/app/components/LocaleProvider'

/** Underlined text tabs used to filter lists. Scrolls sideways on small screens instead of wrapping. */
export default function FilterTabs<T extends string>({
  options,
  value,
  onChange,
  label,
}: {
  options: { key: T; label: string }[]
  value: T
  onChange: (key: T) => void
  label: string
}) {
  const { tx } = useLocale()
  return (
    <div role="group" aria-label={tx(label)} className="-mx-5 flex gap-7 overflow-x-auto px-5 sm:mx-0 sm:px-0">
      {options.map((o) => {
        const active = o.key === value
        return (
          <button
            key={o.key}
            onClick={() => onChange(o.key)}
            aria-pressed={active}
            className={`shrink-0 border-b-2 pb-2 text-sm font-medium tracking-tight transition-colors duration-300 ${
              active ? 'border-accent-600 text-ink-900' : 'border-transparent text-ink-500 hover:text-ink-900'
            }`}
          >
            {tx(o.label)}
          </button>
        )
      })}
    </div>
  )
}
