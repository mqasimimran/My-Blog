import NextAuth from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

const MAX_ATTEMPTS = 5
const LOCKOUT_WINDOW_MINUTES = 15

function getClientIp(req: any): string {
  const forwarded = req?.headers?.['x-forwarded-for']
  if (typeof forwarded === 'string') return forwarded.split(',')[0].trim()
  return req?.headers?.['x-real-ip'] || 'unknown'
}

const handler = NextAuth({
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials, req) {
        const ip = getClientIp(req)
        const windowStart = new Date(Date.now() - LOCKOUT_WINDOW_MINUTES * 60 * 1000).toISOString()

        // Check how many failed attempts this IP has made recently
        const { count } = await supabase
          .from('login_attempts')
          .select('*', { count: 'exact', head: true })
          .eq('identifier', ip)
          .eq('success', false)
          .gte('created_at', windowStart)

        if ((count || 0) >= MAX_ATTEMPTS) {
          console.warn(`Login blocked — too many failed attempts from ${ip}`)
          return null
        }

        // Hardcoded admin check for your personal portfolio CMS
        const adminUser = { id: "1", name: "Qasim", email: "qasimshibli12@gmail.com" }
        const adminPassword = process.env.ADMIN_PASSWORD || "Qasim123"

        // Using toLowerCase() allows you to log in whether you type 'Qasim' or 'qasim'
        const isValid = credentials?.username?.toLowerCase() === "qasim" && credentials?.password === adminPassword

        // Log every attempt, success or failure, so the lockout window has data
        await supabase.from('login_attempts').insert([{ identifier: ip, success: isValid }])

        if (isValid) return adminUser
        return null
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
})

{/* Next.js 15 App Router requirement for Auth Handlers */}
export { handler as GET, handler as POST }