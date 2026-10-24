import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { getInvoiceByToken, getPaymentLines } from '@/lib/invoiceServer'
import { formatDate, invoiceTotals, money } from '@/lib/invoice'
import { siteConfig } from '@/site.config'

export const metadata: Metadata = { title: 'Invoice', robots: { index: false, follow: false } }
export const dynamic = 'force-dynamic'

// A client's invoice, by the private link in their email.
export default async function InvoicePage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params
  const inv = await getInvoiceByToken(token)
  if (!inv) notFound()
  const t = invoiceTotals(inv)
  const payments = inv.status === 'paid' ? [] : await getPaymentLines(inv.currency)

  return (
    <main className="container-page pb-24 pt-12 md:pt-20" dir="ltr" lang="en">
      <div className="mx-auto max-w-3xl border border-ink-100 bg-paper-raised p-6 md:p-12">
        <div className="flex flex-wrap items-start justify-between gap-6">
          <div>
            <p className="font-display text-3xl uppercase leading-none text-ink-900">{siteConfig.name}</p>
            <p className="mt-2 text-sm text-ink-500">{siteConfig.jobTitle} \u00b7 {siteConfig.email}</p>
          </div>
          <div className="text-right">
            <p className="font-display text-3xl uppercase leading-none text-accent-600">Invoice</p>
            <p className="mt-2 font-mono text-sm text-ink-900">{inv.number}</p>
            <p className="text-sm text-ink-500">Issued {formatDate(inv.issue_date)}</p>
            {inv.due_date && <p className="text-sm font-medium text-ink-900">Due {formatDate(inv.due_date)}</p>}
          </div>
        </div>

        <div className="mt-10">
          <p className="type-meta">Bill to</p>
          <p className="mt-2 font-medium text-ink-900">{inv.client_name}</p>
          {inv.client_email && <p className="text-sm text-ink-500">{inv.client_email}</p>}
          {inv.client_address && <p className="whitespace-pre-line text-sm text-ink-500">{inv.client_address}</p>}
        </div>

        <div className="mt-10 overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="border-b border-ink-900 text-left"><th className="py-2 font-medium">Description</th><th className="py-2 text-right font-medium">Qty</th><th className="py-2 text-right font-medium">Unit price</th><th className="py-2 text-right font-medium">Amount</th></tr></thead>
            <tbody>
              {inv.items.map((it, i) => (
                <tr key={i} className="border-b border-ink-100">
                  <td className="py-3 pr-4 text-ink-900">{it.description}</td>
                  <td className="py-3 text-right font-mono tabular-nums">{Number(it.quantity)}</td>
                  <td className="py-3 text-right font-mono tabular-nums">{money(Number(it.unit_price), inv.currency)}</td>
                  <td className="py-3 text-right font-mono tabular-nums">{money(Number(it.quantity) * Number(it.unit_price), inv.currency)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="ml-auto mt-6 max-w-xs space-y-2 text-sm">
          <div className="flex justify-between text-ink-500"><span>Subtotal</span><span className="font-mono tabular-nums">{money(t.subtotal, inv.currency)}</span></div>
          {t.discount > 0 && <div className="flex justify-between text-ink-500"><span>Discount</span><span className="font-mono tabular-nums">-{money(t.discount, inv.currency)}</span></div>}
          {t.tax > 0 && <div className="flex justify-between text-ink-500"><span>Tax ({Number(inv.tax_percent)}%)</span><span className="font-mono tabular-nums">{money(t.tax, inv.currency)}</span></div>}
          <div className="flex justify-between border-t border-ink-900 pt-2 text-base font-medium text-ink-900"><span>Total due</span><span className="font-mono tabular-nums">{money(t.total, inv.currency)}</span></div>
          {inv.status === 'paid' && <p className="pt-2 text-right font-medium text-success">Paid{inv.paid_at ? ` ${formatDate(inv.paid_at.slice(0, 10))}` : ''}. Thank you!</p>}
        </div>

        {payments.length > 0 && (
          <div className="mt-12 border-t border-ink-100 pt-8">
            <p className="type-meta">How to pay</p>
            <p className="mt-2 text-sm text-ink-500">Please include <span className="font-mono text-ink-900">{inv.number}</span> as the payment reference.</p>
            <div className="mt-5 grid gap-5 sm:grid-cols-2">
              {payments.map((p) => (
                <div key={p.method}>
                  <p className="text-sm font-medium text-ink-900">{p.method}</p>
                  {p.lines.map((l) => <p key={l} className="font-mono text-sm text-ink-700">{l}</p>)}
                </div>
              ))}
            </div>
          </div>
        )}
        {inv.notes && <div className="mt-10 border-t border-ink-100 pt-8"><p className="type-meta">Notes</p><p className="mt-2 whitespace-pre-line text-sm text-ink-700">{inv.notes}</p></div>}

        <a href={`/api/invoice/${inv.public_token}/pdf`} className="mt-12 inline-flex h-11 items-center bg-ink-900 px-6 text-sm font-medium text-paper hover:bg-accent-600 hover:text-on-accent">Download PDF</a>
      </div>
    </main>
  )
}
