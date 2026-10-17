import { NextRequest, NextResponse } from 'next/server'
import { requireAdminSession } from '@/lib/requireAdminSession'
import { fulfillOrder } from '@/lib/fulfillOrder'

export async function POST(request: NextRequest) {
  // This marks an order paid and emails the customer their paid download
  // link — it must only ever be triggered by you, from /admin/orders,
  // after you've manually verified the payment.
  const unauthorized = await requireAdminSession()
  if (unauthorized) return unauthorized

  try {
    const { orderId } = await request.json()
    if (!orderId || typeof orderId !== 'string') return NextResponse.json({ error: 'Missing orderId' }, { status: 400 })

    // Idempotent: clicking twice (or a
    // double-click) no longer issues a second download token, decrements
    // stock again, or sends a second email.
    const result = await fulfillOrder(orderId)
    if (!result.ok) return NextResponse.json({ error: result.error }, { status: result.status })

    // The order is paid either way — but the admin UI needs to know whether
    // the email itself failed, not assume success because the update worked.
    return NextResponse.json({
      success: true,
      alreadyPaid: result.alreadyPaid,
      downloadUrl: result.downloadUrl,
      emailSent: result.emailSent,
      emailError: result.emailError,
    })
  } catch (error) {
    console.error('notify-customer error:', error)
    return NextResponse.json({ error: 'Unexpected error' }, { status: 500 })
  }
}
