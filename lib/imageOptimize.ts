'use client'

// Smart uploads: before an image is uploaded from the admin, it is resized so its longest side is at
// most 2400px and re-encoded as WebP (transparency kept). Photos straight from a phone or camera
// often shrink several times over, so pages load faster. Left alone: SVG, GIF (keeps animation),
// anything that isn't an image, small images, and browsers that can't encode WebP. If optimising
// doesn't make the file smaller, the original is uploaded instead.
const MAX_SIDE = 2400
const SKIP_BELOW = 300 * 1024 // already small and not oversized: leave it
const QUALITY = 0.82

export async function optimizeImage<T extends File | Blob>(file: T): Promise<T | File | Blob> {
  if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) return file
  try {
    const bitmap = await createImageBitmap(file)
    const scale = Math.min(1, MAX_SIDE / Math.max(bitmap.width, bitmap.height))
    if (scale === 1 && file.size < SKIP_BELOW) {
      bitmap.close()
      return file
    }
    const width = Math.round(bitmap.width * scale)
    const height = Math.round(bitmap.height * scale)
    const canvas = document.createElement('canvas')
    canvas.width = width
    canvas.height = height
    const ctx = canvas.getContext('2d')
    if (!ctx) return file
    ctx.imageSmoothingQuality = 'high'
    ctx.drawImage(bitmap, 0, 0, width, height)
    bitmap.close()
    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/webp', QUALITY))
    if (!blob || blob.type !== 'image/webp' || blob.size >= file.size) return file
    const name = (file as File).name
    return name ? new File([blob], name, { type: 'image/webp' }) : blob
  } catch {
    return file
  }
}
