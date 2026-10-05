import { getServerSession } from "next-auth"
import { headers } from "next/headers"
import { NextResponse } from "next/server"
import { authOptions } from "@/lib/authOptions"
import { logSecurityEvent, requestMeta } from "@/lib/audit"
import { isRateLimited, recordEvent } from "@/lib/rateLimit"

/**
 * Gate for every admin-only API route. Returns null when the request is
 * allowed to proceed; otherwise returns the error response to send back
 * (the caller should return it immediately, before touching any data).
 *
 *   const denied = await requireAdminSession()
 *   if (denied) return denied
 *
 * Two checks, in order:
 *  1. Same-origin only. Browsers label every request with where it came
 *     from (Sec-Fetch-Site / Origin). The admin API is only ever called by
 *     your own pages, so anything cross-site is refused outright — this is
 *     a second wall against cross-site request forgery on top of the
 *     SameSite session cookie.
 *  2. A valid logged-in admin session.
 */
export async function requireAdminSession() {
  const h = await headers()
  const { ip, userAgent } = requestMeta(h)

  const site = h.get('sec-fetch-site')
  const origin = h.get('origin')
  const host = h.get('x-forwarded-host') || h.get('host')
  let crossSite = site === 'cross-site' || site === 'same-site'
  if (!crossSite && origin && host) {
    try { crossSite = new URL(origin).host !== host } catch { crossSite = true }
  }
  if (crossSite) {
    await logSecurityEvent({ event: 'admin_cross_site_blocked', ip, userAgent, detail: { site, origin } })
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const session = await getServerSession(authOptions)
  if (!session) {
    // Log unauthorized probing, but at most once a minute per address so
    // an attacker hammering the endpoint can't flood the audit table.
    if (!(await isRateLimited({ identifier: ip, action: 'audit-unauthorized', max: 1, windowMinutes: 1 }))) {
      await recordEvent(ip, 'audit-unauthorized')
      await logSecurityEvent({ event: 'admin_unauthorized', ip, userAgent })
    }
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  return null
}
