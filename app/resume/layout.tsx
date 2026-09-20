import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Resume',
  description: 'Experience, projects, education, and certifications for Muhammad Qasim Imran — Computer Science undergraduate and developer.',
}

export default function ResumeLayout({ children }: { children: React.ReactNode }) {
  return children
}
