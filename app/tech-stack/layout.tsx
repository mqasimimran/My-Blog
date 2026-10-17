import type { Metadata } from 'next'

import { siteConfig } from '@/site.config'
export const metadata: Metadata = {
  title: 'Tech Stack',
  description: `The hardware and software ${siteConfig.name} uses for game development, web engineering, AI/ML, and design.`,
}

export default function TechStackLayout({ children }: { children: React.ReactNode }) {
  return children
}
