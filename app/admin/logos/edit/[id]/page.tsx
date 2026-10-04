'use client'

import { useState, useEffect, use } from 'react'
import { useRouter } from 'next/navigation'
import { adminStorage } from '@/lib/adminStorage'
import { adminApi } from '@/lib/adminApi'
import AdminNav from '@/app/admin/AdminNav'

export default function EditLogoPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [isFetching, setIsFetching] = useState(true)
  const [file, setFile] = useState<File | null>(null)
  const [darkFile, setDarkFile] = useState<File | null>(null)
  const [currentImageUrl, setCurrentImageUrl] = useState('')
  const [currentDarkImageUrl, setCurrentDarkImageUrl] = useState<string | null>(null)
  const [formData, setFormData] = useState({ name: '', link_url: '', order_index: 0 })

  useEffect(() => {
    async function fetchLogo() {
      let data: any = null
      let error: any = null
      try { data = await adminApi.get('client_logos', id) } catch (e: any) { error = e }
      if (error) {
        alert('Error loading logo: ' + error.message)
      } else if (data) {
        setFormData({ name: data.name, link_url: data.link_url || '', order_index: data.order_index })
        setCurrentImageUrl(data.image_url)
        setCurrentDarkImageUrl(data.dark_image_url)
      }
      setIsFetching(false)
    }
    fetchLogo()
  }, [id])

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
    setLoading(true)
    try {
      const imageUrl = file ? await uploadImage(file) : currentImageUrl
      const darkImageUrl = darkFile ? await uploadImage(darkFile) : currentDarkImageUrl

      let dbError: any = null
      try { await adminApi.update('client_logos', id, {
        name: formData.name,
        link_url: formData.link_url || null,
        order_index: formData.order_index,
        image_url: imageUrl,
        dark_image_url: darkImageUrl,
      }) } catch (e: any) { dbError = e }

      if (dbError) throw dbError

      router.push('/admin/logos')
    } catch (error: any) {
      alert('Error: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  if (isFetching) {
    return (
      <div className="min-h-screen bg-paper flex items-center justify-center font-mono text-sm text-ink-500">
        Loading...
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-paper flex">
      <AdminNav />
      <main className="flex-1 p-10 overflow-y-auto">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-2xl font-light tracking-wide uppercase text-ink-900 mb-6">Edit Client Logo</h1>
          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="text" value={formData.name} required
              placeholder="Organization name"
              className="w-full p-3 border border-ink-100 rounded-none text-sm bg-paper text-ink-900"
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
            <input
              type="url" value={formData.link_url}
              placeholder="Link to their site (optional)"
              className="w-full p-3 border border-ink-100 rounded-none text-sm bg-paper text-ink-900"
              onChange={(e) => setFormData({ ...formData, link_url: e.target.value })}
            />
            <input
              type="number" value={formData.order_index} required
              placeholder="Order (lower shows first)"
              className="w-full p-3 border border-ink-100 rounded-none text-sm bg-paper text-ink-900"
              onChange={(e) => setFormData({ ...formData, order_index: parseInt(e.target.value) || 0 })}
            />

            <div>
              <label className="block text-[10px] font-bold tracking-widest uppercase text-ink-500 mb-2">Current Logo</label>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={currentImageUrl} alt={formData.name} className="h-16 border border-ink-100 bg-paper p-2 mb-3" />
              <label className="block text-xs text-ink-500 mb-2">Replace image (optional)</label>
              <input type="file" accept="image/*" onChange={(e) => setFile(e.target.files?.[0] || null)} />
            </div>

            <div className="border-t border-ink-100 pt-4">
              <label className="block text-[10px] font-bold tracking-widest uppercase text-ink-500 mb-2">Dark-Mode Variant</label>
              {currentDarkImageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={currentDarkImageUrl} alt={`${formData.name} dark variant`} className="h-16 border border-ink-100 bg-gray-900 p-2 mb-3" />
              ) : (
                <p className="text-xs text-ink-300 mb-3">None set — the main image is used in both modes.</p>
              )}
              <label className="block text-xs text-ink-500 mb-2">Set or replace dark-mode variant (optional)</label>
              <input type="file" accept="image/*" onChange={(e) => setDarkFile(e.target.files?.[0] || null)} />
            </div>

            <button type="submit" disabled={loading} className="w-full bg-accent-600 text-white text-xs font-bold tracking-widest uppercase py-4 rounded-none hover:bg-gray-900 transition-colors">
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </form>
        </div>
      </main>
    </div>
  )
}
