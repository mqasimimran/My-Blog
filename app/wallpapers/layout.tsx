import type { Metadata } from 'next'
import { pageMeta } from '@/lib/seo'

export const metadata: Metadata = pageMeta({ title: 'Wallpapers', description: 'Free and premium wallpapers for phone, desktop and tablet, designed by me, in several resolutions including 4K.', path: '/wallpapers' })
export default function Layout({ children }: { children: React.ReactNode }) { return children }
