// Star rating display (or input when onChange is given). Partial stars use a gradient.
export default function Stars({ value, size = 18, onChange, label }: { value: number; size?: number; onChange?: (n: number) => void; label?: string }) {
  return (
    <span className="inline-flex gap-0.5" role={onChange ? 'radiogroup' : 'img'} aria-label={label || `${value} out of 5 stars`}>
      {[1, 2, 3, 4, 5].map((n) => {
        const fill = Math.max(0, Math.min(1, value - n + 1)), id = `s${n}-${size}-${Math.round(value * 10)}`
        const star = (
          <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden><defs><linearGradient id={id}><stop offset={`${fill * 100}%`} stopColor="var(--color-accent-600)" /><stop offset={`${fill * 100}%`} stopColor="var(--color-ink-100)" /></linearGradient></defs>
            <path d="M12 2.5l2.9 6 6.6.8-4.9 4.6 1.3 6.6L12 17.3l-5.9 3.2 1.3-6.6L2.5 9.3l6.6-.8z" fill={`url(#${id})`} /></svg>)
        return onChange ? <button key={n} type="button" role="radio" aria-checked={Math.round(value) === n} aria-label={`${n} star${n > 1 ? 's' : ''}`} onClick={() => onChange(n)} className="p-0.5">{star}</button> : <span key={n}>{star}</span>
      })}
    </span>
  )
}
