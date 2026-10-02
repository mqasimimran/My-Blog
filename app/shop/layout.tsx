import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Shop',
  description: 'Templates, design resources, and products from Muhammad Qasim Imran.',
}

export default function ShopLayout({ children }: { children: React.ReactNode }) {
  return children
}
