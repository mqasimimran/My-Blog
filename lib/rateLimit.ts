import 'server-only'
import type { NextRequest } from 'next/server'
import { supabaseAdmin } from '@/lib/supabaseAdmin'

import { clientIp } from '@/lib/clientIp'

export function getClientIp(request: NextRequest) {
  return clientIp(name => request.headers.get(name))
}

// Reserve the attempt before performing work. A failed reservation never grants access.
export async function isRateLimited(opts: {
  identifier: string; action: string; max: number; windowMinutes: number
}): Promise<boolean> {
  const { data, error } = await supabaseAdmin.rpc('consume_rate_limit', {
    p_identifier: opts.identifier, p_action: opts.action, p_max: opts.max, p_minutes: opts.windowMinutes,
  })
  if (error) console.error('Rate limit unavailable for '+opts.action, error.code)
  return !!error || data !== true
}
