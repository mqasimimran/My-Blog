import { NextResponse } from 'next/server'
import { getInvoiceByToken, getPaymentLines } from '@/lib/invoiceServer'
import { renderInvoicePdf } from '@/lib/invoicePdf'

// The client's copy, by the private link in their email. Cancelled invoices aren't shown.
export async function GET(_req: Request, { params }: { params: Promise<{ token: string }> }) {
  const inv = await getInvoiceByToken((await params).token)
  if (!inv) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  const bytes = await renderInvoicePdf(inv, await getPaymentLines(inv.currency))
  return new NextResponse(Buffer.from(bytes), { headers: { 'Content-Type': 'application/pdf', 'Content-Disposition': `inline; filename="${inv.number}.pdf"`, 'Cache-Control': 'no-store' } })
}
