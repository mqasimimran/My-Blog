'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter, useParams } from 'next/navigation'

export default function EditEducation() {
  const router = useRouter()
  const params = useParams()
  const id = params.id

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState({
    degree: '', institution: '', period: '', description: '', order_index: 0
  })

  useEffect(() => {
    async function fetchItem() {
      const { data, error } = await supabase.from('education').select('*').eq('id', id).single()
      if (error) {
        alert('Error loading education: ' + error.message)
      } else if (data) {
        setFormData({
          degree: data.degree || '',
          institution: data.institution || '',
          period: data.period || '',
          description: data.description || '',
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

    const { error } = await supabase.from('education').update(formData).eq('id', id)

    if (error) {
      alert('Error updating education: ' + error.message)
    } else {
      alert('Education updated successfully!')
      router.push('/admin/resume')
    }
    setSaving(false)
  }

  if (loading) return <div className="p-10 font-mono text-xs">Loading education data...</div>

  return (
    <div className="max-w-2xl mx-auto py-10 px-6 font-sans">
      <h1 className="text-2xl font-light uppercase tracking-wide mb-6">Edit Education</h1>
      <form onSubmit={handleUpdate} className="space-y-4">
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1">Degree</label>
          <input 
            type="text" value={formData.degree} required
            className="w-full p-3 border border-gray-200 rounded text-sm"
            onChange={e => setFormData({...formData, degree: e.target.value})}
          />
        </div>
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1">Institution</label>
          <input 
            type="text" value={formData.institution} required
            className="w-full p-3 border border-gray-200 rounded text-sm"
            onChange={e => setFormData({...formData, institution: e.target.value})}
          />
        </div>
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1">Period</label>
          <input 
            type="text" value={formData.period} required
            className="w-full p-3 border border-gray-200 rounded text-sm"
            onChange={e => setFormData({...formData, period: e.target.value})}
          />
        </div>
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1">Description</label>
          <textarea 
            value={formData.description} required rows={4}
            className="w-full p-3 border border-gray-200 rounded text-sm"
            onChange={e => setFormData({...formData, description: e.target.value})}
          />
        </div>
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1">Order Index</label>
          <input 
            type="number" value={formData.order_index} required
            className="w-full p-3 border border-gray-200 rounded text-sm"
            onChange={e => setFormData({...formData, order_index: parseInt(e.target.value) || 0})}
          />
        </div>
        <button type="submit" disabled={saving} className="bg-gray-900 text-white text-xs font-bold uppercase tracking-widest px-6 py-3 rounded hover:bg-[#aa002a] transition-colors cursor-pointer">
          {saving ? 'Updating...' : 'Update Education'}
        </button>
      </form>
    </div>
  )
}