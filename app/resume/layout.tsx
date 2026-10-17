import type { Metadata } from 'next'

import { siteConfig } from '@/site.config'
export const metadata: Metadata = {
  title: 'Resume',
  description: `Experience, projects, education, and certifications for ${siteConfig.name}, Computer Science undergraduate and developer.`,
}

export default function ResumeLayout({ children }: { children: React.ReactNode }) {
  return children
}
