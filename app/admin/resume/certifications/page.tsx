'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

export default function AddCertification() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [file, setFile] = useState<File | null>(null)
  const [formData, setFormData] = useState({
    title: '', issuer: '', date: '', order_index: 0, verify_url: ''
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!file && !formData.verify_url) {
      return alert('Attach a certificate image, a verification link, or both.')
    }

    setLoading(true)
    try {
      let imageUrl = ''

      if (file) {
        // 1. Upload Image
        const fileExt = file.name.split('.').pop()
        const fileName = `${Math.random()}.${fileExt}`

        const { error: uploadError } = await supabase.storage
          .from('resume-images')
          .upload(fileName, file)

        if (uploadError) throw uploadError

        // 2. Get Public URL
        const { data: urlData } = supabase.storage.from('resume-images').getPublicUrl(fileName)
        imageUrl = urlData.publicUrl
      }

      // 3. Save to Database
      const { error: dbError } = await supabase.from('certifications').insert([{
        ...formData,
        image_url: imageUrl
      }])

      if (dbError) throw dbError

      alert('Certification added successfully!')
      router.push('/admin')
    } catch (error: any) {
      alert('Error: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto py-10">
      <h1 className="text-2xl font-bold mb-6">Add Certification</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input 
          type="text" placeholder="Certificate Title" required
          className="w-full p-2 border rounded-none"
          onChange={e => setFormData({...formData, title: e.target.value})}
        />
        <input 
          type="text" placeholder="Issuer (e.g., Coursera)" required
          className="w-full p-2 border rounded-none"
          onChange={e => setFormData({...formData, issuer: e.target.value})}
        />
        <input 
          type="text" placeholder="Date (e.g., Aug 2025)" required
          className="w-full p-2 border rounded-none"
          onChange={e => setFormData({...formData, date: e.target.value})}
        />
        <input 
          type="number" placeholder="Order Index" required
          className="w-full p-2 border rounded-none"
          onChange={e => setFormData({...formData, order_index: parseInt(e.target.value)})}
        />
        <input 
          type="url" placeholder="Verification link (optional — Coursera, Credly, etc.)"
          className="w-full p-2 border rounded-none"
          onChange={e => setFormData({...formData, verify_url: e.target.value})}
        />
        
        <div className="border-2 border-dashed border-ink-100 p-6 text-center rounded-none">
          <label className="block text-xs text-ink-500 mb-2">Certificate image (optional if a verification link is set above)</label>
          <input 
            type="file" accept="image/*"
            onChange={e => setFile(e.target.files?.[0] || null)}
          />
        </div>

        <button type="submit" disabled={loading} className="bg-gray-900 text-white px-4 py-2 rounded-none">
          {loading ? 'Uploading...' : 'Save Certification'}
        </button>
      </form>
    </div>
  )
}