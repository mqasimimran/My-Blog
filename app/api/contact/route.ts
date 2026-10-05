import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin as supabase } from '@/lib/supabaseAdmin'
import { escapeHtml, oneLine, EMAIL_RE } from '@/lib/escapeHtml'


const MAX_SUBMISSIONS = 5
const WINDOW_MINUTES = 60

function getClientIp(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for')
  if (forwarded) return forwarded.split(',')[0].trim()
  return request.headers.get('x-real-ip') || 'unknown'
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, email, subject, message, website } = body

    // Honeypot — checked server-side now, so it can't be bypassed by a
    // script that skips the browser entirely and calls this route directly.
    if (website) {
      return NextResponse.json({ success: true })
    }

    if (!name || !email || !message) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Type + size + format checks. Without these the route accepts
    // arbitrarily large or non-string input straight into the database
    // and into the email sent to you.
    if (
      typeof name !== 'string' || typeof email !== 'string' || typeof message !== 'string' ||
      (subject != null && typeof subject !== 'string') ||
      name.length > 100 || email.length > 254 || message.length > 5000 ||
      (subject && subject.length > 200) || !EMAIL_RE.test(email)
    ) {
      return NextResponse.json({ error: 'Please check your details and try again.' }, { status: 400 })
    }

    const ip = getClientIp(request)
    const windowStart = new Date(Date.now() - WINDOW_MINUTES * 60 * 1000).toISOString()

    const { count } = await supabase
      .from('rate_limit_log')
      .select('*', { count: 'exact', head: true })
      .eq('identifier', ip)
      .eq('action', 'contact')
      .gte('created_at', windowStart)

    if ((count || 0) >= MAX_SUBMISSIONS) {
      return NextResponse.json(
        { error: 'Too many messages sent recently. Please try again in a bit.' },
        { status: 429 }
      )
    }

    const { error: insertError } = await supabase.from('messages').insert([{ name, email, subject, message }])
    if (insertError) {
      console.error('Error saving message:', insertError)
      return NextResponse.json({ error: insertError.message }, { status: 500 })
    }

    // Log this submission for rate limiting purposes
    await supabase.from('rate_limit_log').insert([{ identifier: ip, action: 'contact' }])

    // Best-effort email notification — failure here doesn't fail the request,
    // since the message is already safely saved either way.
    const apiKey = process.env.RESEND_API_KEY
    const toEmail = process.env.NOTIFY_TO_EMAIL
    if (apiKey && toEmail) {
      try {
        await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            from: 'Portfolio Contact Form <onboarding@resend.dev>',
            to: [toEmail],
            reply_to: email,
            subject: `New message: ${oneLine(subject) || 'No subject'}`,
            html: `
              <div style="font-family: sans-serif; max-width: 500px;">
                <h2 style="color: #aa002a;">New contact form message</h2>
                <p><strong>From:</strong> ${escapeHtml(name)} (${escapeHtml(email)})</p>
                <p><strong>Subject:</strong> ${escapeHtml(subject) || '—'}</p>
                <p><strong>Message:</strong></p>
                <p style="white-space: pre-line; background: #f9fafb; padding: 16px; border-radius: 8px;">${escapeHtml(message)}</p>
              </div>
            `,
          }),
        })
      } catch (emailError) {
        console.error('Email notification failed (message was still saved):', emailError)
      }
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Contact route error:', error)
    return NextResponse.json({ error: 'Unexpected error' }, { status: 500 })
  }
}
