import { NextRequest, NextResponse } from 'next/server'
import { timingSafeEqual } from 'node:crypto'
import { supabaseAdmin } from '@/lib/supabaseAdmin'
import { getClientIp, isRateLimited, recordEvent } from '@/lib/rateLimit'
import { escapeHtml, oneLine } from '@/lib/escapeHtml'
import { sendEmail } from '@/lib/mail'
import { siteConfig } from '@/site.config'

// A client submits a testimonial through the private link from /admin/testimonials. It is saved
// HIDDEN; it only appears on the site after you press Show in the admin.
const TYPES: Record<string, string> = { 'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp' }

const sameCode = (a: string, b: string) => a.length === b.length && timingSafeEqual(Buffer.from(a), Buffer.from(b))

export async function POST(request: NextRequest) {
  const ip = getClientIp(request)
  if (await isRateLimited({ identifier: ip, action: 'testimonial', max: 5, windowMinutes: 60 })) {
    return NextResponse.json({ error: 'Too many submissions. Please try again later.' }, { status: 429 })
  }

  let form: FormData
  try {
    form = await request.formData()
  } catch {
    return NextResponse.json({ error: 'Please fill in the form.' }, { status: 400 })
  }
  if (form.get('website')) return NextResponse.json({ success: true }) // honeypot: quietly ignore bots

  const code = String(form.get('code') || '')
  const { data: settings } = await supabaseAdmin.from('private_settings').select('testimonial_invite_code').eq('id', 1).maybeSingle()
  const current = settings?.testimonial_invite_code || ''
  if (!current || !code || !sameCode(code, current)) {
    return NextResponse.json({ error: 'This link is no longer active. Please ask for a new one.' }, { status: 403 })
  }

  const name = oneLine(String(form.get('name') || '')).trim().slice(0, 80)
  const role = oneLine(String(form.get('role') || '')).trim().slice(0, 100)
  const quote = String(form.get('quote') || '').trim()
  if (!name || quote.length < 20 || quote.length > 600 || form.get('consent') !== 'yes') {
    return NextResponse.json({ error: 'Please add your name, a quote of 20 to 600 characters, and tick the consent box.' }, { status: 400 })
  }

  let avatarUrl: string | null = null
  const photo = form.get('photo')
  if (photo instanceof File && photo.size > 0) {
    const ext = TYPES[photo.type]
    if (!ext || photo.size > 3 * 1024 * 1024) {
      return NextResponse.json({ error: 'The photo must be a JPG, PNG or WebP under 3 MB.' }, { status: 400 })
    }
    const path = `testimonials/${crypto.randomUUID()}.${ext}`
    const { error: upErr } = await supabaseAdmin.storage.from('blog-images').upload(path, Buffer.from(await photo.arrayBuffer()), { contentType: photo.type })
    if (upErr) return NextResponse.json({ error: 'The photo could not be uploaded. Try again or submit without it.' }, { status: 500 })
    avatarUrl = supabaseAdmin.storage.from('blog-images').getPublicUrl(path).data.publicUrl
  }

  const { error } = await supabaseAdmin.from('testimonials').insert([{ name, role: role || null, quote, avatar_url: avatarUrl, active: false, order_index: 1000 }])
  if (error) return NextResponse.json({ error: 'Something went wrong. Please try again.' }, { status: 500 })
  await recordEvent(ip, 'testimonial')

  const to = process.env.NOTIFY_TO_EMAIL
  if (to) {
    await sendEmail({
      from: siteConfig.mail.contactFormFrom,
      to: [to],
      subject: `New testimonial from ${name}`,
      html: `<div style="font-family: sans-serif; max-width: 520px;"><p><strong>${escapeHtml(name)}</strong>${role ? `, ${escapeHtml(role)}` : ''} sent a testimonial:</p><blockquote>${escapeHtml(quote)}</blockquote><p>It is hidden until you press Show in Admin &rarr; Testimonials.</p></div>`,
    })
  }
  return NextResponse.json({ success: true })
}
