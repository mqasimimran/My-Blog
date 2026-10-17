import type { Metadata } from 'next'

import { siteConfig } from '@/site.config'
export const metadata: Metadata = {
  title: 'Blog',
  description: `Writing on engineering, design, productivity, and the journey behind the projects, by ${siteConfig.name}.`,
}

export default function BlogLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}