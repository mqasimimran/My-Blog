import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin as supabase } from '@/lib/supabaseAdmin'
import { escapeHtml, oneLine, EMAIL_RE } from '@/lib/escapeHtml'


function getClientIp(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for')
  if (forwarded) return forwarded.split(',')[0].trim()
  return request.headers.get('x-real-ip') || 'unknown'
}

const METHOD_LABELS: Record<string, string> = {
  jazzcash: 'JazzCash',
  easypaisa: 'EasyPaisa',
  bank_transfer: 'Bank Transfer',
  payoneer: 'Payoneer',
}

function generateOrderNumber(): string {
  const date = new Date()
  const y = date.getFullYear().toString().slice(-2)
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  const rand = Math.random().toString(36).substring(2, 6).toUpperCase()
  return `ORD-${y}${m}${d}-${rand}`
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { productId, customerName, customerEmail, paymentMethod, customerTransactionId, website } = body

    // Honeypot
    if (website) {
      return NextResponse.json({ success: true, orderNumber: 'N/A' })
    }

    if (!productId || !customerName || !customerEmail || !paymentMethod || !customerTransactionId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Type + size + format checks (also: payment method must be one we
    // actually offer, not an arbitrary string).
    if (
      [productId, customerName, customerEmail, paymentMethod, customerTransactionId].some((v) => typeof v !== 'string') ||
      customerName.length > 100 || customerEmail.length > 254 || customerTransactionId.length > 100 ||
      !EMAIL_RE.test(customerEmail) || !Object.prototype.hasOwnProperty.call(METHOD_LABELS, paymentMethod)
    ) {
      return NextResponse.json({ error: 'Please check your details and try again.' }, { status: 400 })
    }

    // Rate limit: max 5 order submissions per hour per IP
    const ip = getClientIp(request)
    const windowStart = new Date(Date.now() - 60 * 60 * 1000).toISOString()
    const { count } = await supabase
      .from('rate_limit_log')
      .select('*', { count: 'exact', head: true })
      .eq('identifier', ip)
      .eq('action', 'order')
      .gte('created_at', windowStart)

    if ((count || 0) >= 5) {
      return NextResponse.json({ error: 'Too many submissions recently. Please try again later.' }, { status: 429 })
    }

    const { data: product, error: productError } = await supabase
      .from('products')
      .select('name, price, type, stock_quantity')
      .eq('id', productId)
      .single()

    if (productError || !product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 })
    }

    // Enforce stock server-side. The product page only hides the "Buy Now"
    // button for out-of-stock items — that's a UI hint, not a gate. Anyone
    // who already had the checkout URL (or hits this API directly) could
    // still submit an order for a physical product with zero stock without
    // this check.
    if (product.type === 'physical' && product.stock_quantity !== null && product.stock_quantity <= 0) {
      return NextResponse.json({ error: 'This item is out of stock.' }, { status: 409 })
    }

    const orderNumber = generateOrderNumber()

    // Capture the converted amount NOW, at purchase time — never trust a
    // client-supplied amount for money, and never recompute with a later
    // day's rate when verifying, since that could drift from what the
    // buyer actually saw and sent.
    const isPkrMethod = paymentMethod === 'jazzcash' || paymentMethod === 'easypaisa' || paymentMethod === 'bank_transfer'
    let amountLocal = product.price
    let currencyLocal = 'USD'

    if (isPkrMethod) {
      try {
        const rateRes = await fetch(`${request.nextUrl.origin}/api/exchange-rate`)
        const rateData = await rateRes.json()
        amountLocal = Math.round(product.price * rateData.usdToPkr)
        currencyLocal = 'PKR'
      } catch (rateError) {
        console.warn('Could not fetch exchange rate for order, storing USD amount instead:', rateError)
      }
    }

    const { error: insertError } = await supabase.from('orders').insert([{
      order_number: orderNumber,
      product_id: productId,
      product_name: product.name,
      product_price: product.price,
      amount_local: amountLocal,
      currency_local: currencyLocal,
      customer_name: customerName,
      customer_email: customerEmail,
      payment_method: paymentMethod,
      customer_transaction_id: customerTransactionId,
      status: 'pending_verification',
    }])

    if (insertError) {
      console.error('Error creating order:', insertError)
      return NextResponse.json({ error: insertError.message }, { status: 500 })
    }

    await supabase.from('rate_limit_log').insert([{ identifier: ip, action: 'order' }])

    // Notify me to go verify the payment
    const apiKey = process.env.RESEND_API_KEY
    const toEmail = process.env.NOTIFY_TO_EMAIL
    if (apiKey && toEmail) {
      try {
        await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({
            from: 'Portfolio Store <onboarding@resend.dev>',
            to: [toEmail],
            reply_to: customerEmail,
            subject: `New order: ${oneLine(product.name)} (${orderNumber})`,
            html: `
              <div style="font-family: sans-serif; max-width: 500px;">
                <h2 style="color: #aa002a;">New order awaiting verification</h2>
                <p><strong>Order:</strong> ${orderNumber}</p>
                <p><strong>Product:</strong> ${escapeHtml(product.name)} — $${escapeHtml(product.price)}</p>
                <p><strong>Amount to verify:</strong> ${currencyLocal === 'PKR' ? `Rs ${amountLocal.toLocaleString('en-PK')}` : `$${amountLocal}`}</p>
                <p><strong>Customer:</strong> ${escapeHtml(customerName)} (${escapeHtml(customerEmail)})</p>
                <p><strong>Paid via:</strong> ${METHOD_LABELS[paymentMethod] || paymentMethod}</p>
                <p><strong>Transaction ID given:</strong> ${escapeHtml(customerTransactionId)}</p>
                <p style="color: #9ca3af; font-size: 12px; margin-top: 16px;">
                  Confirm this transaction via ${METHOD_LABELS[paymentMethod] || paymentMethod}, then go to /admin/orders to verify and release the download link.
                </p>
              </div>
            `,
          }),
        })
      } catch (emailError) {
        console.error('Order notification email failed (order was still saved):', emailError)
      }
    }

    return NextResponse.json({ success: true, orderNumber })
  } catch (error) {
    console.error('Orders route error:', error)
    return NextResponse.json({ error: 'Unexpected error' }, { status: 500 })
  }
}
