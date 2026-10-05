import type { NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { timingSafeEqual, createHash } from 'crypto'
import { supabaseAdmin as supabase } from '@/lib/supabaseAdmin'
import { verifyPassword } from '@/lib/passwordHash'
import { verifyTotp } from '@/lib/totp'
import { logSecurityEvent } from '@/lib/audit'
import { isRateLimited, recordEvent } from '@/lib/rateLimit'

// Hashing both sides to a fixed-length digest first lets us use
// timingSafeEqual regardless of the two strings' actual lengths.
function safeCompare(a: string, b: string): boolean {
  const hashA = createHash('sha256').update(a).digest()
  const hashB = createHash('sha256').update(b).digest()
  return timingSafeEqual(hashA, hashB)
}

const MAX_ATTEMPTS = 5
const LOCKOUT_WINDOW_MINUTES = 15
let warnedLegacyPassword = false

function getClientIp(req: any): string {
  const forwarded = req?.headers?.['x-forwarded-for']
  if (typeof forwarded === 'string') return forwarded.split(',')[0].trim()
  return req?.headers?.['x-real-ip'] || 'unknown'
}

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" },
        code: { label: "Authentication code", type: "text" },
      },
      async authorize(credentials, req) {
        const ip = getClientIp(req)
        const userAgent = (req?.headers?.['user-agent'] as string | undefined)?.slice(0, 300) ?? null
        const windowStart = new Date(Date.now() - LOCKOUT_WINDOW_MINUTES * 60 * 1000).toISOString()

        // Too many recent failures from this address? Refuse before doing any work.
        const { count } = await supabase
          .from('login_attempts')
          .select('*', { count: 'exact', head: true })
          .eq('identifier', ip)
          .eq('success', false)
          .gte('created_at', windowStart)

        if ((count || 0) >= MAX_ATTEMPTS) {
          console.warn(`Login blocked — too many failed attempts from ${ip}`)
          await logSecurityEvent({ event: 'login_blocked', ip, userAgent })
          return null
        }

        // Preferred: ADMIN_PASSWORD_HASH (scrypt — generate with
        // `node scripts/admin-setup.mjs hash`). Legacy: ADMIN_PASSWORD in
        // plain text, still accepted so existing deployments keep working.
        // With neither set, login fails closed — there is no default password.
        const passwordHash = process.env.ADMIN_PASSWORD_HASH
        const legacyPassword = process.env.ADMIN_PASSWORD
        if (!passwordHash && !legacyPassword) {
          console.error('Neither ADMIN_PASSWORD_HASH nor ADMIN_PASSWORD is set — refusing all admin logins.')
          return null
        }

        const adminUsername = (process.env.ADMIN_USERNAME || 'qasim').toLowerCase()
        const givenUser = (credentials?.username || '').toLowerCase()
        const givenPass = credentials?.password || ''

        // Always evaluate EVERY factor, even once one has failed, so response
        // timing doesn't reveal which part was wrong.
        const userOk = safeCompare(givenUser, adminUsername)
        let passOk: boolean
        if (passwordHash) {
          passOk = !!givenPass && verifyPassword(givenPass, passwordHash)
        } else {
          if (!warnedLegacyPassword) {
            console.warn('Using plain-text ADMIN_PASSWORD. Switch to ADMIN_PASSWORD_HASH: node scripts/admin-setup.mjs hash')
            warnedLegacyPassword = true
          }
          passOk = !!givenPass && safeCompare(givenPass, legacyPassword!)
        }

        // Optional two-factor code, enabled by setting ADMIN_TOTP_SECRET.
        const totpSecret = process.env.ADMIN_TOTP_SECRET
        let totpStep: number | null = null
        let totpOk = true
        if (totpSecret) {
          try { totpStep = verifyTotp(totpSecret, credentials?.code || '') } catch { totpStep = null }
          totpOk = totpStep !== null
        }

        let ok = userOk && passOk && totpOk
        let reason: string | null = !userOk || !passOk ? 'credentials' : !totpOk ? 'two_factor_code' : null

        // A 6-digit code is valid for ~90s; refuse to accept the same one twice.
        if (ok && totpSecret && totpStep !== null) {
          const action = `totp:${totpStep}`
          if (await isRateLimited({ identifier: 'admin', action, max: 1, windowMinutes: 5 })) {
            ok = false
            reason = 'two_factor_replay'
          } else {
            await recordEvent('admin', action)
          }
        }

        await supabase.from('login_attempts').insert([{ identifier: ip, success: ok }])
        await logSecurityEvent({ event: ok ? 'login_success' : 'login_failed', ip, userAgent, detail: ok ? undefined : { reason } })

        if (!ok) return null
        return {
          id: '1',
          name: process.env.ADMIN_NAME || 'Qasim',
          email: process.env.ADMIN_EMAIL || 'qasimshibli12@gmail.com',
        }
      }
    })
  ],
  pages: {
    signIn: '/admin/login',
  },
  session: {
    strategy: 'jwt',
    // Backstop expiry even if the browser session somehow survives being
    // closed (see the cookie config below) — logs out automatically after
    // 8 hours of the session being issued either way.
    maxAge: 8 * 60 * 60, // 8 hours, in seconds
  },
  cookies: {
    sessionToken: {
      name:
        process.env.NODE_ENV === 'production'
          ? '__Secure-next-auth.session-token'
          : 'next-auth.session-token',
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production',
        // Deliberately no `maxAge` here — this makes it a browser *session*
        // cookie rather than a persistent one, so closing the browser
        // (all windows, not just the tab) clears it and the next visit to
        // /admin requires logging in again.
      },
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
}
