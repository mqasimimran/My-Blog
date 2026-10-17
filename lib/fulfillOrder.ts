import 'server-only'
import { supabaseAdmin } from '@/lib/supabaseAdmin'
import { sendEmail } from '@/lib/mail'
import { escapeHtml, oneLine } from '@/lib/escapeHtml'
import { logSecurityEvent } from '@/lib/audit'
import { siteConfig, SITE_URL } from '@/site.config'

export type FulfilResult =
  | { ok: true; alreadyPaid: boolean; downloadUrl: string | null; emailSent: boolean; emailError: string | null; order: any }
  | { ok: false; status: number; error: string }

const downloadUrlFor = (token: string | null | undefined) => (token ? `${SITE_URL}/shop/download/${token}` : null)

/**
 * Marks an order paid and delivers it. Used by the admin "verify payment"
 * button, so the behaviour is defined in one place.
 *
 * IDEMPOTENT: safe to call any number of times, even simultaneously. The first
 * caller atomically flips the order to 'paid' (a conditional UPDATE only
 * succeeds if it isn't paid yet); every other caller sees "already paid" and
 * does nothing — no second download token, no second stock decrement, no
 * second email. That matters because an admin can double-click "verify".
 */
export async function fulfillOrder(orderId: string): Promise<FulfilResult> {
  const { data: order, error } = await supabaseAdmin.from('orders').select('*').eq('id', orderId).maybeSingle()
  if (error) return { ok: false, status: 500, error: error.message }
  if (!order) return { ok: false, status: 404, error: 'Order not found' }

  if (order.status === 'paid') {
    return { ok: true, alreadyPaid: true, downloadUrl: downloadUrlFor(order.download_token), emailSent: false, emailError: null, order }
  }

  const downloadToken = crypto.randomUUID()
  const { data: claimed, error: claimError } = await supabaseAdmin
    .from('orders')
    .update({ status: 'paid', download_token: downloadToken, verified_at: new Date().toISOString() })
    .eq('id', orderId)
    .neq('status', 'paid')
    .select()
  if (claimError) return { ok: false, status: 500, error: claimError.message }

  if (!claimed || claimed.length === 0) {
    // Lost a race: another request fulfilled it between our read and our update.
    const { data: fresh } = await supabaseAdmin.from('orders').select('*').eq('id', orderId).maybeSingle()
    return { ok: true, alreadyPaid: true, downloadUrl: downloadUrlFor(fresh?.download_token), emailSent: false, emailError: null, order: fresh || order }
  }

  // From here on we are the ONE caller that fulfils this order.
  const { data: product } = await supabaseAdmin.from('products').select('type, stock_quantity').eq('id', order.product_id).maybeSingle()
  if (product?.type === 'physical' && product.stock_quantity !== null) {
    await supabaseAdmin.from('products').update({ stock_quantity: Math.max(0, product.stock_quantity - 1) }).eq('id', order.product_id)
  }

  const downloadUrl = downloadUrlFor(downloadToken)!
  const mail = await sendEmail({
    from: siteConfig.mail.ordersFrom,
    to: [order.customer_email],
    subject: `Your order is confirmed — ${oneLine(order.product_name)}`,
    html: `
      <div style="font-family: sans-serif; max-width: 500px;">
        <h2 style="color: ${siteConfig.brand.accent};">Payment confirmed!</h2>
        <p>Hi ${escapeHtml(order.customer_name)},</p>
        <p>Your payment for <strong>${escapeHtml(order.product_name)}</strong> has been verified. Here's your download:</p>
        <p style="margin: 24px 0;">
          <a href="${downloadUrl}" style="background: ${siteConfig.brand.accent}; color: white; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: bold;">Download Now</a>
        </p>
        <p style="color: #9ca3af; font-size: 12px;">Order ${escapeHtml(order.order_number)}. Keep this email — the link above works any time.</p>
      </div>
    `,
  })
  if (!mail.ok) console.error('Customer email failed (order was still marked paid):', mail.error)

  await logSecurityEvent({
    event: 'order_paid',
    detail: { order_number: order.order_number, method: order.payment_method },
  })

  return { ok: true, alreadyPaid: false, downloadUrl, emailSent: mail.ok, emailError: mail.ok ? null : mail.error || 'Email failed', order: claimed[0] }
}
