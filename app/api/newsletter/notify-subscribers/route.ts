import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

const SITE_URL = 'https://my-blog-beta-red.vercel.app'

export async function POST(request: NextRequest) {
  try {
    const { articleTitle, articleSlug, articleExcerpt } = await request.json()
    if (!articleTitle || !articleSlug) {
      return NextResponse.json({ error: 'Missing article title or slug' }, { status: 400 })
    }

    const { data: subscribers, error } = await supabase.from('newsletter_subscribers').select('email')
    if (error) {
      console.error('Error fetching subscribers:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    if (!subscribers || subscribers.length === 0) {
      return NextResponse.json({ success: true, sent: 0, note: 'No subscribers yet' })
    }

    const apiKey = process.env.RESEND_API_KEY
    if (!apiKey) {
      console.warn('notify-subscribers: RESEND_API_KEY not set — skipping.')
      return NextResponse.json({ success: true, sent: 0, note: 'Email not configured' })
    }

    const postUrl = `${SITE_URL}/blog/${articleSlug}`

    // One email per subscriber (not a single BCC blast) — this is what
    // makes a real, working, personalized unsubscribe link possible. Fine
    // at the subscriber counts a personal blog will realistically have;
    // if this list ever grows into the thousands, batching with a proper
    // mailing list provider would be worth revisiting.
    let sent = 0
    for (const subscriber of subscribers) {
      const unsubscribeUrl = `${SITE_URL}/api/newsletter/unsubscribe?email=${encodeURIComponent(subscriber.email)}`

      const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          from: 'Muhammad Qasim Imran <onboarding@resend.dev>',
          to: [subscriber.email],
          subject: `New post: ${articleTitle}`,
          html: `
            <div style="font-family: sans-serif; max-width: 500px;">
              <p style="text-transform: uppercase; letter-spacing: 2px; font-size: 11px; color: #aa002a; font-weight: bold;">New Post</p>
              <h2 style="margin: 8px 0;">${articleTitle}</h2>
              ${articleExcerpt ? `<p style="color: #4b5563;">${articleExcerpt}</p>` : ''}
              <p style="margin: 24px 0;">
                <a href="${postUrl}" style="background: #aa002a; color: white; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: bold;">Read It</a>
              </p>
              <p style="color: #9ca3af; font-size: 11px; margin-top: 32px; border-top: 1px solid #e5e7eb; padding-top: 16px;">
                You're getting this because you subscribed at ${SITE_URL}.
                <a href="${unsubscribeUrl}" style="color: #9ca3af;">Unsubscribe</a>
              </p>
            </div>
          `,
        }),
      })

      if (res.ok) {
        sent += 1
      } else {
        const errText = await res.text()
        console.error(`Failed to send to ${subscriber.email}:`, errText)
      }
    }

    return NextResponse.json({ success: true, sent, total: subscribers.length })
  } catch (error) {
    console.error('notify-subscribers error:', error)
    return NextResponse.json({ error: 'Unexpected error' }, { status: 500 })
  }
}
