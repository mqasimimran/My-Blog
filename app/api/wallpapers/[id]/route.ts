import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabaseAdmin'

// A wallpaper's available resolutions (labels and sizes only, never the file links).
export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { data } = await supabaseAdmin.from('products').select('type, price, active, wallpaper_files').eq('id', (await params).id).maybeSingle()
  if (!data?.active || data.type !== 'wallpaper') return NextResponse.json({ sizes: [] }, { status: 404 })
  const sizes = ((data.wallpaper_files as any[]) || []).filter((f) => f?.url).map((f, i) => ({ index: i, label: String(f.label || ''), width: Number(f.width) || null, height: Number(f.height) || null }))
  return NextResponse.json({ free: Number(data.price) === 0, sizes }, { headers: { 'Cache-Control': 'public, s-maxage=60' } })
}
