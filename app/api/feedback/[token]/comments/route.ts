import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabaseAdmin'
import { getClientIp, isRateLimited, recordEvent } from '@/lib/rateLimit'
import { getBoard, getComments } from '@/lib/feedbackServer'
import { escapeHtml } from '@/lib/escapeHtml'
import { sendEmail } from '@/lib/mail'
import { siteConfig } from '@/site.config'

// The client's comments on a design (by private link).
export async function GET(_req: Request, { params }: { params: Promise<{ token: string }> }) {
  const board = await getBoard((await params).token)
  if (!board) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json({ board, comments: await getComments(board.id) }, { headers: { 'Cache-Control': 'no-store' } })
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ token: string }> }) {
  const ip = getClientIp(request)
  if (await isRateLimited({ identifier: ip, action: 'feedback_comment', max: 40, windowMinutes: 15 })) return NextResponse.json({ error: 'Too many comments. Please wait a few minutes.' }, { status: 429 })
  const { token } = await params
  const board = await getBoard(token)
  if (!board) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  if (board.status === 'approved') return NextResponse.json({ error: 'This design has been approved, so comments are closed.' }, { status: 409 })
  const b = await request.json().catch(() => ({}))
  const x = Number(b.x), y = Number(b.y), body = typeof b.body === 'string' ? b.body.trim().slice(0, 2000) : '', name = typeof b.name === 'string' ? b.name.trim().slice(0, 60) : ''
  if (!(x >= 0 && x <= 100 && y >= 0 && y <= 100) || !body) return NextResponse.json({ error: 'Write a comment first.' }, { status: 400 })
  await recordEvent(ip, 'feedback_comment')
  const { error } = await supabaseAdmin.from('feedback_comments').insert([{ board_id: board.id, x, y, body, author_name: name || board.client_name || null }])
  if (error) return NextResponse.json({ error: 'Could not save the comment.' }, { status: 500 })
  if (process.env.RESEND_API_KEY && process.env.NOTIFY_TO_EMAIL) await sendEmail({ from: siteConfig.mail.contactFormFrom, to: [process.env.NOTIFY_TO_EMAIL], subject: `New feedback on ${board.title}`,
    html: `<p><strong>${escapeHtml(name || board.client_name || 'Your client')}</strong> commented on <strong>${escapeHtml(board.title)}</strong>:</p><blockquote>${escapeHtml(body)}</blockquote><p><a href="${siteConfig.url}/admin/feedback">Open in admin</a></p>` })
  return NextResponse.json({ ok: true, comments: await getComments(board.id) })
}
