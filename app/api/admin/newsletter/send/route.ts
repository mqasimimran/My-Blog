import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabaseAdmin'
import { requireAdminSession } from '@/lib/requireAdminSession'
import { sendBatch, sendEmail } from '@/lib/mail'
import { newsletterHtml, unsubscribeLink } from '@/lib/newsletterEmail'
import { siteConfig } from '@/site.config'

// Sends a newsletter: a test copy to one address, or the real thing to every subscriber in batches of
// 100. Each subscriber gets their own email with their own unsubscribe link. Admin only.
export const maxDuration = 60

export async function POST(request: NextRequest) {
  const denied = await requireAdminSession()
  if (denied) return denied
  if (!process.env.RESEND_API_KEY) return NextResponse.json({ error: 'Email isn\u2019t set up (RESEND_API_KEY).' }, { status: 503 })
  const b = await request.json().catch(() => ({}))
  const subject = typeof b.subject === 'string' ? b.subject.trim().slice(0, 200) : ''
  const body = typeof b.body === 'string' ? b.body.slice(0, 200000) : ''
  if (!subject || body.replace(/<[^>]+>/g, '').trim().length < 5) return NextResponse.json({ error: 'Add a subject and a message.' }, { status: 400 })
  const from = siteConfig.mail.newsletterFrom

  if (typeof b.testTo === 'string') {
    const to = b.testTo.trim()
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(to)) return NextResponse.json({ error: 'Enter a valid email for the test.' }, { status: 400 })
    const r = await sendEmail({ from, to: [to], replyTo: siteConfig.email, subject: `[Test] ${subject}`, html: newsletterHtml(subject, body, `${siteConfig.url}/#test-unsubscribe-link`) })
    return r.ok ? NextResponse.json({ ok: true, test: true }) : NextResponse.json({ error: `The test couldn\u2019t be sent: ${r.error}` }, { status: 502 })
  }

  const { data: subs, error } = await supabaseAdmin.from('newsletter_subscribers').select('email, unsubscribe_token').order('created_at')
  if (error) return NextResponse.json({ error: 'Could not load subscribers.' }, { status: 500 })
  const list = (subs || []).filter((s) => s.email && s.unsubscribe_token)
  if (!list.length) return NextResponse.json({ error: 'You don\u2019t have any subscribers yet.' }, { status: 400 })
  let sent = 0, failed = 0
  for (let i = 0; i < list.length; i += 100) {
    const chunk = list.slice(i, i + 100)
    const r = await sendBatch(chunk.map((s) => {
      const unsub = unsubscribeLink(s.email, s.unsubscribe_token)
      return { from, to: [s.email], replyTo: siteConfig.email, subject, html: newsletterHtml(subject, body, unsub), headers: { 'List-Unsubscribe': `<${unsub}>` } }
    }))
    if (r.ok) sent += chunk.length; else { failed += chunk.length; console.error('Newsletter batch failed:', r.error) }
  }
  await supabaseAdmin.from('newsletter_campaigns').insert([{ subject, body, recipients: sent, failed }])
  return NextResponse.json({ ok: failed === 0, sent, failed, ...(failed ? { error: `${failed} emails couldn\u2019t be sent. Check Resend for details.` } : {}) })
}
