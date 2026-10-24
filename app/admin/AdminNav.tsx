'use client'

import { useState } from 'react'
import { useSession, signOut } from 'next-auth/react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const NAV_ITEMS = [
  { href: '/admin', label: 'Blogs / Articles' },
  { href: '/admin/projects', label: 'Projects' },
  { href: '/admin/designs', label: 'Design Gallery' },
  { href: '/admin/services', label: 'Services' },
  { href: '/admin/shop', label: 'Shop' },
  { href: '/admin/orders', label: 'Orders' },
  { href: '/admin/discounts', label: 'Discount Codes' },
  { href: '/admin/leads', label: 'Leads' },
  { href: '/admin/proposals', label: 'Proposals' },
  { href: '/admin/invoices', label: 'Invoices' },
  { href: '/admin/income', label: 'Income' },
  { href: '/admin/time', label: 'Time Tracking' },
  { href: '/admin/client-projects', label: 'Client Projects' },
  { href: '/admin/feedback', label: 'Design Feedback' },
  { href: '/admin/courses', label: 'Courses' },
  { href: '/admin/comments', label: 'Blog Comments' },
  { href: '/admin/journey', label: 'My Journey' },
  { href: '/admin/testimonials', label: 'Testimonials' },
  { href: '/admin/logos', label: 'Client Logos' },
  { href: '/admin/roadmap', label: 'Roadmap' },
  { href: '/admin/newsletter', label: 'Newsletter' },
  { href: '/admin/messages', label: 'Messages' },
  { href: '/admin/security', label: 'Security' },
  { href: '/admin/searches', label: 'Site Searches' },
  { href: '/admin/setup', label: 'Setup' },
  { href: '/admin/settings', label: 'Site Settings' },
]

// Resume Manager is visually separated with a border-top, same as before
const RESUME_ITEM = { href: '/admin/resume', label: 'Resume Manager' }

export default function AdminNav() {
  const pathname = usePathname()
  const { data: session } = useSession()
  const [mobileOpen, setMobileOpen] = useState(false)

  const isActive = (href: string) => {
    if (href === '/admin') return pathname === '/admin'
    return pathname.startsWith(href)
  }

  const linkClass = (href: string) =>
    `relative flex items-center border-b border-ink-100 px-5 py-3 text-[11.5px] font-medium uppercase tracking-[0.08em] transition-colors duration-200 ${
      isActive(href) ? 'bg-ink-50 text-ink-900 before:absolute before:inset-y-0 before:left-0 before:w-0.5 before:bg-accent-600' : 'text-ink-500 hover:bg-ink-50 hover:text-ink-900'
    }`

  const items = (onClick?: () => void) => (
    <>
      {NAV_ITEMS.map((item) => (
        <Link key={item.href} href={item.href} onClick={onClick} aria-current={isActive(item.href) ? 'page' : undefined} className={linkClass(item.href)}>
          {item.label}
        </Link>
      ))}
      <Link href={RESUME_ITEM.href} onClick={onClick} aria-current={isActive(RESUME_ITEM.href) ? 'page' : undefined} className={`${linkClass(RESUME_ITEM.href)} mt-4 border-t`}>
        {RESUME_ITEM.label}
      </Link>
      <button
        onClick={() => signOut({ callbackUrl: '/admin/login' })}
        className="flex items-center border-b border-ink-100 px-5 py-3 text-left text-[11.5px] font-medium uppercase tracking-[0.08em] text-ink-500 transition-colors duration-200 hover:bg-ink-50 hover:text-error"
      >
        Log out
      </button>
    </>
  )

  return (
    <>
      {/* Desktop sidebar: boxed rows, stays in view while the page scrolls */}
      <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col overflow-y-auto border-r border-ink-100 bg-paper text-ink-900 md:flex">
        <div className="border-b border-ink-100 px-5 py-6">
          <p className="font-display text-4xl uppercase leading-none text-ink-900">Admin</p>
          {session?.user?.name && <p className="type-meta mt-3">Signed in as {session.user.name}</p>}
        </div>
        <nav aria-label="Admin" className="flex flex-col pb-8">{items()}</nav>
        <Link href="/" className="mt-auto flex items-center justify-center bg-ink-900 px-5 py-4 text-[11.5px] font-medium uppercase tracking-[0.08em] text-paper transition-colors duration-300 hover:bg-accent-600 hover:text-on-accent">
          View site
        </Link>
      </aside>

      {/* Mobile top bar + dropdown */}
      <div className="sticky top-0 z-30 border-b border-ink-100 bg-paper text-ink-900 md:hidden">
        <div className="flex h-12 items-stretch justify-between">
          <p className="flex items-center px-5 font-display text-xl uppercase leading-none">Admin</p>
          <button
            onClick={() => setMobileOpen((v) => !v)}
            aria-expanded={mobileOpen}
            className="border-l border-ink-100 px-5 text-[11.5px] font-medium uppercase tracking-[0.08em] text-ink-700 hover:bg-ink-50"
            aria-label="Toggle admin menu"
          >
            {mobileOpen ? 'Close' : 'Menu'}
          </button>
        </div>
        {mobileOpen && (
          <nav aria-label="Admin" className="flex flex-col border-t border-ink-100">
            {items(() => setMobileOpen(false))}
          </nav>
        )}
      </div>
    </>
  )
}
