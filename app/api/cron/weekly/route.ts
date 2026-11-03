import { NextRequest, NextResponse } from 'next/server'
import { getOverview } from '@/lib/overview'
import { buildBackup } from '@/lib/backup'
import { money } from '@/lib/invoice'
import { sendEmail } from '@/lib/mail'
import { siteConfig } from '@/site.config'

// Monday morning (vercel.json): a summary of what needs you, with a full backup of your data attached.
// Only Vercel can run it ("Authorization: Bearer <CRON_SECRET>").
export const maxDuration = 60
const LABELS: Record<string, string> = { newLeads: 'New leads', followUps: 'Follow-ups due', unread: 'Unread messages', ordersToVerify: 'Orders to verify', commentsPending: 'Comments to approve', feedbackOpen: 'Client feedback to answer', proposalsWaiting: 'Proposals awaiting reply', overdueInvoices: 'Overdue invoices' }

export async function GET(request: NextRequest) {
  const secret = process.env.CRON_SECRET
  if (!secret) return NextResponse.json({ error: 'CRON_SECRET is not set' }, { status: 503 })
  if (request.headers.get('authorization') !== `Bearer ${secret}`) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const to = process.env.NOTIFY_TO_EMAIL || siteConfig.email
  if (!process.env.RESEND_API_KEY) return NextResponse.json({ skipped: 'RESEND_API_KEY is not set' })
  const [o, backup] = await Promise.all([getOverview(), buildBackup()])
  const waiting = Object.entries(o.needs).filter(([, v]) => v > 0)
  const amt = (v: { USD: number; PKR: number }) => [v.USD ? money(v.USD, 'USD') : '', v.PKR ? money(v.PKR, 'PKR') : ''].filter(Boolean).join(' + ') || '$0.00'
  const day = new Date().toISOString().slice(0, 10)
  const json = JSON.stringify(backup, null, 2)
  const r = await sendEmail({
    from: siteConfig.mail.contactFormFrom, to: [to],
    subject: waiting.length ? `Your week: ${waiting.length} thing${waiting.length > 1 ? 's' : ''} need${waiting.length > 1 ? '' : 's'} you` : 'Your week: all caught up',
    html: `<div style="font-family:sans-serif;max-width:560px;color:#111">
      <h2 style="margin:0 0 12px">Good morning, ${siteConfig.firstName}</h2>
      ${waiting.length ? `<p><strong>Needs you:</strong></p><ul>${waiting.map(([k, v]) => `<li>${LABELS[k] || k}: <strong>${v}</strong></li>`).join('')}</ul>` : '<p>Nothing is waiting for you. Nice.</p>'}
      <p><strong>This month so far:</strong> income ${amt(o.month.income)} &middot; unpaid invoices ${o.month.unpaid.count ? amt(o.month.unpaid) : '0'} &middot; subscribers ${o.month.subscribers} (+${o.month.newSubscribers})</p>
      <p><a href="${siteConfig.url}/admin" style="display:inline-block;background:#111;color:#fff;padding:10px 18px;text-decoration:none">Open admin</a></p>
      <p style="color:#666;font-size:13px">Your weekly backup is attached (site-backup-${day}.json). Keep it somewhere safe; it contains customer details.</p></div>`,
    attachments: [{ filename: `site-backup-${day}.json`, content: Buffer.from(json).toString('base64') }],
  })
  return r.ok ? NextResponse.json({ ok: true, waiting: waiting.length, backupKB: Math.round(json.length / 1024) }) : NextResponse.json({ error: r.error }, { status: 502 })
}
