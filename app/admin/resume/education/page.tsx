'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

export default function AddEducation() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    degree: '', institution: '', period: '', description: '', order_index: 0
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    const { error } = await supabase.from('education').insert([formData])

    if (error) {
      alert('Error adding education: ' + error.message)
    } else {
      alert('Education added successfully!')
      router.push('/admin')
    }
    setLoading(false)
  }

  return (
    <div className="max-w-2xl mx-auto py-10">
      <h1 className="text-2xl font-bold mb-6">Add Education</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input 
          type="text" placeholder="Degree (e.g., Bachelor of Science in Computer Science)" required
          className="w-full p-2 border rounded"
          onChange={e => setFormData({...formData, degree: e.target.value})}
        />
        <input 
          type="text" placeholder="Institution (e.g., UMT, Lahore)" required
          className="w-full p-2 border rounded"
          onChange={e => setFormData({...formData, institution: e.target.value})}
        />
        <input 
          type="text" placeholder="Period (e.g., 2023 – 2027)" required
          className="w-full p-2 border rounded"
          onChange={e => setFormData({...formData, period: e.target.value})}
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
        <button type="submit" disabled={loading} className="bg-gray-900 text-white px-4 py-2 rounded hover:bg-[#aa002a] transition-colors">
          {loading ? 'Saving...' : 'Save Education'}
        </button>
      </form>
    </div>
  )
}