import type { Metadata } from 'next'

// Private design reviews: never indexed.
export const metadata: Metadata = { title: 'Design review', robots: { index: false, follow: false } }
export default function Layout({ children }: { children: React.ReactNode }) { return children }
