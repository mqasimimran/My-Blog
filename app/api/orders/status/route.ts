import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabaseAdmin'
import { getClientIp, isRateLimited, recordEvent } from '@/lib/rateLimit'

// A buyer checks their order: it needs BOTH the order number and the email used at checkout, and
// answers "not found" the same way for either mismatch, so it can't be used to discover orders.
export async function POST(request: NextRequest) {
  const ip = getClientIp(request)
  if (await isRateLimited({ identifier: ip, action: 'order_status', max: 20, windowMinutes: 15 })) {
    return NextResponse.json({ error: 'Too many lookups. Please try again in a few minutes.' }, { status: 429 })
  }
  await recordEvent(ip, 'order_status')

  let body: { orderNumber?: unknown; email?: unknown }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Please enter your order number and email.' }, { status: 400 })
  }
  const orderNumber = typeof body.orderNumber === 'string' ? body.orderNumber.trim().toUpperCase() : ''
  const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : ''
  if (!orderNumber || !email || orderNumber.length > 40 || email.length > 200) {
    return NextResponse.json({ error: 'Please enter your order number and email.' }, { status: 400 })
  }

  const { data } = await supabaseAdmin
    .from('orders')
    .select('order_number, product_name, status, created_at, verified_at, download_token, customer_email')
    .eq('order_number', orderNumber)
    .maybeSingle()

  if (!data || (data.customer_email || '').trim().toLowerCase() !== email) {
    return NextResponse.json({ error: "We couldn't find an order with that number and email." }, { status: 404 })
  }

  return NextResponse.json({
    orderNumber: data.order_number,
    product: data.product_name,
    status: data.status,
    placedAt: data.created_at,
    verifiedAt: data.verified_at,
    downloadUrl: data.status === 'paid' && data.download_token ? `/shop/download/${data.download_token}` : null,
  })
}
