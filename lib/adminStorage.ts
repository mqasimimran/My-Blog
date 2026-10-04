'use client'

import { supabase } from '@/lib/supabase'

// Drop-in replacement for `supabase.storage` in admin pages.
//
//   supabase.storage.from('blog-images').upload(name, file)
//   -> adminStorage.from('blog-images').upload(name, file)
//
// Same call shape and same `{ data, error }` result, so existing upload
// code only needs the object swapped. Behind the scenes it first asks
// /api/admin/upload-url for permission (login + file type + size are
// checked there), then uploads with the short-lived token it gets back —
// so the storage buckets no longer need to accept anonymous uploads.
export const adminStorage = {
  from(bucket: string) {
    return {
      async upload(path: string, file: File | Blob) {
        try {
          const res = await fetch('/api/admin/upload-url', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ bucket, path, size: file.size }),
          })
          const json = await res.json()
          if (!res.ok) return { data: null, error: new Error(json.error || 'Upload not allowed') }

          const { data, error } = await supabase.storage
            .from(bucket)
            .uploadToSignedUrl(json.path, json.token, file)
          return { data, error }
        } catch (err: any) {
          return { data: null, error: err as Error }
        }
      },

      // Building a public URL is a pure string operation — no permissions
      // involved — so this just delegates.
      getPublicUrl(path: string) {
        return supabase.storage.from(bucket).getPublicUrl(path)
      },
    }
  },
}
