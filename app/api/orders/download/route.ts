import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabaseAdmin'

// Resolves a buyer's secret download token to their order + the paid file
// link(s). Replaces two direct browser queries (orders, then products'
// digital_file_url) that required both tables to be publicly readable —
// which would have exposed every customer's order and every paid file URL.
// A bundle returns one file per product it contains, in the order chosen in the admin.
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

  let files: { name: string; url: string }[] = []
  if (order.product_id) {
    const { data: product } = await supabaseAdmin.from('products').select('*').eq('id', order.product_id).maybeSingle()
    const ids: string[] = product?.type === 'bundle' && Array.isArray(product.bundle_items) ? product.bundle_items : []
    if (product?.type === 'wallpaper' && Array.isArray(product.wallpaper_files)) {
      files = (product.wallpaper_files as any[]).filter((f) => f?.url).map((f) => ({ name: `${product.name}: ${f.label}${f.width && f.height ? ` (${f.width} × ${f.height})` : ''}`, url: f.url }))
    } else if (ids.length) {
      const { data: items } = await supabaseAdmin.from('products').select('id, name, digital_file_url').in('id', ids)
      files = ids
        .map((id) => items?.find((i) => i.id === id))
        .filter((i): i is { id: string; name: string; digital_file_url: string } => !!i?.digital_file_url)
        .map((i) => ({ name: i.name, url: i.digital_file_url }))
    } else if (product?.digital_file_url) {
      files = [{ name: product.name, url: product.digital_file_url }]
    }
  }

  return NextResponse.json({
    order: { product_name: order.product_name, customer_name: order.customer_name, status: order.status },
    fileUrl: files[0]?.url || null,
    files,
  })
}
