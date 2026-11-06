import { createHmac, timingSafeEqual } from 'node:crypto'

export function inviteToken(code: string, work: string) {
  if (!work) return code // Existing general links stay valid.
  const secret = process.env.NEXTAUTH_SECRET
  if (!secret) throw new Error('Missing session secret')
  return createHmac('sha256', secret).update(JSON.stringify([code, work])).digest('hex')
}
export function matchesInvite(token: string, code: string, work: string) {
  if (!token || !code) return false
  const expected = Buffer.from(inviteToken(code, work)), actual = Buffer.from(token)
  return actual.length === expected.length && timingSafeEqual(actual, expected)
}
