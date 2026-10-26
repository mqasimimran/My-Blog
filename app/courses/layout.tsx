import type { Metadata } from 'next'
import { pageMeta } from '@/lib/seo'

export const metadata: Metadata = pageMeta({ title: 'Free courses', description: 'Free short courses on AI, computer science and design, with quizzes and progress tracking. Learn at your own pace.', path: '/courses' })
export default function Layout({ children }: { children: React.ReactNode }) { return children }
