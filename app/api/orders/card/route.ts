import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabaseAdmin'
import { getClientIp, isRateLimited, recordEvent } from '@/lib/rateLimit'
import { computeDiscount, type DiscountKind } from '@/lib/discount'
import { CARD_PROVIDER, cardEnabled, createCardCheckout } from '@/lib/cardPayments'
import { siteConfig } from '@/site.config'

// Is card payment available for this product? (Digital products and bundles with a variant ID.)
export async function GET(request: NextRequest) {
  const id = request.nextUrl.searchParams.get('productId') || ''
  if (!cardEnabled() || !id) return NextResponse.json({ available: false })
  const { data } = await supabaseAdmin.from('products').select('type, ls_variant_id, active').eq('id', id).maybeSingle()
  return NextResponse.json({ available: !!data?.active && !!data?.ls_variant_id && data.type !== 'physical' }, { headers: { 'Cache-Control': 'no-store' } })
}

// Creates the order (awaiting card payment) and sends the buyer to the secure card checkout.
export async function POST(request: NextRequest) {
  if (!cardEnabled()) return NextResponse.json({ error: 'Card payments aren\u2019t switched on.' }, { status: 503 })
  const ip = getClientIp(request)
  if (await isRateLimited({ identifier: ip, action: 'card_checkout', max: 10, windowMinutes: 15 })) {
    return NextResponse.json({ error: 'Too many attempts. Please try again in a few minutes.' }, { status: 429 })
  }
  let body: any
  try { body = await request.json() } catch { return NextResponse.json({ error: 'Invalid request.' }, { status: 400 }) }
  const name = typeof body.customerName === 'string' ? body.customerName.trim().slice(0, 100) : ''
  const email = typeof body.customerEmail === 'string' ? body.customerEmail.trim().slice(0, 200) : ''
  if (!name || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || typeof body.productId !== 'string') {
    return NextResponse.json({ error: 'Please add your name and a valid email.' }, { status: 400 })
  }
  const { data: product } = await supabaseAdmin.from('products').select('id, name, price, type, active, ls_variant_id').eq('id', body.productId).maybeSingle()
  if (!product?.active || !product.ls_variant_id || product.type === 'physical') return NextResponse.json({ error: 'Card payment isn\u2019t available for this product.' }, { status: 400 })
  await recordEvent(ip, 'card_checkout')

  // The price is always worked out here; a discount code is used up atomically (as for other payments).
  let price = Number(product.price), discountCode: string | null = null, discountAmount = 0
  const rawCode = typeof body.discountCode === 'string' ? body.discountCode.trim().toUpperCase() : ''
  if (rawCode) {
    const { data: redeemed, error } = await supabaseAdmin.rpc('redeem_discount', { p_code: rawCode })
    const row = Array.isArray(redeemed) ? redeemed[0] : redeemed
    if (error || !row) return NextResponse.json({ error: 'That discount code isn\u2019t valid any more. Remove it and try again.' }, { status: 400 })
    const d = computeDiscount(price, row.kind as DiscountKind, Number(row.value))
    price = d.total; discountAmount = d.amount; discountCode = rawCode
  }
  if (price < 0.5) return NextResponse.json({ error: 'Card payments need a total of at least $0.50.' }, { status: 400 })

  const orderNumber = `ORD-${Date.now().toString(36).toUpperCase()}${Math.floor(Math.random() * 1296).toString(36).toUpperCase().padStart(2, '0')}`
  const { data: order, error: insertError } = await supabaseAdmin.from('orders').insert([{
    order_number: orderNumber, product_id: product.id, product_name: product.name, product_price: price, amount_local: price, currency_local: 'USD',
    customer_name: name, customer_email: email, payment_method: 'card', customer_transaction_id: 'card (pending)', status: 'awaiting_card',
    payment_provider: CARD_PROVIDER, discount_code: discountCode, discount_amount: discountAmount,
  }]).select('id').single()
  if (insertError || !order) return NextResponse.json({ error: 'Could not start the order. Please try again.' }, { status: 500 })

  try {
    const url = await createCardCheckout({
      variantId: product.ls_variant_id, priceCents: Math.round(price * 100), orderId: order.id, orderNumber, email, name,
      redirectUrl: `${siteConfig.url}/shop/order?order=${encodeURIComponent(orderNumber)}`,
    })
    return NextResponse.json({ url, orderNumber })
  } catch (err) {
    console.error('Card checkout failed:', err instanceof Error ? err.message : err)
    await supabaseAdmin.from('orders').update({ status: 'rejected', customer_transaction_id: 'card checkout failed' }).eq('id', order.id)
    return NextResponse.json({ error: 'The card checkout couldn\u2019t be opened. Please try again or choose another way to pay.' }, { status: 502 })
  }
}
