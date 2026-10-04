import 'server-only'
import type { NextRequest } from 'next/server'
import { supabaseAdmin } from '@/lib/supabaseAdmin'

export function getClientIp(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for')
  if (forwarded) return forwarded.split(',')[0].trim()
  return request.headers.get('x-real-ip') || 'unknown'
}

/**
 * Returns true if this identifier has already hit `max` events for
 * `action` inside the window. Call recordEvent() after a successful
 * action so it counts toward the limit.
 */
export async function isRateLimited(opts: {
  identifier: string
  action: string
  max: number
  windowMinutes: number
}): Promise<boolean> {
  const windowStart = new Date(Date.now() - opts.windowMinutes * 60 * 1000).toISOString()
  const { count } = await supabaseAdmin
    .from('rate_limit_log')
    .select('*', { count: 'exact', head: true })
    .eq('identifier', opts.identifier)
    .eq('action', opts.action)
    .gte('created_at', windowStart)
  return (count || 0) >= opts.max
}

export async function recordEvent(identifier: string, action: string) {
  await supabaseAdmin.from('rate_limit_log').insert([{ identifier, action }])
}
