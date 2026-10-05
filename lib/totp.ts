import { createHmac, timingSafeEqual } from 'crypto'

// RFC 6238 time-based one-time passwords (what Google Authenticator,
// Authy, 1Password etc. generate). No dependency needed.
const B32 = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567'

export function base32Decode(input: string): Buffer {
  const clean = input.replace(/[\s=-]/g, '').toUpperCase()
  let bits = 0, value = 0
  const out: number[] = []
  for (const ch of clean) {
    const idx = B32.indexOf(ch)
    if (idx === -1) throw new Error('Invalid base32 secret')
    value = (value << 5) | idx
    bits += 5
    if (bits >= 8) { out.push((value >>> (bits - 8)) & 0xff); bits -= 8 }
  }
  return Buffer.from(out)
}

export function base32Encode(buf: Buffer): string {
  let bits = 0, value = 0, out = ''
  for (const byte of buf) {
    value = (value << 8) | byte
    bits += 8
    while (bits >= 5) { out += B32[(value >>> (bits - 5)) & 31]; bits -= 5 }
  }
  if (bits > 0) out += B32[(value << (5 - bits)) & 31]
  return out
}

export function hotp(secret: Buffer, counter: number, digits = 6): string {
  const buf = Buffer.alloc(8)
  buf.writeBigUInt64BE(BigInt(counter))
  const h = createHmac('sha1', secret).update(buf).digest()
  const off = h[h.length - 1] & 0xf
  const bin = ((h[off] & 0x7f) << 24) | (h[off + 1] << 16) | (h[off + 2] << 8) | h[off + 3]
  return String(bin % 10 ** digits).padStart(digits, '0')
}

/**
 * Returns the matching 30-second time step if `code` is valid for the
 * current time (±`window` steps to allow clock drift), otherwise null.
 * The caller should remember used steps to block replay of a code.
 */
export function verifyTotp(secretB32: string, code: string, nowMs = Date.now(), window = 1): number | null {
  const digits = (code || '').replace(/\D/g, '')
  if (digits.length !== 6) return null
  const secret = base32Decode(secretB32)
  const step = Math.floor(nowMs / 1000 / 30)
  let matched: number | null = null
  for (let w = -window; w <= window; w++) {
    const expected = Buffer.from(hotp(secret, step + w))
    const given = Buffer.from(digits)
    if (expected.length === given.length && timingSafeEqual(expected, given) && matched === null) matched = step + w
  }
  return matched
}
