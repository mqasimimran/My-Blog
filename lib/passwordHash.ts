import { scryptSync, randomBytes, timingSafeEqual } from 'crypto'

// Admin password hashing with scrypt (built into Node — no dependency).
// Stored as:  scrypt:<N>:<r>:<p>:<salt>:<hash>   (base64url parts)
// Colon-separated on purpose: a `$`-style hash can get mangled by .env
// variable expansion when stored in Vercel / .env.local.
const KEYLEN = 64
const DEFAULTS = { N: 65536, r: 8, p: 1 }

function derive(password: string, salt: Buffer, N: number, r: number, p: number) {
  return scryptSync(password.normalize('NFKC'), salt, KEYLEN, { N, r, p, maxmem: 256 * 1024 * 1024 })
}

export function hashPassword(password: string): string {
  const salt = randomBytes(16)
  const { N, r, p } = DEFAULTS
  const hash = derive(password, salt, N, r, p)
  return ['scrypt', N, r, p, salt.toString('base64url'), hash.toString('base64url')].join(':')
}

export function verifyPassword(password: string, stored: string): boolean {
  const parts = stored.trim().split(':')
  if (parts.length !== 6 || parts[0] !== 'scrypt') return false
  const [, Ns, rs, ps, saltB64, hashB64] = parts
  const N = Number(Ns), r = Number(rs), p = Number(ps)
  if (!Number.isInteger(N) || !Number.isInteger(r) || !Number.isInteger(p)) return false
  try {
    const expected = Buffer.from(hashB64, 'base64url')
    const actual = derive(password, Buffer.from(saltB64, 'base64url'), N, r, p)
    return expected.length === actual.length && timingSafeEqual(expected, actual)
  } catch {
    return false
  }
}
