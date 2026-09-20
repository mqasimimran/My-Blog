import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Contact',
  description: "Get in touch with Muhammad Qasim Imran for software engineering, web development, or design work.",
}

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return children
}
