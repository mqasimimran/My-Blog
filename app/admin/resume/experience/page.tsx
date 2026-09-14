'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

export default function AddExperience() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    period: '', role: '', company: '', description: '', order_index: 0
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    const { error } = await supabase.from('experiences').insert([formData])

    if (error) {
      alert('Error adding experience: ' + error.message)
    } else {
      alert('Experience added successfully!')
      router.push('/admin') // Or wherever your admin dashboard is
    }
    setLoading(false)
  }

  return (
    <div className="max-w-2xl mx-auto py-10">
      <h1 className="text-2xl font-bold mb-6">Add Experience</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input 
          type="text" placeholder="Period (e.g., August 2026 - Present)" required
          className="w-full p-2 border rounded"
          onChange={e => setFormData({...formData, period: e.target.value})}
        />
        <input 
          type="text" placeholder="Role (e.g., Graphic Design Intern)" required
          className="w-full p-2 border rounded"
          onChange={e => setFormData({...formData, role: e.target.value})}
        />
        <input 
          type="text" placeholder="Company (e.g., Logitrix Solutions)" required
          className="w-full p-2 border rounded"
          onChange={e => setFormData({...formData, company: e.target.value})}
        />
        <textarea 
          placeholder="Description" required rows={4}
          className="w-full p-2 border rounded"
          onChange={e => setFormData({...formData, description: e.target.value})}
        />
        <input 
          type="number" placeholder="Order Index (0 is first)" required
          className="w-full p-2 border rounded"
          onChange={e => setFormData({...formData, order_index: parseInt(e.target.value)})}
        />
        <button type="submit" disabled={loading} className="bg-gray-900 text-white px-4 py-2 rounded">
          {loading ? 'Saving...' : 'Save Experience'}
        </button>
      </form>
    </div>
  )
}