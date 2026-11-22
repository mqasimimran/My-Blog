'use client'

import { asError } from '@/lib/asError'
import { supabase } from '@/lib/supabase'
import { optimizeImage } from '@/lib/imageOptimize'

const uploadedUrls = new Map<string, string>()

// Drop-in replacement for `supabase.storage` in admin pages.
//
//   supabase.storage.from('blog-images').upload(name, file)
//   -> adminStorage.from('blog-images').upload(name, file)
//
// Same call shape and same `{ data, error }` result, so existing upload
// code only needs the object swapped. Behind the scenes it first asks
// /api/admin/upload-url for permission (login + file type + size are
// checked there), then uploads directly to the configured storage provider.
// R2 public URLs are remembered for the existing upload/getPublicUrl call pair.
export const adminStorage = {
  from(bucket: string) {
    return {
      async upload(path: string, original: File | Blob, options?: { optimize?: boolean }) {
        try {
          uploadedUrls.delete(`${bucket}/${path}`)
          // Images are resized and compressed first (lib/imageOptimize.ts). The path stays the same,
          // so code that builds the public URL from it keeps working.
          // optimize: false keeps the file exactly as uploaded (e.g. full-resolution wallpapers).
          const file = options?.optimize === false ? original : await optimizeImage(original)
          const res = await fetch('/api/admin/upload-url', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ bucket, path, size: file.size, contentType: file.type }),
          })
          const json = await res.json()
          if (!res.ok) return { data: null, error: new Error(json.error || 'Upload not allowed') }

          if (json.provider === 'r2') {
            const result = await fetch(json.uploadUrl, { method: 'PUT', headers: { 'Content-Type': json.contentType }, body: file })
            if (!result.ok) throw new Error('R2 upload failed. Check the bucket CORS policy and try again.')
            uploadedUrls.set(`${bucket}/${path}`, json.publicUrl)
            uploadedUrls.set(`${bucket}/${json.path}`, json.publicUrl)
            return { data: { path: json.path, fullPath: json.path }, error: null }
          }

          const { data, error } = await supabase.storage
            .from(bucket)
            .uploadToSignedUrl(json.path, json.token, file)
          return { data, error }
        } catch (cause) {
          const err = asError(cause)
          return { data: null, error: err as Error }
        }
      },

      // Newly uploaded R2 files use the server-returned URL. Older uploads
      // retain the Supabase URL shape; saved database URLs are never rewritten.
      getPublicUrl(path: string) {
        const publicUrl = uploadedUrls.get(`${bucket}/${path}`)
        if (publicUrl) return { data: { publicUrl } }
        return supabase.storage.from(bucket).getPublicUrl(path)
      },
    }
  },
}
