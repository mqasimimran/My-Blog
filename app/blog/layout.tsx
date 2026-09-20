import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Blog',
  description: 'Writing on engineering, design, productivity, and the journey behind the projects — by Muhammad Qasim Imran.',
}

export default function BlogLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <article className="prose lg:prose-xl mx-auto px-6 py-12 text-gray-800">
      {children}
    </article>
  )
}