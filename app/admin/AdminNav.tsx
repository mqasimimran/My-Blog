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
  { href: '/admin/journey', label: 'My Journey' },
  { href: '/admin/testimonials', label: 'Testimonials' },
  { href: '/admin/logos', label: 'Client Logos' },
  { href: '/admin/roadmap', label: 'Roadmap' },
  { href: '/admin/newsletter', label: 'Newsletter' },
  { href: '/admin/messages', label: 'Messages' },
  { href: '/admin/security', label: 'Security' },
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
    `${isActive(href) ? 'text-accent-600' : 'text-ink-500 hover:text-ink-900'} transition-colors`

  return (
    <>
      {/* Desktop sidebar — now flips with the site's light/dark toggle instead of staying permanently dark */}
      <aside className="w-64 bg-paper text-ink-900 border-r border-ink-100 p-6 flex-col hidden md:flex min-h-screen">
        <h2 className="text-xl font-light tracking-wide uppercase mb-10">Admin</h2>
        <nav className="flex flex-col gap-4 text-xs font-bold tracking-widest uppercase">
          {NAV_ITEMS.map((item) => (
            <Link key={item.href} href={item.href} className={linkClass(item.href)}>
              {item.label}
            </Link>
          ))}
          <Link href={RESUME_ITEM.href} className={`${linkClass(RESUME_ITEM.href)} pt-2 border-t border-ink-100`}>
            {RESUME_ITEM.label}
          </Link>
          <button
            onClick={() => signOut({ callbackUrl: '/admin/login' })}
            className="w-full text-left text-ink-500 hover:text-red-400 transition-colors pt-4 mt-2 border-t border-ink-100"
          >
            ← Log Out
          </button>
        </nav>
      </aside>

      {/* Mobile top bar + dropdown */}
      <div className="md:hidden bg-paper text-ink-900 border-b border-ink-100 sticky top-0 z-30">
        <div className="flex items-center justify-between px-5 py-4">
          <h2 className="text-lg font-light tracking-wide uppercase">Admin</h2>
          <button
            onClick={() => setMobileOpen((v) => !v)}
            className="text-xs font-bold tracking-widest uppercase text-ink-500 border border-ink-100 rounded-none px-3 py-2"
            aria-label="Toggle admin menu"
          >
            {mobileOpen ? 'Close ✕' : 'Menu ☰'}
          </button>
        </div>
        {mobileOpen && (
          <nav className="flex flex-col px-5 pb-5 gap-3 text-xs font-bold tracking-widest uppercase border-t border-ink-100 pt-4">
            {NAV_ITEMS.map((item) => (
              <Link key={item.href} href={item.href} onClick={() => setMobileOpen(false)} className={linkClass(item.href)}>
                {item.label}
              </Link>
            ))}
            <Link href={RESUME_ITEM.href} onClick={() => setMobileOpen(false)} className={`${linkClass(RESUME_ITEM.href)} pt-3 border-t border-ink-100`}>
              {RESUME_ITEM.label}
            </Link>
            <button
              onClick={() => signOut({ callbackUrl: '/admin/login' })}
              className="text-left text-ink-500 hover:text-red-400 transition-colors pt-3 border-t border-ink-100"
            >
              ← Log Out
            </button>
          </nav>
        )}
      </div>
    </>
  )
}
