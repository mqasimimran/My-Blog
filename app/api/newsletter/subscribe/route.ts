import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabaseAdmin'
import { getClientIp, isRateLimited, recordEvent } from '@/lib/rateLimit'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

// Public newsletter signup. Previously the browser inserted straight into
// newsletter_subscribers with the public key, which meant that table had
// to allow anonymous writes (and reads, to detect duplicates). Now the
// table can stay fully private and this route is the only way in.
export async function POST(request: NextRequest) {
  let body: any
  try { body = await request.json() } catch { return NextResponse.json({ error: 'Invalid request' }, { status: 400 }) }

  const email = String(body?.email || '').trim().toLowerCase()
  if (!email || email.length > 254 || !EMAIL_RE.test(email)) {
    return NextResponse.json({ error: 'Please enter a valid email address.' }, { status: 400 })
  }

  const ip = getClientIp(request)
  if (await isRateLimited({ identifier: ip, action: 'subscribe', max: 5, windowMinutes: 60 })) {
    return NextResponse.json({ error: 'Too many attempts. Please try again later.' }, { status: 429 })
  }

  const { error } = await supabaseAdmin.from('newsletter_subscribers').insert([{ email }])
  // 23505 = already subscribed. Treat as success so this endpoint can't be
  // used to find out which emails are on the list.
  if (error && error.code !== '23505') {
    console.error('Subscribe error:', error)
    return NextResponse.json({ error: 'Something went wrong. Please try again.' }, { status: 500 })
  }

  await recordEvent(ip, 'subscribe')
  return NextResponse.json({ success: true })
}
