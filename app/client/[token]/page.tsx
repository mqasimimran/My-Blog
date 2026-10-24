import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { CheckCircle, Circle, DownloadSimple, WarningCircle } from '@phosphor-icons/react/dist/ssr'
import { supabaseAdmin } from '@/lib/supabaseAdmin'
import { formatDate, invoiceTotals, money, type Invoice } from '@/lib/invoice'
import { siteConfig } from '@/site.config'

export const metadata: Metadata = { title: 'Your project', robots: { index: false, follow: false } }
export const dynamic = 'force-dynamic'
const STATUS: Record<string, string> = { planning: 'Planning', in_progress: 'In progress', review: 'In review', done: 'Done' }

// A client's private project page (by the link you send them): progress, what's needed from them,
// milestones, updates, files, and their invoices (matched by email, exactly: _ and % are escaped so
// they can't act as wildcards and show someone else's invoices).
export default async function ClientProjectPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params
  if (!/^[a-f0-9]{16,64}$/.test(token)) notFound()
  const { data: p } = await supabaseAdmin.from('client_projects').select('*').eq('public_token', token).maybeSingle()
  if (!p) notFound()
  const invoices = p.client_email
    ? (((await supabaseAdmin.from('invoices').select('*').ilike('client_email', String(p.client_email).replace(/[\\%_]/g, (c) => `\\${c}`)).in('status', ['sent', 'paid']).order('issue_date', { ascending: false })).data || []) as Invoice[])
    : []
  const milestones = (p.milestones || []) as { title: string; due: string; done: boolean }[]
  return (
    <main className="container-page pb-24 pt-12 md:pt-20" dir="ltr" lang="en">
      <div className="mx-auto max-w-3xl">
        <p className="type-meta">{siteConfig.name} · Project for {p.client_name}</p>
        <h1 className="mt-3 text-4xl font-medium tracking-tight text-ink-900">{p.title}</h1>
        <div className="mt-6 flex items-center gap-4">
          <span className={`px-3 py-1 text-xs font-medium uppercase tracking-[0.08em] ${p.status === 'done' ? 'bg-success text-white' : 'bg-ink-900 text-paper'}`}>{STATUS[p.status]}</span>
          <div className="h-2 flex-1 bg-ink-100" role="progressbar" aria-valuenow={p.progress} aria-valuemin={0} aria-valuemax={100} aria-label="Project progress"><div className="h-full bg-accent-600" style={{ width: `${p.progress}%` }} /></div>
          <span className="font-mono text-sm text-ink-900">{p.progress}%</span>
        </div>
        {p.summary && <p className="mt-6 whitespace-pre-line text-lg leading-relaxed text-ink-700">{p.summary}</p>}
        {p.needs_from_client && (
          <div className="mt-8 flex gap-3 border-s-2 border-warning bg-paper-raised p-5"><WarningCircle size={22} weight="fill" aria-hidden className="shrink-0 text-warning" />
            <div><p className="font-medium text-ink-900">What I need from you</p><p className="mt-1 whitespace-pre-line text-ink-700">{p.needs_from_client}</p></div></div>
        )}
        {milestones.length > 0 && (
          <section className="mt-12"><h2 className="type-meta">Milestones</h2>
            <ul className="mt-4 divide-y divide-ink-100 border-y border-ink-100">{milestones.map((m, i) => (
              <li key={i} className="flex items-center gap-3 py-3">{m.done ? <CheckCircle size={22} weight="fill" aria-label="Done" className="shrink-0 text-success" /> : <Circle size={22} aria-label="Not done yet" className="shrink-0 text-ink-300" />}
                <span className={`flex-1 ${m.done ? 'text-ink-500 line-through' : 'text-ink-900'}`}>{m.title}</span>{m.due && <span className="text-sm text-ink-500">{formatDate(m.due)}</span>}</li>))}</ul>
          </section>
        )}
        {(p.updates || []).length > 0 && (
          <section className="mt-12"><h2 className="type-meta">Updates</h2>
            <ol className="mt-4 space-y-5 border-s border-ink-100 ps-5">{(p.updates as { date: string; text: string }[]).map((u, i) => <li key={i}><p className="text-xs text-ink-500">{formatDate(u.date)}</p><p className="mt-1 whitespace-pre-line text-ink-900">{u.text}</p></li>)}</ol>
          </section>
        )}
        {(p.files || []).length > 0 && (
          <section className="mt-12"><h2 className="type-meta">Files</h2>
            <ul className="mt-4 space-y-2">{(p.files as { label: string; url: string }[]).map((f, i) => <li key={i}><a href={f.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 border border-ink-100 px-4 py-2.5 text-sm text-ink-900 hover:border-ink-900"><DownloadSimple size={16} aria-hidden /> {f.label || 'File'}</a></li>)}</ul>
          </section>
        )}
        {invoices.length > 0 && (
          <section className="mt-12"><h2 className="type-meta">Invoices</h2>
            <ul className="mt-4 divide-y divide-ink-100 border-y border-ink-100">{invoices.map((inv) => (
              <li key={inv.id} className="flex items-center justify-between gap-4 py-3 text-sm"><a href={`/invoice/${inv.public_token}`} className="font-mono text-ink-900 underline underline-offset-4">{inv.number}</a>
                <span className="font-mono">{money(invoiceTotals(inv).total, inv.currency)}</span><span className={inv.status === 'paid' ? 'text-success' : 'text-warning'}>{inv.status === 'paid' ? 'Paid' : inv.due_date ? `Due ${formatDate(inv.due_date)}` : 'Unpaid'}</span></li>))}</ul>
          </section>
        )}
        <p className="mt-16 text-sm text-ink-500">Questions? Reply to my email or write to <a href={`mailto:${siteConfig.email}`} className="underline">{siteConfig.email}</a>.</p>
      </div>
    </main>
  )
}
