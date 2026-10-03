import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Blog',
  description: 'Writing on engineering, design, productivity, and the journey behind the projects — by Muhammad Qasim Imran.',
}

export default function BlogLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}