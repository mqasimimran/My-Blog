import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabaseAdmin'

// Resolves a buyer's secret download token to their order + the paid file
// link. Replaces two direct browser queries (orders, then products'
// digital_file_url) that required both tables to be publicly readable —
// which would have exposed every customer's order and every paid file URL.
export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get('token')
  if (!token || token.length > 200) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const { data: order } = await supabaseAdmin
    .from('orders')
    .select('product_name, customer_name, status, product_id')
    .eq('download_token', token)
    .eq('status', 'paid')
    .maybeSingle()
  if (!order) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  let fileUrl: string | null = null
  if (order.product_id) {
    const { data: product } = await supabaseAdmin
      .from('products')
      .select('digital_file_url')
      .eq('id', order.product_id)
      .maybeSingle()
    fileUrl = product?.digital_file_url || null
  }

  return NextResponse.json({
    order: { product_name: order.product_name, customer_name: order.customer_name, status: order.status },
    fileUrl,
  })
}
