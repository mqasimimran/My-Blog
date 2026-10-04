'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { adminStorage } from '@/lib/adminStorage'
import { adminApi } from '@/lib/adminApi'
import AdminNav from '@/app/admin/AdminNav'

export default function NewLogoPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [file, setFile] = useState<File | null>(null)
  const [darkFile, setDarkFile] = useState<File | null>(null)
  const [formData, setFormData] = useState({ name: '', link_url: '', order_index: 0 })

  async function uploadImage(f: File): Promise<string> {
    const fileExt = f.name.split('.').pop()
    const fileName = `${Math.random()}.${fileExt}`
    const { error: uploadError } = await adminStorage.from('resume-images').upload(fileName, f)
    if (uploadError) throw uploadError
    const { data } = adminStorage.from('resume-images').getPublicUrl(fileName)
    return data.publicUrl
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!file) return alert('Please select a logo image.')

    setLoading(true)
    try {
      const imageUrl = await uploadImage(file)
      const darkImageUrl = darkFile ? await uploadImage(darkFile) : null

      let dbError: any = null
      try { await adminApi.insert('client_logos', {
        name: formData.name,
        link_url: formData.link_url || null,
        order_index: formData.order_index,
        image_url: imageUrl,
        dark_image_url: darkImageUrl,
      }) } catch (e: any) { dbError = e }

      if (dbError) throw dbError

      alert('Logo added — it will appear in the homepage "Work Seen At" strip.')
      router.push('/admin/logos')
    } catch (error: any) {
      alert('Error: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-paper flex">
      <AdminNav />
      <main className="flex-1 p-10 overflow-y-auto">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-2xl font-light tracking-wide uppercase text-ink-900 mb-6">Add Client Logo</h1>
          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="text" placeholder="Organization name (e.g. TEDxUMT)" required
              className="w-full p-3 border border-ink-100 rounded-none text-sm bg-paper text-ink-900"
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
            <input
              type="url" placeholder="Link to their site (optional)"
              className="w-full p-3 border border-ink-100 rounded-none text-sm bg-paper text-ink-900"
              onChange={(e) => setFormData({ ...formData, link_url: e.target.value })}
            />
            <input
              type="number" placeholder="Order (lower shows first)" required
              className="w-full p-3 border border-ink-100 rounded-none text-sm bg-paper text-ink-900"
              onChange={(e) => setFormData({ ...formData, order_index: parseInt(e.target.value) || 0 })}
            />

            <div className="border-2 border-dashed border-ink-100 p-6 text-center rounded-none">
              <label className="block text-xs text-ink-500 mb-2">Logo image (required)</label>
              <input type="file" accept="image/*" onChange={(e) => setFile(e.target.files?.[0] || null)} />
            </div>

            <div className="border-2 border-dashed border-ink-100 p-6 text-center rounded-none">
              <label className="block text-xs text-ink-500 mb-2">
                Dark-mode variant (optional) — a lighter-colored version of the same logo, shown when the site is in dark mode. Leave blank to just reuse the image above in both modes.
              </label>
              <input type="file" accept="image/*" onChange={(e) => setDarkFile(e.target.files?.[0] || null)} />
            </div>

            <button type="submit" disabled={loading} className="w-full bg-accent-600 text-white text-xs font-bold tracking-widest uppercase py-4 rounded-none hover:bg-gray-900 transition-colors">
              {loading ? 'Uploading...' : 'Save Logo'}
            </button>
          </form>
        </div>
      </main>
    </div>
  )
}
