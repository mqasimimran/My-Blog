import { NextResponse } from 'next/server'
import { requireAdminSession } from '@/lib/requireAdminSession'
import { getInvoiceById, getPaymentLines } from '@/lib/invoiceServer'
import { renderInvoicePdf } from '@/lib/invoicePdf'

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const denied = await requireAdminSession()
  if (denied) return denied
  const inv = await getInvoiceById((await params).id)
  if (!inv) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  const bytes = await renderInvoicePdf(inv, await getPaymentLines(inv.currency))
  return new NextResponse(Buffer.from(bytes), { headers: { 'Content-Type': 'application/pdf', 'Content-Disposition': `inline; filename="${inv.number}.pdf"`, 'Cache-Control': 'no-store' } })
}
