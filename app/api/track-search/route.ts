import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabaseAdmin'
import { getClientIp, isRateLimited, recordEvent } from '@/lib/rateLimit'

// Counts what visitors search for on the site (term + whether anything was found). No personal data.
export async function POST(request: NextRequest) {
  const ip = getClientIp(request)
  if (await isRateLimited({ identifier: ip, action: 'search_log', max: 30, windowMinutes: 10 })) return NextResponse.json({ ok: true })
  const b = await request.json().catch(() => ({}))
  const term = typeof b.q === 'string' ? b.q.trim().replace(/\s+/g, ' ').slice(0, 60) : ''
  if (term.length < 2 || /https?:|[<>]/.test(term)) return NextResponse.json({ ok: true })
  await recordEvent(ip, 'search_log')
  await supabaseAdmin.rpc('log_search', { p_term: term, p_found: !!b.found })
  return NextResponse.json({ ok: true })
}
