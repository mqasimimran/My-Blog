import { getPaymentLines } from '@/lib/invoiceServer'
import { renderInvoicePdf } from '@/lib/invoicePdf'
import { formatDate, invoiceTotals, money, type Invoice } from '@/lib/invoice'
import { escapeHtml } from '@/lib/escapeHtml'
import { sendEmail } from '@/lib/mail'
import { siteConfig } from '@/site.config'

/** Emails an invoice to its client with the PDF attached (manual "Send" and monthly retainers). */
export async function emailInvoice(inv: Invoice & { client_email: string }) {
  const { total } = invoiceTotals(inv)
  const link = `${siteConfig.url}/invoice/${inv.public_token}`
  const pdf = await renderInvoicePdf(inv, await getPaymentLines(inv.currency))
  return sendEmail({
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
}
