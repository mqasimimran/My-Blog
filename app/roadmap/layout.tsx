import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Roadmap',
  description: "What's planned, in progress, and shipped for Muhammad Qasim Imran's projects and this site.",
}

export default function RoadmapLayout({ children }: { children: React.ReactNode }) {
  return children
}
