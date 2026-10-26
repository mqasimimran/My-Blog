import type { Metadata } from 'next'
import { pageMeta } from '@/lib/seo'

export const metadata: Metadata = pageMeta({ title: 'Links', description: 'All my links in one place: portfolio, blog, shop, YouTube, LinkedIn and Instagram.', path: '/links' })
export default function Layout({ children }: { children: React.ReactNode }) { return children }
