import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabaseAdmin'
import { getClientIp, isRateLimited, recordEvent } from '@/lib/rateLimit'

// Counts taps on the Links page (link name + day only).
export async function POST(request: NextRequest) {
  const ip = getClientIp(request)
  if (await isRateLimited({ identifier: ip, action: 'link_click', max: 30, windowMinutes: 10 })) return NextResponse.json({ ok: true })
  const b = await request.json().catch(() => ({}))
  const label = typeof b.label === 'string' ? b.label.trim().replace(/\s+/g, ' ').slice(0, 80) : ''
  if (!label) return NextResponse.json({ ok: true })
  await recordEvent(ip, 'link_click')
  await supabaseAdmin.rpc('log_link_click', { p_label: label })
  return NextResponse.json({ ok: true })
}
