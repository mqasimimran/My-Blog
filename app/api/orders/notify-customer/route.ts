import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

const SITE_URL = 'https://www.muhammadqasimimran.me'

export async function POST(request: NextRequest) {
  try {
    const { orderId } = await request.json()
    if (!orderId) return NextResponse.json({ error: 'Missing orderId' }, { status: 400 })

    const { data: order, error } = await supabase.from('orders').select('*').eq('id', orderId).single()
    if (error || !order) return NextResponse.json({ error: 'Order not found' }, { status: 404 })

    const downloadToken = crypto.randomUUID()
    const { error: updateError } = await supabase.from('orders').update({
      status: 'paid',
      download_token: downloadToken,
      verified_at: new Date().toISOString(),
    }).eq('id', orderId)

    if (updateError) return NextResponse.json({ error: updateError.message }, { status: 500 })

    // Decrement stock now that the order is actually verified paid — not
    // at raw submission, since an unverified or abandoned order shouldn't
    // reduce inventory. Read-then-write rather than a true atomic
    // decrement; at this store's scale (manually verified one order at a
    // time) a race here is very unlikely, but worth knowing if that
    // changes later.
    const { data: product } = await supabase
      .from('products')
      .select('type, stock_quantity')
      .eq('id', order.product_id)
      .single()

    if (product?.type === 'physical' && product.stock_quantity !== null) {
      await supabase
        .from('products')
        .update({ stock_quantity: Math.max(0, product.stock_quantity - 1) })
        .eq('id', order.product_id)
    }

    const downloadUrl = `${SITE_URL}/shop/download/${downloadToken}`

    const apiKey = process.env.RESEND_API_KEY
    let emailSent = false
    let emailError: string | null = null

    if (!apiKey) {
      emailError = 'RESEND_API_KEY is not set'
    } else {
      try {
        const res = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({
            // Requires muhammadqasimimran.me to be a VERIFIED domain in your
            // Resend dashboard. Until it's verified, this send will fail —
            // switch to 'onboarding@resend.dev' temporarily, which only
            // works when `to` matches your own Resend account email.
            from: 'Muhammad Qasim Imran <orders@muhammadqasimimran.me>',
            to: [order.customer_email],
            subject: `Your order is confirmed — ${order.product_name}`,
            html: `
              <div style="font-family: sans-serif; max-width: 500px;">
                <h2 style="color: #aa002a;">Payment confirmed!</h2>
                <p>Hi ${order.customer_name},</p>
                <p>Your payment for <strong>${order.product_name}</strong> has been verified. Here's your download:</p>
                <p style="margin: 24px 0;">
                  <a href="${downloadUrl}" style="background: #aa002a; color: white; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: bold;">Download Now</a>
                </p>
                <p style="color: #9ca3af; font-size: 12px;">Order ${order.order_number}. Keep this email — the link above works any time.</p>
              </div>
            `,
          }),
        })

        if (res.ok) {
          emailSent = true
        } else {
          emailError = await res.text()
          console.error('Customer notification email failed (order was still marked paid):', emailError)
        }
      } catch (err) {
        emailError = err instanceof Error ? err.message : 'Unknown email error'
        console.error('Customer notification email failed (order was still marked paid):', err)
      }
    }

    // The order is paid either way — that part always succeeds. But the
    // caller (admin UI) needs to know if the email itself failed, instead
    // of assuming success just because the order update worked.
    return NextResponse.json({ success: true, downloadUrl, emailSent, emailError })
  } catch (error) {
    console.error('notify-customer error:', error)
    return NextResponse.json({ error: 'Unexpected error' }, { status: 500 })
  }
}
