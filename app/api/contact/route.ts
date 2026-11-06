import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin as supabase } from '@/lib/supabaseAdmin'
import { escapeHtml, oneLine, EMAIL_RE } from '@/lib/escapeHtml'


import { sendEmail } from '@/lib/mail'
import { siteConfig } from '@/site.config'
import { cleanOptions, estimate, parsePrice, type LineItem, type Selection } from '@/lib/serviceOptions'
import { whatsappMe } from '@/lib/notify'
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
    const { name, email, subject, website } = body
    let message = body.message

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

    if (body.brief_ids !== undefined) {
      const ids = body.brief_ids
      const uuid = /^[0-9a-f]{8}(?:-[0-9a-f]{4}){3}-[0-9a-f]{12}$/i
      if (!Array.isArray(ids) || ids.length > 12 || ids.some(id => typeof id !== 'string' || !uuid.test(id))) {
        return NextResponse.json({error:'Please choose up to 12 portfolio examples.'},{status:400})
      }
      const uniqueIds = [...new Set(ids)] as string[]
      if (uniqueIds.length) {
        const {data: examples, error} = await supabase.from('designs').select('id,title').in('id',uniqueIds).eq('published',true)
        if (error) return NextResponse.json({error:'Could not check the examples. Please try again.'},{status:503})
        if (examples.length !== uniqueIds.length) return NextResponse.json({error:'An example is no longer available. Remove it from your brief and try again.'},{status:400})
        const links = uniqueIds.map(id => {
          const example = examples.find(item => item.id === id)!
          return oneLine(example.title) + '\n' + siteConfig.url + '/design?item=' + id
        })
        message += '\n\nSelected portfolio examples\n' + links.join('\n\n')
      }
    }

    // Package requests (service page configurator): re-price on the server from the service's own
    // options and packages, so the saved line items can be trusted when turned into a proposal.
    let request_items: LineItem[] | null = null
    if (body.request && typeof body.request.serviceId === 'string') {
      const { data: svc } = await supabase.from('services').select('name, options').eq('id', body.request.serviceId).maybeSingle()
      const { data: pk } = svc ? await supabase.from('service_packages').select('tier, price').eq('service_id', body.request.serviceId) : { data: null }
      const pkg = (pk || []).find((x) => x.tier === body.request.tier)
      if (svc && pkg) request_items = estimate(parsePrice(pkg.price), `${svc.name}: ${pkg.tier} package`, cleanOptions(svc.options), (body.request.selection || {}) as Selection).items
    }
    const { error: insertError } = await supabase.from('messages').insert([{ name, email, subject, message, ...(request_items ? { request_items } : {}) }])
    if (insertError) {
      console.error('Error saving message:', insertError)
      return NextResponse.json({ error: insertError.message }, { status: 500 })
    }
    await whatsappMe(`\u{1F4E9} ${request_items ? 'Package request' : 'New message'} from ${name}${subject ? `: ${String(subject).slice(0, 80)}` : ''}. Check Admin -> Leads.`)

    // Log this submission for rate limiting purposes
    await supabase.from('rate_limit_log').insert([{ identifier: ip, action: 'contact' }])

    // Best-effort email notification — failure here doesn't fail the request,
    // since the message is already safely saved either way.
    const toEmail = process.env.NOTIFY_TO_EMAIL
    if (toEmail) {
      const mail = await sendEmail({
        from: siteConfig.mail.contactFormFrom,
        to: [toEmail],
        replyTo: email,
        subject: `New message: ${oneLine(subject) || 'No subject'}`,
        html: `
              <div style="font-family: sans-serif; max-width: 500px;">
                <h2 style="color: ${siteConfig.brand.accent};">New contact form message</h2>
                <p><strong>From:</strong> ${escapeHtml(name)} (${escapeHtml(email)})</p>
                <p><strong>Subject:</strong> ${escapeHtml(subject) || '—'}</p>
                <p><strong>Message:</strong></p>
                <p style="white-space: pre-line; background: #f9fafb; padding: 16px; border-radius: 8px;">${escapeHtml(message)}</p>
              </div>
            `,
      })
      if (!mail.ok) console.error('Email notification failed (message was still saved):', mail.error)
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Contact route error:', error)
    return NextResponse.json({ error: 'Unexpected error' }, { status: 500 })
  }
}
