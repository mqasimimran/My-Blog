'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

export default function AddProject() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    title: '', tech: '', description: '', order_index: 0
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    const { error } = await supabase.from('projects_resume').insert([formData])

    if (error) {
      alert('Error adding project: ' + error.message)
    } else {
      alert('Project added successfully!')
      router.push('/admin/resume') 
    }
    setLoading(false)
  }

  return (
    <div className="max-w-2xl mx-auto py-10 px-6 font-sans">
      <h1 className="text-2xl font-light uppercase tracking-wide mb-6">Add Resume Project</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input 
          type="text" placeholder="Project Title (e.g., Agentic LinkedIn Automator)" required
          className="w-full p-3 border border-gray-200 rounded text-sm"
          onChange={e => setFormData({...formData, title: e.target.value})}
        />
        <input 
          type="text" placeholder="Technologies (e.g., Node.js • React.js)" required
          className="w-full p-3 border border-gray-200 rounded text-sm"
          onChange={e => setFormData({...formData, tech: e.target.value})}
        />
        <textarea 
          placeholder="Description" required rows={4}
          className="w-full p-3 border border-gray-200 rounded text-sm"
          onChange={e => setFormData({...formData, description: e.target.value})}
        />
        <input 
          type="number" placeholder="Order Index (0 is first)" required
          className="w-full p-3 border border-gray-200 rounded text-sm"
          onChange={e => setFormData({...formData, order_index: parseInt(e.target.value) || 0})}
        />
        <button type="submit" disabled={loading} className="bg-gray-900 text-white text-xs font-bold uppercase tracking-widest px-6 py-3 rounded hover:bg-[#aa002a] transition-colors">
          {loading ? 'Saving...' : 'Save Project'}
        </button>
      </form>
    </div>
  )
}