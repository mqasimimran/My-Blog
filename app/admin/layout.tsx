import type { Metadata } from 'next'
import IdleLogout from '@/app/components/IdleLogout'

export const metadata: Metadata = {
  title: 'Admin',
  robots: { index: false, follow: false },
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <IdleLogout />
      {children}
    </>
  )
}
