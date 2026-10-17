'use client'

import Image, { type ImageProps } from 'next/image'
import { useState } from 'react'

/** An image address we can safely hand to next/image: a path on this site, or an absolute http(s) URL. */
export function isUsableImageSrc(src: unknown): boolean {
  return typeof src === 'string' && ((src.startsWith('/') && !src.startsWith('//')) || /^https?:\/\//i.test(src))
}

/**
 * Drop-in replacement for next/image for pictures whose address was TYPED INTO
 * THE ADMIN PANEL (logos, cover images, avatars…).
 *
 * next/image THROWS on a malformed address, and one thrown error blanks the
 * whole page it sits on — so a single mistyped logo URL could take down the
 * homepage. This renders nothing for an unusable address, and hides itself if
 * the picture fails to load, so a bad entry only ever costs you that one image.
 */
export default function SafeImage(props: ImageProps) {
  const [failed, setFailed] = useState(false)
  if (failed || (typeof props.src === 'string' && !isUsableImageSrc(props.src))) return null
  return (
    <Image
      {...props}
      onError={(e) => {
        setFailed(true)
        props.onError?.(e)
      }}
    />
  )
}
