'use client'

import { usePathname } from 'next/navigation'

// Renders its children everywhere except the admin area, which has its own navigation.
export default function PublicOnly({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  if (pathname?.startsWith('/admin')) return null
  return <>{children}</>
}
