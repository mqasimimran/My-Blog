import type { Metadata } from 'next'

import { siteConfig } from '@/site.config'
export const metadata: Metadata = {
  title: 'Services',
  description: `Web development, graphic design, UI/UX, and game development services offered by ${siteConfig.name}.`,
}

export default function ServicesLayout({ children }: { children: React.ReactNode }) {
  return children
}
