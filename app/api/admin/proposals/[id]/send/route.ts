import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabaseAdmin'
import { requireAdminSession } from '@/lib/requireAdminSession'
import { invoiceTotals, money } from '@/lib/invoice'
import { escapeHtml } from '@/lib/escapeHtml'
import { sendEmail } from '@/lib/mail'
import { siteConfig } from '@/site.config'
import type { Proposal } from '@/lib/proposal'

// Emails the client a link to their proposal and marks it sent (the lead moves to "Proposal sent").
export async function POST(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const denied = await requireAdminSession()
  if (denied) return denied
  const { data } = await supabaseAdmin.from('proposals').select('*').eq('id', (await params).id).maybeSingle()
  const p = data as Proposal | null
  if (!p) return NextResponse.json({ error: 'Proposal not found.' }, { status: 404 })
  if (p.status === 'accepted' || p.status === 'declined') return NextResponse.json({ error: 'This proposal has already been answered.' }, { status: 409 })
  if (!p.client_email) return NextResponse.json({ error: 'Add the client\u2019s email first.' }, { status: 400 })
  if (!process.env.RESEND_API_KEY) return NextResponse.json({ error: 'Email isn\u2019t set up (RESEND_API_KEY). Use "Link" and send it yourself.' }, { status: 503 })
  const link = `${siteConfig.url}/proposal/${p.public_token}`
  const r = await sendEmail({ from: siteConfig.mail.contactFormFrom, to: [p.client_email], replyTo: siteConfig.email, subject: `Proposal: ${p.title}`,
    html: `<div style="font-family:sans-serif;max-width:520px"><p>Hi ${escapeHtml(p.client_name)},</p><p>Here's my proposal for <strong>${escapeHtml(p.title)}</strong> (${escapeHtml(money(invoiceTotals(p).total, p.currency))}). You can read it and accept it online.</p><p><a href="${link}" style="display:inline-block;background:#111;color:#fff;padding:12px 20px;text-decoration:none;">View proposal</a></p><p>${escapeHtml(siteConfig.name)}</p></div>` })
  if (!r.ok) return NextResponse.json({ error: `The email couldn\u2019t be sent: ${r.error || 'unknown error'}` }, { status: 502 })
  await supabaseAdmin.from('proposals').update({ status: 'sent', sent_at: new Date().toISOString() }).eq('id', p.id)
  // Leads only move forward: new or contacted becomes "proposal sent"; won/lost are left alone.
  if (p.lead_id) await supabaseAdmin.from('messages').update({ stage: 'proposal' }).eq('id', p.lead_id).in('stage', ['new', 'contacted'])
  return NextResponse.json({ ok: true })
}
