import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabaseAdmin'
import { getClientIp, isRateLimited, recordEvent } from '@/lib/rateLimit'
import { getBoard } from '@/lib/feedbackServer'
import { escapeHtml } from '@/lib/escapeHtml'
import { sendEmail } from '@/lib/mail'
import { siteConfig } from '@/site.config'

// The client approves the design by typing their name.
export async function POST(request: NextRequest, { params }: { params: Promise<{ token: string }> }) {
  const ip = getClientIp(request)
  if (await isRateLimited({ identifier: ip, action: 'feedback_approve', max: 10, windowMinutes: 15 })) return NextResponse.json({ error: 'Too many attempts.' }, { status: 429 })
  await recordEvent(ip, 'feedback_approve')
  const board = await getBoard((await params).token)
  if (!board) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  const b = await request.json().catch(() => ({}))
  const name = typeof b.name === 'string' ? b.name.trim().slice(0, 100) : ''
  if (name.length < 2) return NextResponse.json({ error: 'Type your name to approve.' }, { status: 400 })
  await supabaseAdmin.from('feedback_boards').update({ status: 'approved', approved_name: name, approved_at: new Date().toISOString() }).eq('id', board.id).eq('status', 'open')
  if (process.env.RESEND_API_KEY && process.env.NOTIFY_TO_EMAIL) await sendEmail({ from: siteConfig.mail.contactFormFrom, to: [process.env.NOTIFY_TO_EMAIL], subject: `Design approved: ${board.title}`, html: `<p><strong>${escapeHtml(name)}</strong> approved <strong>${escapeHtml(board.title)}</strong>.</p>` })
  return NextResponse.json({ ok: true })
}
