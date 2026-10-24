import { NextResponse } from 'next/server'
import { getProposalByToken } from '@/lib/invoiceServer'
import { renderProposalPdf } from '@/lib/proposalPdf'

export async function GET(_req: Request, { params }: { params: Promise<{ token: string }> }) {
  const p = await getProposalByToken((await params).token)
  if (!p) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return new NextResponse(Buffer.from(await renderProposalPdf(p)), { headers: { 'Content-Type': 'application/pdf', 'Content-Disposition': `inline; filename="${p.number}.pdf"`, 'Cache-Control': 'no-store' } })
}
