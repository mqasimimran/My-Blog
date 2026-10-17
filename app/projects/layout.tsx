import type { Metadata } from 'next'

import { siteConfig } from '@/site.config'
export const metadata: Metadata = {
  title: 'Projects',
  description: `A collection of software engineering, AI/ML, game development, and web projects by ${siteConfig.name}.`,
}

export default function ProjectsLayout({ children }: { children: React.ReactNode }) {
  return children
}
