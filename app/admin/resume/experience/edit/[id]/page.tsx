'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter, useParams } from 'next/navigation'

export default function EditExperience() {
  const router = useRouter()
  const params = useParams()
  const id = params.id

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState({
    period: '', role: '', company: '', description: '', order_index: 0
  })

  useEffect(() => {
    async function fetchItem() {
      const { data, error } = await supabase.from('experiences').select('*').eq('id', id).single()
      if (error) {
        alert('Error loading experience: ' + error.message)
      } else if (data) {
        setFormData({
          period: data.period || '',
          role: data.role || '',
          company: data.company || '',
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

    const { error } = await supabase.from('experiences').update(formData).eq('id', id)

    if (error) {
      alert('Error updating experience: ' + error.message)
    } else {
      alert('Experience updated successfully!')
      router.push('/admin/resume')
    }
    setSaving(false)
  }

  if (loading) return <div className="p-10 font-mono text-xs">Loading experience data...</div>

  return (
    <div className="max-w-2xl mx-auto py-10 px-6 font-sans">
      <h1 className="text-2xl font-light uppercase tracking-wide mb-6">Edit Experience</h1>
      <form onSubmit={handleUpdate} className="space-y-4">
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1">Period</label>
          <input 
            type="text" value={formData.period} required
            className="w-full p-3 border border-gray-200 rounded text-sm"
            onChange={e => setFormData({...formData, period: e.target.value})}
          />
        </div>
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1">Role</label>
          <input 
            type="text" value={formData.role} required
            className="w-full p-3 border border-gray-200 rounded text-sm"
            onChange={e => setFormData({...formData, role: e.target.value})}
          />
        </div>
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1">Company</label>
          <input 
            type="text" value={formData.company} required
            className="w-full p-3 border border-gray-200 rounded text-sm"
            onChange={e => setFormData({...formData, company: e.target.value})}
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
          {saving ? 'Updating...' : 'Update Experience'}
        </button>
      </form>
    </div>
  )
}