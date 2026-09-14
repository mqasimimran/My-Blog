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
  secret: process.env.NEXTAUTH_SECRET,
})

{/* Next.js 15 App Router requirement for Auth Handlers */}
export { handler as GET, handler as POST }