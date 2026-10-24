import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabaseAdmin'
import { requireAdminSession } from '@/lib/requireAdminSession'
import { getInvoiceById, getPaymentLines } from '@/lib/invoiceServer'
import { renderInvoicePdf } from '@/lib/invoicePdf'
import { formatDate, invoiceTotals, money } from '@/lib/invoice'
import { escapeHtml } from '@/lib/escapeHtml'
import { sendEmail } from '@/lib/mail'
import { siteConfig } from '@/site.config'

// Emails the invoice to the client: the PDF attached, plus a link to view it online.
export async function POST(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const denied = await requireAdminSession()
  if (denied) return denied
  const inv = await getInvoiceById((await params).id)
  if (!inv) return NextResponse.json({ error: 'Invoice not found.' }, { status: 404 })
  if (!inv.client_email) return NextResponse.json({ error: 'Add the client\u2019s email address first.' }, { status: 400 })
  if (!inv.items?.length) return NextResponse.json({ error: 'Add at least one item first.' }, { status: 400 })
  if (!process.env.RESEND_API_KEY) return NextResponse.json({ error: 'Email isn\u2019t set up yet (RESEND_API_KEY). Download the PDF and send it yourself.' }, { status: 503 })

  const { total } = invoiceTotals(inv)
  const link = `${siteConfig.url}/invoice/${inv.public_token}`
  const pdf = await renderInvoicePdf(inv, await getPaymentLines(inv.currency))
  const result = await sendEmail({
    from: siteConfig.mail.contactFormFrom,
    to: [inv.client_email],
    replyTo: siteConfig.email,
    subject: `Invoice ${inv.number} from ${siteConfig.name}`,
    html: `<div style="font-family: sans-serif; max-width: 520px; color: #111;">
      <p>Hi ${escapeHtml(inv.client_name)},</p>
      <p>Here is invoice <strong>${escapeHtml(inv.number)}</strong> for <strong>${escapeHtml(money(total, inv.currency))}</strong>${inv.due_date ? `, due ${escapeHtml(formatDate(inv.due_date))}` : ''}. The PDF is attached.</p>
      <p><a href="${link}" style="display:inline-block;background:#111;color:#fff;padding:12px 20px;text-decoration:none;">View invoice and payment details</a></p>
      <p>Thank you!<br>${escapeHtml(siteConfig.name)}</p>
    </div>`,
    attachments: [{ filename: `${inv.number}.pdf`, content: Buffer.from(pdf).toString('base64') }],
  })
  if (!result.ok) return NextResponse.json({ error: `The email couldn\u2019t be sent: ${result.error || 'unknown error'}` }, { status: 502 })
  await supabaseAdmin.from('invoices').update({ status: inv.status === 'paid' ? 'paid' : 'sent', sent_at: new Date().toISOString() }).eq('id', inv.id)
  return NextResponse.json({ success: true })
}
