import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Tech Stack',
  description: 'The hardware and software Muhammad Qasim Imran uses for game development, web engineering, AI/ML, and design.',
}

export default function TechStackLayout({ children }: { children: React.ReactNode }) {
  return children
}
