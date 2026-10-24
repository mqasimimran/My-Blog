import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabaseAdmin'

// Free wallpapers: sends the visitor to the chosen resolution's file. Paid ones are refused here
// (they're delivered after payment, on the order's download page).
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const i = Number(request.nextUrl.searchParams.get('i'))
  const { data } = await supabaseAdmin.from('products').select('type, price, active, wallpaper_files').eq('id', (await params).id).maybeSingle()
  if (!data?.active || data.type !== 'wallpaper') return NextResponse.json({ error: 'Not found' }, { status: 404 })
  if (Number(data.price) !== 0) return NextResponse.json({ error: 'This wallpaper is paid. Buy it to download.' }, { status: 403 })
  const file = ((data.wallpaper_files as any[]) || []).filter((f) => f?.url)[i]
  if (!Number.isInteger(i) || !file) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.redirect(file.url, 302)
}
