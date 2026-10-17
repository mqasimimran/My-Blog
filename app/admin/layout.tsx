import type { Metadata } from 'next'
import Providers from '@/app/components/Providers'

export const metadata: Metadata = {
  title: 'Admin',
  robots: { index: false, follow: false },
}

// The login session provider wraps the admin area only. Public pages don't need to know who is
// logged in, so they never make that request.
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <Providers>{children}</Providers>
}
