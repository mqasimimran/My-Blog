import type { Metadata } from 'next'

import { siteConfig } from '@/site.config'
export const metadata: Metadata = {
  title: 'Contact',
  description: `Get in touch with ${siteConfig.name} for software engineering, web development, or design work.`,
}

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return children
}
