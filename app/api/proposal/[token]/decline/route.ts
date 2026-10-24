import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabaseAdmin'
import { getClientIp, isRateLimited, recordEvent } from '@/lib/rateLimit'
import { getProposalByToken } from '@/lib/invoiceServer'
import { escapeHtml } from '@/lib/escapeHtml'
import { sendEmail } from '@/lib/mail'
import { siteConfig } from '@/site.config'

export async function POST(request: NextRequest, { params }: { params: Promise<{ token: string }> }) {
  const ip = getClientIp(request)
  if (await isRateLimited({ identifier: ip, action: 'proposal_decline', max: 10, windowMinutes: 15 })) return NextResponse.json({ error: 'Too many attempts.' }, { status: 429 })
  await recordEvent(ip, 'proposal_decline')
  const p = await getProposalByToken((await params).token)
  if (!p || p.status !== 'sent') return NextResponse.json({ error: 'This proposal can no longer be changed.' }, { status: 409 })
  const b = await request.json().catch(() => ({}))
  const reason = typeof b.reason === 'string' ? b.reason.trim().slice(0, 1000) : ''
  await supabaseAdmin.from('proposals').update({ status: 'declined', decline_reason: reason || null }).eq('id', p.id).eq('status', 'sent')
  // A client who already won stays won (they may decline an extra proposal).
  if (p.lead_id) await supabaseAdmin.from('messages').update({ stage: 'lost' }).eq('id', p.lead_id).neq('stage', 'won')
  if (process.env.RESEND_API_KEY && process.env.NOTIFY_TO_EMAIL) await sendEmail({ from: siteConfig.mail.contactFormFrom, to: [process.env.NOTIFY_TO_EMAIL], subject: `Proposal declined: ${p.number}`, html: `<p>${escapeHtml(p.client_name)} declined <strong>${escapeHtml(p.title)}</strong>.</p>${reason ? `<p>Reason: ${escapeHtml(reason)}</p>` : ''}` })
  return NextResponse.json({ ok: true })
}
