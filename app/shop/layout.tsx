import type { Metadata } from 'next'

import { siteConfig } from '@/site.config'
export const metadata: Metadata = {
  title: 'Shop',
  description: `Templates, design resources, and products from ${siteConfig.name}.`,
}

export default function ShopLayout({ children }: { children: React.ReactNode }) {
  return children
}
