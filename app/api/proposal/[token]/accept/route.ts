import { NextRequest, NextResponse } from 'next/server'
import { createHash } from 'node:crypto'
import { supabaseAdmin } from '@/lib/supabaseAdmin'
import { getClientIp, isRateLimited, recordEvent } from '@/lib/rateLimit'
import { getProposalByToken, nextNumber } from '@/lib/invoiceServer'
import { invoiceTotals, money } from '@/lib/invoice'
import { escapeHtml } from '@/lib/escapeHtml'
import { sendEmail } from '@/lib/mail'
import { siteConfig } from '@/site.config'

// The client accepts by typing their full name and agreeing to the terms. That signature is recorded
// (name, time, a one-way fingerprint of their connection), the proposal is claimed atomically so it can
// only be accepted once, and an invoice is created from its items.
export async function POST(request: NextRequest, { params }: { params: Promise<{ token: string }> }) {
  const ip = getClientIp(request)
  if (await isRateLimited({ identifier: ip, action: 'proposal_accept', max: 10, windowMinutes: 15 })) return NextResponse.json({ error: 'Too many attempts. Please try again shortly.' }, { status: 429 })
  await recordEvent(ip, 'proposal_accept')
  const p = await getProposalByToken((await params).token)
  if (!p) return NextResponse.json({ error: 'This proposal could not be found.' }, { status: 404 })
  if (p.status !== 'sent') return NextResponse.json({ error: p.status === 'accepted' ? 'This proposal has already been accepted.' : 'This proposal can no longer be accepted.' }, { status: 409 })
  if (p.valid_until && p.valid_until < new Date().toISOString().slice(0, 10)) return NextResponse.json({ error: 'This proposal has expired. Please ask for an updated one.' }, { status: 410 })
  const b = await request.json().catch(() => ({}))
  const name = typeof b.name === 'string' ? b.name.trim().replace(/\s+/g, ' ').slice(0, 100) : ''
  if (name.length < 2 || b.agree !== true) return NextResponse.json({ error: 'Type your full name and tick the box to accept.' }, { status: 400 })

  const now = new Date().toISOString()
  const fingerprint = createHash('sha256').update(`${ip}:${process.env.NEXTAUTH_SECRET || ''}`).digest('hex').slice(0, 24)
  const { data: claimed } = await supabaseAdmin.from('proposals').update({ status: 'accepted', accepted_at: now, signed_name: name, signed_ip_hash: fingerprint }).eq('id', p.id).eq('status', 'sent').select('id')
  if (!claimed?.length) return NextResponse.json({ error: 'This proposal has already been accepted.' }, { status: 409 })

  const due = new Date(Date.now() + 14 * 86400000).toISOString().slice(0, 10)
  const { data: inv } = await supabaseAdmin.from('invoices').insert([{
    number: await nextNumber('invoices', 'INV'), client_name: p.client_name, client_email: p.client_email, currency: p.currency, items: p.items,
    discount: p.discount, tax_percent: p.tax_percent, notes: `For proposal ${p.number}: ${p.title}`, status: 'sent', due_date: due, sent_at: now,
  }]).select('id, number, public_token').single()
  if (inv) await supabaseAdmin.from('proposals').update({ invoice_id: inv.id }).eq('id', p.id)
  if (p.lead_id) await supabaseAdmin.from('messages').update({ stage: 'won' }).eq('id', p.lead_id)

  const total = money(invoiceTotals(p).total, p.currency)
  const proposalLink = `${siteConfig.url}/proposal/${p.public_token}`, invoiceLink = inv ? `${siteConfig.url}/invoice/${inv.public_token}` : ''
  if (process.env.RESEND_API_KEY) {
    if (process.env.NOTIFY_TO_EMAIL) await sendEmail({ from: siteConfig.mail.contactFormFrom, to: [process.env.NOTIFY_TO_EMAIL], subject: `Proposal accepted: ${p.number} (${total})`,
      html: `<p><strong>${escapeHtml(name)}</strong> accepted <strong>${escapeHtml(p.title)}</strong> (${escapeHtml(p.number)}, ${escapeHtml(total)}).</p><p>Invoice ${escapeHtml(inv?.number || '')} was created and is in Admin &rarr; Invoices.</p>` })
    if (p.client_email) await sendEmail({ from: siteConfig.mail.contactFormFrom, to: [p.client_email], replyTo: siteConfig.email, subject: `Thanks! ${p.title} is confirmed`,
      html: `<div style="font-family:sans-serif;max-width:520px"><p>Hi ${escapeHtml(p.client_name)},</p><p>Thank you for accepting the proposal. Your signed copy and the invoice are below.</p><p><a href="${proposalLink}">Signed proposal</a>${invoiceLink ? ` &middot; <a href="${invoiceLink}">Invoice ${escapeHtml(inv!.number)}</a>` : ''}</p><p>${escapeHtml(siteConfig.name)}</p></div>` })
  }
  return NextResponse.json({ ok: true, invoiceToken: inv?.public_token || null })
}
