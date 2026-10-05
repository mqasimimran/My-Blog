import 'server-only'
import { supabaseAdmin } from '@/lib/supabaseAdmin'

export function requestMeta(headers: Headers) {
  const ip = (headers.get('x-forwarded-for') || '').split(',')[0].trim() || headers.get('x-real-ip') || 'unknown'
  return { ip, userAgent: (headers.get('user-agent') || '').slice(0, 300) || null }
}

/**
 * Appends a row to security_audit_log. Best-effort by design: a logging
 * failure must never break (or reveal anything about) the request being
 * logged, so every error is swallowed.
 *
 * Never put secrets or full content in `detail` — only identifiers and
 * field NAMES (what changed, not the values).
 */
export async function logSecurityEvent(e: {
  event: string
  ip?: string
  userAgent?: string | null
  detail?: Record<string, unknown>
}) {
  try {
    await supabaseAdmin.from('security_audit_log').insert([
      { event: e.event, ip: e.ip ?? null, user_agent: e.userAgent ?? null, detail: e.detail ?? null },
    ])
  } catch {
    /* intentionally ignored */
  }
}
