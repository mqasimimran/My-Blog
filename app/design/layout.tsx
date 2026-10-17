import type { Metadata } from 'next'

import { siteConfig } from '@/site.config'
export const metadata: Metadata = {
  title: 'Design',
  description: `A curated gallery of brand identities, UI/UX work, and graphic design projects by ${siteConfig.name}.`,
}

export default function DesignLayout({ children }: { children: React.ReactNode }) {
  return children
}
