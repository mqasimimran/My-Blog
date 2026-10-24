import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { CheckCircle } from '@phosphor-icons/react/dist/ssr'
import { supabaseAdmin } from '@/lib/supabaseAdmin'
import { getProposalByToken } from '@/lib/invoiceServer'
import { formatDate, invoiceTotals, money } from '@/lib/invoice'
import { siteConfig } from '@/site.config'
import AcceptForm from './AcceptForm'

export const metadata: Metadata = { title: 'Proposal', robots: { index: false, follow: false } }
export const dynamic = 'force-dynamic'

// A client's proposal, by the private link in their email: read it, then accept (sign) or decline.
export default async function ProposalPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params
  const p = await getProposalByToken(token)
  if (!p) notFound()
  const t = invoiceTotals(p)
  const expired = p.status === 'sent' && !!p.valid_until && p.valid_until < new Date().toISOString().slice(0, 10)
  let invoiceToken: string | null = null
  if (p.invoice_id) invoiceToken = (await supabaseAdmin.from('invoices').select('public_token').eq('id', p.invoice_id).maybeSingle()).data?.public_token || null

  return (
    <main className="container-page pb-24 pt-12 md:pt-20" dir="ltr" lang="en">
      <article className="mx-auto max-w-3xl border border-ink-100 bg-paper-raised p-6 md:p-12">
        <div className="flex flex-wrap items-start justify-between gap-6">
          <div><p className="font-display text-3xl uppercase leading-none text-ink-900">{siteConfig.name}</p><p className="mt-2 text-sm text-ink-500">{siteConfig.email}</p></div>
          <div className="text-right"><p className="font-display text-3xl uppercase leading-none text-accent-600">Proposal</p><p className="mt-2 font-mono text-sm text-ink-900">{p.number}</p>{p.valid_until && <p className="text-sm text-ink-500">Valid until {formatDate(p.valid_until)}</p>}</div>
        </div>
        <p className="mt-10 type-meta">Prepared for</p><p className="mt-1 font-medium text-ink-900">{p.client_name}</p>
        <h1 className="mt-8 text-3xl font-medium tracking-tight text-ink-900">{p.title}</h1>
        {p.summary && <p className="mt-4 whitespace-pre-line text-lg leading-relaxed text-ink-700">{p.summary}</p>}
        {p.scope && <section className="mt-10"><h2 className="type-meta">What&rsquo;s included</h2><ul className="mt-3 list-disc space-y-1.5 ps-5 text-ink-900">{p.scope.split('\n').map((s) => s.trim().replace(/^[-*\u2022]\s*/, '')).filter(Boolean).map((s) => <li key={s}>{s}</li>)}</ul></section>}
        {p.timeline && <section className="mt-10"><h2 className="type-meta">Timeline</h2><p className="mt-3 whitespace-pre-line text-ink-900">{p.timeline}</p></section>}
        <section className="mt-10">
          <h2 className="type-meta">Investment</h2>
          <table className="mt-3 w-full text-sm"><tbody>
            {p.items.map((it, i) => <tr key={i} className="border-b border-ink-100"><td className="py-3 pr-4 text-ink-900">{it.description}</td><td className="py-3 text-right font-mono tabular-nums text-ink-500">{Number(it.quantity)} &times; {money(Number(it.unit_price), p.currency)}</td><td className="py-3 text-right font-mono tabular-nums">{money(Number(it.quantity) * Number(it.unit_price), p.currency)}</td></tr>)}
          </tbody></table>
          <div className="ml-auto mt-4 max-w-xs space-y-1.5 text-sm">
            {(t.discount > 0 || t.tax > 0) && <div className="flex justify-between text-ink-500"><span>Subtotal</span><span className="font-mono">{money(t.subtotal, p.currency)}</span></div>}
            {t.discount > 0 && <div className="flex justify-between text-ink-500"><span>Discount</span><span className="font-mono">-{money(t.discount, p.currency)}</span></div>}
            {t.tax > 0 && <div className="flex justify-between text-ink-500"><span>Tax ({Number(p.tax_percent)}%)</span><span className="font-mono">{money(t.tax, p.currency)}</span></div>}
            <div className="flex justify-between border-t border-ink-900 pt-2 text-base font-medium text-ink-900"><span>Total</span><span className="font-mono">{money(t.total, p.currency)}</span></div>
          </div>
        </section>
        {p.terms && <section className="mt-10"><h2 className="type-meta">Terms</h2><p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-ink-700">{p.terms}</p></section>}
        <section className="mt-12 border-t border-ink-900 pt-8" aria-label="Acceptance">
          {p.status === 'accepted' ? (
            <div className="flex items-start gap-3">
              <CheckCircle size={28} weight="fill" aria-hidden className="shrink-0 text-success" />
              <div>
                <p className="font-medium text-ink-900">Accepted and signed by <span className="font-serif italic">{p.signed_name}</span></p>
                <p className="mt-1 text-sm text-ink-500">{p.accepted_at && new Date(p.accepted_at).toUTCString()}</p>
                <div className="mt-4 flex flex-wrap gap-3">
                  <a href={`/api/proposal/${p.public_token}/pdf`} className="inline-flex h-11 items-center border border-ink-900 px-5 text-sm font-medium text-ink-900 hover:bg-ink-900 hover:text-paper">Download signed PDF</a>
                  {invoiceToken && <a href={`/invoice/${invoiceToken}`} className="inline-flex h-11 items-center bg-ink-900 px-5 text-sm font-medium text-paper hover:bg-accent-600">View invoice</a>}
                </div>
              </div>
            </div>
          ) : p.status === 'declined' ? (
            <p className="text-ink-700">This proposal was declined. If anything changes, just get in touch.</p>
          ) : expired ? (
            <p className="text-ink-700">This proposal has expired. Please ask {siteConfig.firstName} for an updated one.</p>
          ) : (
            <AcceptForm token={p.public_token} clientName={p.client_name} />
          )}
        </section>
      </article>
    </main>
  )
}
