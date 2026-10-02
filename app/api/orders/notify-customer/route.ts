import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

const SITE_URL = 'https://www.muhammadqasimimran.me/'

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

    const downloadUrl = `${SITE_URL}/shop/download/${downloadToken}`

    const apiKey = process.env.RESEND_API_KEY
    if (apiKey) {
      try {
        await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({
            from: 'Muhammad Qasim Imran <onboarding@resend.dev>',
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
      } catch (emailError) {
        console.error('Customer notification email failed (order was still marked paid):', emailError)
      }
    }

    return NextResponse.json({ success: true, downloadUrl })
  } catch (error) {
    console.error('notify-customer error:', error)
    return NextResponse.json({ error: 'Unexpected error' }, { status: 500 })
  }
}
