'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter, useParams } from 'next/navigation'

export default function EditCertification() {
  const router = useRouter()
  const params = useParams()
  const id = params.id

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [file, setFile] = useState<File | null>(null)
  const [formData, setFormData] = useState({
    title: '', issuer: '', date: '', image_url: '', order_index: 0
  })

  useEffect(() => {
    async function fetchItem() {
      const { data, error } = await supabase.from('certifications').select('*').eq('id', id).single()
      if (error) {
        alert('Error loading certification: ' + error.message)
      } else if (data) {
        setFormData({
          title: data.title || '',
          issuer: data.issuer || '',
          date: data.date || '',
          image_url: data.image_url || '',
          order_index: data.order_index || 0
        })
      }
      setLoading(false)
    }
    if (id) fetchItem()
  }, [id])

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    try {
      let imageUrl = formData.image_url

      if (file) {
        const fileExt = file.name.split('.').pop()
        const fileName = `${Math.random()}.${fileExt}`
        const { error: uploadError } = await supabase.storage.from('resume-images').upload(fileName, file)
        if (uploadError) throw uploadError

        const { data: urlData } = supabase.storage.from('resume-images').getPublicUrl(fileName)
        imageUrl = urlData.publicUrl
      }

      const { error } = await supabase.from('certifications').update({
        ...formData,
        image_url: imageUrl
      }).eq('id', id)

      if (error) throw error

      alert('Certification updated successfully!')
      router.push('/admin/resume')
    } catch (err: any) {
      alert('Error updating: ' + err.message)
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <div className="p-10 font-mono text-xs">Loading certification data...</div>

  return (
    <div className="max-w-2xl mx-auto py-10 px-6 font-sans">
      <h1 className="text-2xl font-light uppercase tracking-wide mb-6">Edit Certification</h1>
      <form onSubmit={handleUpdate} className="space-y-4">
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1">Title</label>
          <input 
            type="text" value={formData.title} required
            className="w-full p-3 border border-gray-200 rounded text-sm text-black"
            onChange={e => setFormData({...formData, title: e.target.value})}
          />
        </div>
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1">Issuer</label>
          <input 
            type="text" value={formData.issuer} required
            className="w-full p-3 border border-gray-200 rounded text-sm text-black"
            onChange={e => setFormData({...formData, issuer: e.target.value})}
          />
        </div>
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1">Date</label>
          <input 
            type="text" value={formData.date} required
            className="w-full p-3 border border-gray-200 rounded text-sm text-black"
            onChange={e => setFormData({...formData, date: e.target.value})}
          />
        </div>
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1">Order Index</label>
          <input 
            type="number" value={formData.order_index} required
            className="w-full p-3 border border-gray-200 rounded text-sm text-black"
            onChange={e => setFormData({...formData, order_index: parseInt(e.target.value) || 0})}
          />
        </div>
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1">Update Certificate Image (Optional)</label>
          <input 
            type="file" accept="image/*"
            className="text-sm text-black"
            onChange={e => setFile(e.target.files?.[0] || null)}
          />
        </div>
        <button type="submit" disabled={saving} className="bg-gray-900 text-white text-xs font-bold uppercase tracking-widest px-6 py-3 rounded hover:bg-[#aa002a] transition-colors cursor-pointer">
          {saving ? 'Updating...' : 'Update Certification'}
        </button>
      </form>
    </div>
  )
}