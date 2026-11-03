import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabaseAdmin'
import { getClientIp, isRateLimited, recordEvent } from '@/lib/rateLimit'
import { emailMe, whatsappMe } from '@/lib/notify'
import { escapeHtml } from '@/lib/escapeHtml'

// Product reviews. GET: approved reviews + average for a product. POST: a buyer reviews their purchase
// using their private download link (so only real, paid buyers can review, once per order).
export async function GET(request: NextRequest) {
  const id = request.nextUrl.searchParams.get('productId') || ''
  const { data } = await supabaseAdmin.from('product_reviews').select('name, rating, body, created_at').eq('product_id', id).eq('status', 'approved').order('created_at', { ascending: false }).limit(50)
  const list = data || []
  return NextResponse.json({ reviews: list, count: list.length, average: list.length ? Math.round((list.reduce((s, r) => s + r.rating, 0) / list.length) * 10) / 10 : 0 }, { headers: { 'Cache-Control': 'no-store' } })
}

export async function POST(request: NextRequest) {
  const ip = getClientIp(request)
  if (await isRateLimited({ identifier: ip, action: 'review', max: 5, windowMinutes: 30 })) return NextResponse.json({ error: 'Too many attempts. Please try later.' }, { status: 429 })
  const b = await request.json().catch(() => ({}))
  const token = typeof b.token === 'string' ? b.token : '', rating = Math.round(Number(b.rating))
  const name = typeof b.name === 'string' ? b.name.trim().slice(0, 60) : '', body = typeof b.body === 'string' ? b.body.trim().slice(0, 2000) : ''
  if (!token || !(rating >= 1 && rating <= 5) || !name) return NextResponse.json({ error: 'Choose a star rating and add your name.' }, { status: 400 })
  await recordEvent(ip, 'review')
  const { data: order } = await supabaseAdmin.from('orders').select('id, product_id, product_name, status').eq('download_token', token).maybeSingle()
  if (!order || order.status !== 'paid' || !order.product_id) return NextResponse.json({ error: 'Only buyers can review this product.' }, { status: 403 })
  const { error } = await supabaseAdmin.from('product_reviews').insert([{ product_id: order.product_id, order_id: order.id, name, rating, body: body || null }])
  if (error) { const dup = /duplicate|unique/i.test(error.message); return NextResponse.json({ error: dup ? 'You’ve already reviewed this purchase. Thank you!' : 'Could not save your review.' }, { status: dup ? 409 : 500 }) }
  await Promise.all([whatsappMe(`⭐ New ${rating}-star review for ${order.product_name}. Approve it in Admin -> Reviews.`), emailMe(`New review: ${rating} stars for ${order.product_name}`, `<p><strong>${escapeHtml(name)}</strong> gave ${rating}/5.</p>${body ? `<blockquote>${escapeHtml(body)}</blockquote>` : ''}`)])
  return NextResponse.json({ ok: true })
}
