import { NextRequest, NextResponse } from 'next/server'

// Sends an email notification whenever the contact form receives a new
// message, using Resend (https://resend.com — free tier, no credit card
// needed for low volume).
//
// Setup required (see the .env.local additions in the handoff notes):
//   RESEND_API_KEY   — from your Resend dashboard
//   NOTIFY_TO_EMAIL  — the inbox you want notified (your own email)
//
// If either is missing, this silently no-ops rather than breaking the
// contact form — the message is always saved in Supabase/admin regardless
// of whether this email step succeeds.

export async function POST(request: NextRequest) {
  try {
    const { name, email, subject, message } = await request.json()

    const apiKey = process.env.RESEND_API_KEY
    const toEmail = process.env.NOTIFY_TO_EMAIL

    if (!apiKey || !toEmail) {
      console.warn('notify-message: RESEND_API_KEY or NOTIFY_TO_EMAIL not set — skipping email notification.')
      return NextResponse.json({ skipped: true })
    }

    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'Portfolio Contact Form <onboarding@resend.dev>',
        to: [toEmail],
        reply_to: email,
        subject: `New message: ${subject || 'No subject'}`,
        html: `
          <div style="font-family: sans-serif; max-width: 500px;">
            <h2 style="color: #aa002a;">New contact form message</h2>
            <p><strong>From:</strong> ${name} (${email})</p>
            <p><strong>Subject:</strong> ${subject || '—'}</p>
            <p><strong>Message:</strong></p>
            <p style="white-space: pre-line; background: #f9fafb; padding: 16px; border-radius: 8px;">${message}</p>
            <p style="color: #9ca3af; font-size: 12px; margin-top: 24px;">
              Reply directly to this email to respond to ${name}, or view it in your admin inbox.
            </p>
          </div>
        `,
      }),
    })

    if (!res.ok) {
      const errorText = await res.text()
      console.error('Resend API error:', errorText)
      return NextResponse.json({ error: 'Failed to send notification email' }, { status: 502 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('notify-message error:', error)
    return NextResponse.json({ error: 'Unexpected error' }, { status: 500 })
  }
}
