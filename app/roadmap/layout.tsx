import type { Metadata } from 'next'

import { siteConfig } from '@/site.config'
export const metadata: Metadata = {
  title: 'Roadmap',
  description: `What's planned, in progress, and shipped for ${siteConfig.name}'s projects and this site.`,
}

export default function RoadmapLayout({ children }: { children: React.ReactNode }) {
  return children
}
