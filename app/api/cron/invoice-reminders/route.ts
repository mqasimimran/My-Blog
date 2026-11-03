import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabaseAdmin'
import { formatDate, invoiceTotals, money, type Invoice } from '@/lib/invoice'
import { escapeHtml } from '@/lib/escapeHtml'
import { nextNumber } from '@/lib/invoiceServer'
import { emailInvoice } from '@/lib/invoiceSend'
import { sendEmail } from '@/lib/mail'
import { siteConfig } from '@/site.config'

// Daily job (vercel.json -> crons): friendly reminders for sent, unpaid invoices. Each is sent once:
//   1) three days before the due date   2) on the due date   3) a week after it
// Only Vercel can run it: it sends "Authorization: Bearer <CRON_SECRET>" (set CRON_SECRET in Vercel).
const STAGES = [
  null,
  { subject: (n: string) => `Friendly reminder: invoice ${n} is due soon`, line: (due: string) => `Just a friendly reminder that this invoice is due on ${due}.` },
  { subject: (n: string) => `Invoice ${n} is due today`, line: () => 'This invoice is due today. If you have already paid, thank you, and please ignore this email.' },
  { subject: (n: string) => `Invoice ${n} is now overdue`, line: (due: string) => `This invoice was due on ${due}. Could you let me know when to expect payment? If you have already paid, thank you, and please ignore this email.` },
]

export async function GET(request: NextRequest) {
  const secret = process.env.CRON_SECRET
  if (!secret) return NextResponse.json({ error: 'CRON_SECRET is not set' }, { status: 503 })
  if (request.headers.get('authorization') !== `Bearer ${secret}`) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const mail = !!process.env.RESEND_API_KEY
  const { data } = mail ? await supabaseAdmin.from('invoices').select('*').eq('status', 'sent').not('due_date', 'is', null).not('client_email', 'is', null) : { data: [] }
  const today = new Date(new Date().toISOString().slice(0, 10) + 'T00:00:00Z').getTime()
  const sent: string[] = []
  for (const inv of (data || []) as (Invoice & { reminders_sent: number })[]) {
    const days = Math.round((new Date(inv.due_date + 'T00:00:00Z').getTime() - today) / 86400000)
    const stage = days <= -7 ? 3 : days <= 0 ? 2 : days <= 3 ? 1 : 0
    if (!stage || stage <= (inv.reminders_sent || 0)) continue
    const s = STAGES[stage]!
    const link = `${siteConfig.url}/invoice/${inv.public_token}`
    const result = await sendEmail({
      from: siteConfig.mail.contactFormFrom, to: [inv.client_email!], replyTo: siteConfig.email, subject: s.subject(inv.number),
      html: `<div style="font-family: sans-serif; max-width: 520px; color: #111;"><p>Hi ${escapeHtml(inv.client_name)},</p>
        <p>${escapeHtml(s.line(formatDate(inv.due_date)))}</p>
        <p>Invoice <strong>${escapeHtml(inv.number)}</strong>: <strong>${escapeHtml(money(invoiceTotals(inv).total, inv.currency))}</strong></p>
        <p><a href="${link}" style="display:inline-block;background:#111;color:#fff;padding:12px 20px;text-decoration:none;">View invoice and payment details</a></p>
        <p>Thank you!<br>${escapeHtml(siteConfig.name)}</p></div>`,
    })
    if (result.ok) { await supabaseAdmin.from('invoices').update({ reminders_sent: stage }).eq('id', inv.id); sent.push(`${inv.number}: reminder ${stage}`) }
  }
  // Retainers: copy each monthly invoice that's due, email it, and move its next date on a month.
  const created: string[] = []
  const { data: repeats } = await supabaseAdmin.from('invoices').select('*').eq('repeat_monthly', true).lte('repeat_next', new Date().toISOString().slice(0, 10))
  for (const inv of (repeats || []) as (Invoice & { repeat_next: string })[]) {
    const next = new Date(inv.repeat_next + 'T00:00:00Z'); next.setUTCMonth(next.getUTCMonth() + 1)
    // Claim it first (move the date on), so a second run the same day can't create a duplicate.
    const { data: claimed } = await supabaseAdmin.from('invoices').update({ repeat_next: next.toISOString().slice(0, 10) }).eq('id', inv.id).eq('repeat_next', inv.repeat_next).select('id')
    if (!claimed?.length) continue
    const { data: copy } = await supabaseAdmin.from('invoices').insert([{ number: await nextNumber('invoices', 'INV'), client_name: inv.client_name, client_email: inv.client_email, client_address: inv.client_address,
      currency: inv.currency, items: inv.items, discount: inv.discount, tax_percent: inv.tax_percent, notes: inv.notes, status: 'sent', issue_date: new Date().toISOString().slice(0, 10),
      due_date: new Date(Date.now() + 14 * 86400000).toISOString().slice(0, 10), sent_at: new Date().toISOString(), repeated_from: inv.id }]).select('*').single()
    if (copy && copy.client_email) await emailInvoice(copy as Invoice & { client_email: string })
    if (copy) created.push(copy.number)
  }
  return NextResponse.json({ ok: true, sent, retainers: created })
}
