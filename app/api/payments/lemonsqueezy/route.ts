import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabaseAdmin'
import { fulfillOrder } from '@/lib/fulfillOrder'
import { CARD_PROVIDER, readCardWebhook, verifyCardWebhook } from '@/lib/cardPayments'

// Lemon Squeezy calls this when a card payment succeeds (order_created) or is refunded (order_refunded).
// Nothing is trusted unless the signature matches our secret. A paid order is fulfilled automatically:
// marked paid, download link created and emailed (the same as approving a manual payment).
// Add it in Lemon Squeezy -> Settings -> Webhooks: URL https://YOUR-SITE/api/payments/lemonsqueezy,
// events order_created and order_refunded, and the signing secret from LEMONSQUEEZY_WEBHOOK_SECRET.
export async function POST(request: NextRequest) {
  const raw = await request.text()
  if (!verifyCardWebhook(raw, request.headers.get('x-signature'))) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
  }
  let body: unknown
  try { body = JSON.parse(raw) } catch { return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 }) }
  const ev = readCardWebhook(body)
  if (ev.kind === 'ignore' || !ev.orderId) return NextResponse.json({ ok: true, ignored: true })

  const { data: order } = await supabaseAdmin.from('orders').select('id, status, payment_provider').eq('id', ev.orderId).maybeSingle()
  // Unknown orders get a 200 too, so the provider doesn't keep retrying something we can't use.
  if (!order || order.payment_provider !== CARD_PROVIDER) return NextResponse.json({ ok: true, unknownOrder: true })

  if (ev.kind === 'refunded') {
    await supabaseAdmin.from('orders').update({ status: 'refunded', download_token: null }).eq('id', order.id)
    return NextResponse.json({ ok: true, refunded: true })
  }
  await supabaseAdmin.from('orders').update({ provider_order_id: ev.providerOrderId || null, customer_transaction_id: ev.reference ? `Lemon Squeezy ${ev.reference}` : 'Lemon Squeezy' }).eq('id', order.id)
  const result = await fulfillOrder(order.id)
  if (!result.ok) return NextResponse.json({ error: result.error }, { status: 500 }) // provider retries
  return NextResponse.json({ ok: true, alreadyPaid: result.alreadyPaid })
}
