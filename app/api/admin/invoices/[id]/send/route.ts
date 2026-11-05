import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabaseAdmin'
import { requireAdminSession } from '@/lib/requireAdminSession'
import { getInvoiceById } from '@/lib/invoiceServer'
import type { Invoice } from '@/lib/invoice'
import { emailInvoice } from '@/lib/invoiceSend'

// Emails the invoice to the client: the PDF attached, plus a link to view it online.
export async function POST(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const denied = await requireAdminSession()
  if (denied) return denied
  const inv = await getInvoiceById((await params).id)
  if (!inv) return NextResponse.json({ error: 'Invoice not found.' }, { status: 404 })
  if (!inv.client_email) return NextResponse.json({ error: 'Add the client\u2019s email address first.' }, { status: 400 })
  if (!inv.items?.length) return NextResponse.json({ error: 'Add at least one item first.' }, { status: 400 })
  if (!process.env.RESEND_API_KEY) return NextResponse.json({ error: 'Email isn\u2019t set up yet (RESEND_API_KEY). Download the PDF and send it yourself.' }, { status: 503 })

  const result = await emailInvoice(inv as Invoice & { client_email: string })
  if (!result.ok) return NextResponse.json({ error: `The email couldn\u2019t be sent: ${result.error || 'unknown error'}` }, { status: 502 })
  await supabaseAdmin.from('invoices').update({ status: inv.status === 'paid' ? 'paid' : 'sent', sent_at: new Date().toISOString() }).eq('id', inv.id)
  return NextResponse.json({ success: true })
}
