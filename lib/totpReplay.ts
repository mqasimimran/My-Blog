import 'server-only'
import { supabaseAdmin } from '@/lib/supabaseAdmin'

export type ClaimResult = 'ok' | 'replay' | 'error'

/**
 * Atomically claims a 2FA time step. Each step can be claimed exactly once:
 *   'ok'      first use — proceed with the login
 *   'replay'  this code was already used — refuse
 *   'error'   the replay store itself is broken — refuse (fail CLOSED).
 *
 * Failing closed matters: if this check silently passed whenever the
 * database misbehaved, a captured code could be reused indefinitely and
 * nobody would notice. A visible failed login is better than an invisible hole.
 */
export async function claimTotpStep(step: number): Promise<ClaimResult> {
  const { error } = await supabaseAdmin.from('admin_totp_used').insert([{ step }])
  if (!error) {
    // Housekeeping: codes older than ~10 minutes can never be replayed anyway.
    try { await supabaseAdmin.from('admin_totp_used').delete().lt('step', step - 20) } catch { /* best effort */ }
    return 'ok'
  }
  if (error.code === '23505') return 'replay'
  console.error(
    `2FA replay store failed (${error.code || 'no code'}): ${error.message}. ` +
    `Logins with 2FA are being REFUSED until this is fixed — have you run supabase/migrations/admin-totp-used.sql?`
  )
  return 'error'
}
