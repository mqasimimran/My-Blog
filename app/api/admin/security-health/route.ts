import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabaseAdmin'
import { requireAdminSession } from '@/lib/requireAdminSession'

type Check = { id: string; label: string; status: 'ok' | 'warn' | 'fail'; hint?: string }

// Powers the "Protection status" panel on /admin/security. It reports what
// is actually configured and actually working — including trying a real
// write to the tables that login protection depends on — so a silently
// broken safeguard shows up as a red line with the real error message.
export async function GET() {
  const denied = await requireAdminSession()
  if (denied) return denied

  const checks: Check[] = []
  const hasHash = !!process.env.ADMIN_PASSWORD_HASH
  const hasLegacy = !!process.env.ADMIN_PASSWORD
  const totp = !!process.env.ADMIN_TOTP_SECRET

  checks.push(
    hasHash
      ? { id: 'pw', label: 'Admin password is stored as a hash', status: 'ok' }
      : hasLegacy
        ? { id: 'pw', label: 'Admin password is stored in plain text', status: 'warn', hint: 'Run `node scripts/admin-setup.mjs hash`, add ADMIN_PASSWORD_HASH, then delete ADMIN_PASSWORD.' }
        : { id: 'pw', label: 'No admin password configured', status: 'fail', hint: 'Set ADMIN_PASSWORD_HASH — logins are being refused.' }
  )
  checks.push(
    totp
      ? { id: '2fa', label: 'Two-factor login is ON', status: 'ok' }
      : { id: '2fa', label: 'Two-factor login is OFF', status: 'warn', hint: 'Optional but recommended: `node scripts/admin-setup.mjs totp`.' }
  )

  // 2FA replay store: only matters when 2FA is on. Claim a step that can
  // never be real, twice — the second claim MUST be refused for replay
  // protection to be working.
  if (totp) {
    const probe = 1
    await supabaseAdmin.from('admin_totp_used').delete().eq('step', probe)
    const first = await supabaseAdmin.from('admin_totp_used').insert([{ step: probe }])
    const second = await supabaseAdmin.from('admin_totp_used').insert([{ step: probe }])
    await supabaseAdmin.from('admin_totp_used').delete().eq('step', probe)
    if (first.error) {
      checks.push({ id: 'replay', label: '2FA replay protection is NOT working', status: 'fail', hint: `Database said: ${first.error.message}. Run supabase/migrations/admin-totp-used.sql. Until then 2FA logins are refused.` })
    } else if (second.error?.code !== '23505') {
      checks.push({ id: 'replay', label: '2FA replay protection is NOT working', status: 'fail', hint: 'The table accepts the same code twice — it is missing its PRIMARY KEY. Re-run supabase/migrations/admin-totp-used.sql.' })
    } else {
      checks.push({ id: 'replay', label: '2FA codes can only be used once', status: 'ok' })
    }
  }

  // Login lockout depends on being able to read AND write login_attempts.
  // A real (non-HEAD) read: the Supabase client reports a count-only request
  // to a missing table as success, which would show a false green here.
  const la = await supabaseAdmin.from('login_attempts').select('identifier').limit(1)
  checks.push(
    la.error
      ? { id: 'lockout', label: 'Failed-login lockout is NOT working', status: 'fail', hint: `Database said: ${la.error.message}` }
      : { id: 'lockout', label: 'Failed-login lockout can read its log', status: 'ok' }
  )

  // Public-form rate limiting: do a real write + cleanup.
  const w = await supabaseAdmin.from('rate_limit_log').insert([{ identifier: 'healthcheck', action: 'healthcheck' }])
  if (w.error) {
    checks.push({ id: 'ratelimit', label: 'Rate limiting (contact, newsletter, reactions) is NOT working', status: 'fail', hint: `Database said: ${w.error.message}` })
  } else {
    await supabaseAdmin.from('rate_limit_log').delete().eq('identifier', 'healthcheck')
    checks.push({ id: 'ratelimit', label: 'Rate limiting can record events', status: 'ok' })
  }

  const audit = await supabaseAdmin.from('security_audit_log').select('id').limit(1)
  checks.push(
    audit.error
      ? { id: 'audit', label: 'Security log is NOT working', status: 'fail', hint: `Database said: ${audit.error.message}. Run supabase/migrations/security-audit-log.sql.` }
      : { id: 'audit', label: 'Security log is recording', status: 'ok' }
  )

  return NextResponse.json({ checks })
}
