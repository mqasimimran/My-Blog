import { withAuth } from "next-auth/middleware"

export default withAuth({
  pages: {
    signIn: '/admin/login', // Tells NextAuth to allow public access to this specific page
  },
})

export const config = {
  matcher: ["/admin/:path*"]
}