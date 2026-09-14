'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'

export default function ResumeManagerHub() {
  const [activeTab, setActiveTab] = useState<'experiences' | 'projects_resume' | 'education' | 'certifications'>('experiences')
  const [items, setItems] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchData(activeTab)
  }, [activeTab])

  async function fetchData(table: string) {
    setLoading(true)
    const { data, error } = await supabase
      .from(table)
      .select('*')
      .order('order_index', { ascending: true })

    if (error) {
      console.error('Error fetching data:', error.message)
    } else {
      setItems(data || [])
    }
    setLoading(false)
  }

  async function moveItem(index: number, direction: 'up' | 'down') {
    if ((direction === 'up' && index === 0) || (direction === 'down' && index === items.length - 1)) return

    const targetIndex = direction === 'up' ? index - 1 : index + 1
    const currentItem = items[index]
    const targetItem = items[targetIndex]

    const { error: err1 } = await supabase
      .from(activeTab)
      .update({ order_index: targetItem.order_index })
      .eq('id', currentItem.id)

    const { error: err2 } = await supabase
      .from(activeTab)
      .update({ order_index: currentItem.order_index })
      .eq('id', targetItem.id)

    if (err1 || err2) {
      alert('Error updating position')
    } else {
      fetchData(activeTab)
    }
  }

  async function deleteItem(id: string) {
    if (!confirm('Are you sure you want to delete this item?')) return
    const { error } = await supabase.from(activeTab).delete().eq('id', id)
    if (error) alert('Error deleting: ' + error.message)
    else fetchData(activeTab)
  }

  const routeName = activeTab === 'projects_resume' ? 'projects' : activeTab === 'experiences' ? 'experience' : activeTab

  return (
    <div className="max-w-5xl mx-auto py-10 px-6 font-sans">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-light tracking-wide uppercase text-gray-900 mb-1">Resume Manager</h1>
          <p className="text-xs text-gray-500">View, reorder positions with arrows, and manage your live resume data.</p>
        </div>
        <div className="flex gap-3">
          <Link 
            href="/admin/resume/download" 
            className="bg-gray-900 text-white text-xs font-bold tracking-widest uppercase px-4 py-2.5 rounded hover:bg-[#aa002a] transition-colors flex items-center gap-1.5"
          >
            <span>⚡ Custom PDF Builder</span>
          </Link>
          <Link 
            href={`/admin/resume/${routeName}`} 
            className="bg-[#aa002a] text-white text-xs font-bold tracking-widest uppercase px-4 py-2.5 rounded hover:bg-gray-900 transition-colors"
          >
            + Add New Entry
          </Link>
        </div>
      </div>

      {/* Section Tabs */}
      <div className="flex border-b border-gray-200 mb-6 gap-6 text-xs font-bold uppercase tracking-widest">
        {[
          { key: 'experiences', label: 'Experience' },
          { key: 'projects_resume', label: 'Projects' },
          { key: 'education', label: 'Education' },
          { key: 'certifications', label: 'Certifications' }
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key as any)}
            className={`pb-3 border-b-2 transition-colors cursor-pointer ${
              activeTab === tab.key 
                ? 'border-[#aa002a] text-[#aa002a]' 
                : 'border-transparent text-gray-400 hover:text-gray-700'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Data List View */}
      {loading ? (
        <div className="py-20 text-center font-mono text-xs text-gray-400">Loading section data...</div>
      ) : items.length === 0 ? (
        <div className="py-20 text-center text-sm text-gray-500 bg-white border rounded-lg">
          No entries found in this section. Click "+ Add New Entry" above.
        </div>
      ) : (
        <div className="space-y-4">
          {items.map((item, index) => (
            <div key={item.id} className="bg-white border border-gray-200 p-5 rounded-lg shadow-sm flex items-center justify-between gap-4">
              
              {/* Position Arrow Controls */}
              <div className="flex flex-col gap-1">
                <button 
                  onClick={() => moveItem(index, 'up')}
                  disabled={index === 0}
                  className="w-7 h-7 bg-gray-100 hover:bg-gray-200 disabled:opacity-30 rounded flex items-center justify-center text-xs font-bold transition-colors cursor-pointer"
                  title="Move Up"
                >
                  ▲
                </button>
                <button 
                  onClick={() => moveItem(index, 'down')}
                  disabled={index === items.length - 1}
                  className="w-7 h-7 bg-gray-100 hover:bg-gray-200 disabled:opacity-30 rounded flex items-center justify-center text-xs font-bold transition-colors cursor-pointer"
                  title="Move Down"
                >
                  ▼
                </button>
              </div>

              {/* Content Overview */}
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[10px] font-mono bg-gray-100 px-2 py-0.5 rounded text-gray-500">#{index + 1}</span>
                  <span className="text-xs font-mono text-gray-400 uppercase">{item.period || item.date}</span>
                </div>
                <h3 className="text-base font-medium text-gray-900">
                  {item.role || item.title || item.degree}
                </h3>
                <p className="text-xs font-semibold text-[#aa002a]">
                  {item.company || item.issuer || item.institution}
                </p>
                <p className="text-xs text-gray-600 mt-1 line-clamp-1">{item.description || item.tech}</p>
              </div>

              {/* Actions: Edit & Delete */}
              <div className="flex items-center gap-4">
                <Link 
                  href={`/admin/resume/${routeName}/edit/${item.id}`}
                  className="text-xs font-bold tracking-widest text-gray-500 hover:text-[#aa002a] uppercase"
                >
                  Edit
                </Link>
                <button 
                  onClick={() => deleteItem(item.id)}
                  className="text-xs font-bold tracking-widest text-red-500 hover:text-red-700 uppercase px-3 py-1 cursor-pointer"
                >
                  Delete
                </button>
              </div>

            </div>
          ))}
        </div>
      )}
    </div>
  )
}