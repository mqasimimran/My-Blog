import { isIP } from 'node:net'

export function clientIp(read: (name: string) => string | null | undefined): string {
  // Vercel supplies this header. Other hosts must explicitly trust their ingress proxy.
  const address = process.env.VERCEL === '1' ? (read('x-vercel-forwarded-for') || read('x-forwarded-for'))
    : process.env.TRUST_PROXY === '1' ? read('x-forwarded-for') : null
  const ip = address?.split(',')[0]?.trim()
  return ip && isIP(ip) ? ip : 'unknown'
}
