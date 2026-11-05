import type { ComponentPropsWithoutRef } from 'react'
import { responsive } from '@/lib/img'

type Props = Omit<ComponentPropsWithoutRef<'img'>, 'src' | 'srcSet'> & {
  src?: string | null
  alt: string
  quality?: number
}

// Uploaded artwork keeps its natural proportions. Offer resized variants for supported
// sources while local file previews, payment screenshots and external links load directly.
export default function SiteImage({ src, alt, quality, sizes = '100vw', ...props }: Props) {
  if (!src) return null
  const variants = responsive(src, sizes, quality)
  return (
    <picture className="contents">
      {variants.srcSet && <source srcSet={variants.srcSet} sizes={sizes} />}
      <img {...props} src={src} alt={alt} />
    </picture>
  )
}
