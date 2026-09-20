import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Projects',
  description: 'A collection of software engineering, AI/ML, game development, and web projects by Muhammad Qasim Imran.',
}

export default function ProjectsLayout({ children }: { children: React.ReactNode }) {
  return children
}
