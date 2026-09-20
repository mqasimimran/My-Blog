import NextAuth from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"

const handler = NextAuth({
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        // Hardcoded admin check for your personal portfolio CMS
        const adminUser = { id: "1", name: "Qasim", email: "qasimshibli12@gmail.com" }
        const adminPassword = process.env.ADMIN_PASSWORD || "Qasim123"

        // Using toLowerCase() allows you to log in whether you type 'Qasim' or 'qasim'
        if (credentials?.username?.toLowerCase() === "qasim" && credentials?.password === adminPassword) {
          return adminUser
        }
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