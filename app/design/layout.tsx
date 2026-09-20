import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Design',
  description: 'A curated gallery of brand identities, UI/UX work, and graphic design projects by Muhammad Qasim Imran.',
}

export default function DesignLayout({ children }: { children: React.ReactNode }) {
  return children
}
