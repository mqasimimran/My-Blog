'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import AdminNav from '@/app/admin/AdminNav'
import RecentActivity from '@/app/admin/RecentActivity'
import { money } from '@/lib/invoice'
import { siteConfig } from '@/site.config'

type Data = {
  needs: Record<'newLeads' | 'followUps' | 'unread' | 'ordersToVerify' | 'commentsPending' | 'feedbackOpen' | 'proposalsWaiting' | 'overdueInvoices', number>
  month: { income: { USD: number; PKR: number }; unpaid: { USD: number; PKR: number; count: number }; subscribers: number; newSubscribers: number }
}
const NEEDS: { key: keyof Data['needs']; label: string; href: string }[] = [
  { key: 'newLeads', label: 'New leads', href: '/admin/leads' },
  { key: 'followUps', label: 'Follow-ups due', href: '/admin/leads' },
  { key: 'unread', label: 'Unread messages', href: '/admin/messages' },
  { key: 'ordersToVerify', label: 'Orders to verify', href: '/admin/orders' },
  { key: 'commentsPending', label: 'Comments to approve', href: '/admin/comments' },
  { key: 'feedbackOpen', label: 'Client feedback to answer', href: '/admin/feedback' },
  { key: 'proposalsWaiting', label: 'Proposals awaiting reply', href: '/admin/proposals' },
  { key: 'overdueInvoices', label: 'Overdue invoices', href: '/admin/invoices' },
]
const both = (v: { USD: number; PKR: number }) => [v.USD ? money(v.USD, 'USD') : '', v.PKR ? money(v.PKR, 'PKR') : ''].filter(Boolean).join(' + ') || '$0.00'

// Admin home: what needs you right now, this month at a glance, and recent activity.
export default function AdminOverview() {
  const [d, setD] = useState<Data | null>(null)
  const [error, setError] = useState('')
  useEffect(() => { fetch('/api/admin/overview').then(async (r) => (r.status === 401 ? window.location.replace('/admin/login') : r.ok ? setD(await r.json()) : setError('Could not load the overview.'))).catch(() => setError('Could not load the overview.')) }, [])
  const waiting = d ? NEEDS.filter((n) => d.needs[n.key] > 0).length : 0
  const hour = new Date().getHours()
  return (
    <div className="flex min-h-screen">
      <AdminNav />
      <main className="flex-1 px-6 py-10 md:px-12">
        <h1 className="text-4xl text-ink-900">Good {hour < 12 ? 'morning' : hour < 18 ? 'afternoon' : 'evening'}, {siteConfig.firstName}</h1>
        <p className="mt-2 text-sm text-ink-500">{error ? '' : !d ? 'Loading...' : waiting ? `${waiting} thing${waiting > 1 ? 's' : ''} need${waiting > 1 ? '' : 's'} your attention.` : 'You\u2019re all caught up.'}</p>
        {error && <p role="alert" className="mt-4 text-sm text-error">{error}</p>}
        {d && (
          <>
            <h2 className="mt-10 text-xs font-medium uppercase tracking-[0.08em] text-ink-900">Needs you</h2>
            <div className="mt-3 grid gap-px border border-ink-100 bg-ink-100 sm:grid-cols-2 xl:grid-cols-4">
              {NEEDS.map((n) => { const v = d.needs[n.key]; return (
                <Link key={n.key} href={n.href} className={`group p-5 transition-colors ${v ? 'bg-paper-raised hover:bg-ink-50' : 'bg-paper hover:bg-paper-raised'}`}>
                  <p className={`font-display text-4xl leading-none ${v ? (n.key === 'overdueInvoices' ? 'text-error' : 'text-accent-600') : 'text-ink-300'}`}>{v}</p>
                  <p className={`mt-2 text-sm ${v ? 'text-ink-900' : 'text-ink-500'}`}>{n.label} <span aria-hidden className="opacity-0 transition-opacity group-hover:opacity-100">&rarr;</span></p>
                </Link>) })}
            </div>
            <h2 className="mt-10 text-xs font-medium uppercase tracking-[0.08em] text-ink-900">This month</h2>
            <div className="mt-3 grid gap-px border border-ink-100 bg-ink-100 sm:grid-cols-3">
              <Link href="/admin/income" className="bg-paper-raised p-5 hover:bg-ink-50"><p className="text-[11px] uppercase tracking-[0.08em] text-ink-500">Income</p><p className="mt-2 font-mono text-xl text-ink-900">{both(d.month.income)}</p></Link>
              <Link href="/admin/invoices" className="bg-paper-raised p-5 hover:bg-ink-50"><p className="text-[11px] uppercase tracking-[0.08em] text-ink-500">Unpaid invoices</p><p className="mt-2 font-mono text-xl text-ink-900">{d.month.unpaid.count ? both(d.month.unpaid) : '0'}</p><p className="mt-1 text-xs text-ink-500">{d.month.unpaid.count} unpaid</p></Link>
              <Link href="/admin/newsletter" className="bg-paper-raised p-5 hover:bg-ink-50"><p className="text-[11px] uppercase tracking-[0.08em] text-ink-500">Subscribers</p><p className="mt-2 font-mono text-xl text-ink-900">{d.month.subscribers}</p><p className="mt-1 text-xs text-ink-500">+{d.month.newSubscribers} this month</p></Link>
            </div>
            <div className="mt-6 flex flex-wrap gap-3 text-xs font-medium uppercase tracking-[0.08em]">
              <Link href="/admin/new" className="bg-ink-900 px-4 py-2.5 text-paper hover:bg-accent-600">+ New post</Link>
              <Link href="/admin/invoices" className="border border-ink-900 px-4 py-2.5 text-ink-900">+ Invoice</Link>
              <Link href="/admin/proposals" className="border border-ink-900 px-4 py-2.5 text-ink-900">+ Proposal</Link>
              <Link href="/admin/newsletter/send" className="border border-ink-900 px-4 py-2.5 text-ink-900">Write a newsletter</Link>
            </div>
          </>
        )}
        <div className="mt-12"><RecentActivity /></div>
      </main>
    </div>
  )
}
