import { NextRequest, NextResponse } from 'next/server'
import { getClientIp, isRateLimited, recordEvent } from '@/lib/rateLimit'
import { recordError } from '@/lib/errors'

// Errors from visitors' browsers (sent by components/ErrorReporter).
export async function POST(request: NextRequest) {
  const ip = getClientIp(request)
  if (await isRateLimited({ identifier: ip, action: 'error_report', max: 20, windowMinutes: 10 })) return NextResponse.json({ ok: true })
  const b = await request.json().catch(() => ({}))
  if (typeof b.message !== 'string') return NextResponse.json({ ok: true })
  await recordEvent(ip, 'error_report')
  await recordError({ source: 'browser', message: b.message, url: typeof b.url === 'string' ? b.url : '', detail: typeof b.stack === 'string' ? b.stack : '' })
  return NextResponse.json({ ok: true })
}
