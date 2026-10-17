import Link from 'next/link'
import { ArrowRight, ArrowUpRight } from '@phosphor-icons/react/dist/ssr'

type Props = {
  href: string
  children: React.ReactNode
  /** primary = solid; secondary = outlined; text = underlined link */
  variant?: 'primary' | 'secondary' | 'text'
  /** opens in a new tab and shows the up-right arrow */
  external?: boolean
  className?: string
}

const base =
  'inline-flex items-center justify-center gap-2 text-sm font-medium tracking-tight whitespace-nowrap ' +
  'transition-[background-color,color,transform,border-color] duration-300 ease-[var(--ease-smooth)] ' +
  'active:translate-y-px active:scale-[0.99]'

const variants = {
  primary: 'h-12 px-6 bg-ink-900 text-paper hover:bg-accent-600 hover:text-on-accent',
  secondary: 'h-12 px-6 border border-ink-900 text-ink-900 hover:bg-ink-900 hover:text-paper',
  text: 'link-draw text-ink-900 pb-0.5',
}

/** One button style for the whole site. Labels stay short enough to never wrap. */
export function ButtonLink({ href, children, variant = 'primary', external = false, className = '' }: Props) {
  const cls = `${base} ${variants[variant]} ${className}`
  const Icon = external ? ArrowUpRight : ArrowRight
  const content = (
    <>
      {children}
      <Icon size={16} weight="bold" aria-hidden className="shrink-0 transition-transform duration-300 ease-[var(--ease-smooth)] group-hover:translate-x-0.5" />
    </>
  )
  return external ? (
    <a href={href} target="_blank" rel="noopener noreferrer" className={`group ${cls}`}>{content}</a>
  ) : (
    <Link href={href} className={`group ${cls}`}>{content}</Link>
  )
}
