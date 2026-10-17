import type { Metadata } from 'next'

import { siteConfig } from '@/site.config'
export const metadata: Metadata = {
  title: 'My Journey',
  description: `A journal of how ${siteConfig.name} got from an intermediate CS student to a software engineer, designer, and indie game developer.`,
}

export default function AboutLayout({ children }: { children: React.ReactNode }) {
  return children
}
