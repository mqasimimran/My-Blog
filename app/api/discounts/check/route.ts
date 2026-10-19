import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabaseAdmin'
import { getClientIp, isRateLimited, recordEvent } from '@/lib/rateLimit'
import { computeDiscount, type DiscountKind } from '@/lib/discount'

// Checkout preview: is this code usable, and what's the new total? This does NOT use the code up;
// that happens (atomically) when the order is placed.
export async function POST(request: NextRequest) {
  const ip = getClientIp(request)
  if (await isRateLimited({ identifier: ip, action: 'discount_check', max: 30, windowMinutes: 15 })) {
    return NextResponse.json({ error: 'Too many attempts. Please try again in a few minutes.' }, { status: 429 })
  }
  await recordEvent(ip, 'discount_check')

  let body: { code?: unknown; productId?: unknown }
  try { body = await request.json() } catch { return NextResponse.json({ error: 'Enter a code.' }, { status: 400 }) }
  const code = typeof body.code === 'string' ? body.code.trim().toUpperCase() : ''
  const productId = typeof body.productId === 'string' ? body.productId : ''
  if (!code || code.length > 40 || !productId) return NextResponse.json({ error: 'Enter a code.' }, { status: 400 })

  const [{ data: d }, { data: product }] = await Promise.all([
    supabaseAdmin.from('discount_codes').select('code, kind, value, active, expires_at, max_uses, used_count').eq('code', code).maybeSingle(),
    supabaseAdmin.from('products').select('price').eq('id', productId).eq('active', true).maybeSingle(),
  ])
  const usable = d && d.active && (!d.expires_at || new Date(d.expires_at) > new Date()) && (d.max_uses == null || d.used_count < d.max_uses)
  if (!usable || !product) return NextResponse.json({ error: "That code isn't valid." }, { status: 404 })

  const { amount, total } = computeDiscount(Number(product.price), d.kind as DiscountKind, Number(d.value))
  return NextResponse.json({ code: d.code, amount, total })
}
