import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Services',
  description: 'Web development, graphic design, UI/UX, and game development services offered by Muhammad Qasim Imran.',
}

export default function ServicesLayout({ children }: { children: React.ReactNode }) {
  return children
}
