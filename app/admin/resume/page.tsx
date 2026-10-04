'use client'

import { useState, useEffect } from 'react'
import { adminApi } from '@/lib/adminApi'
import Link from 'next/link'

// 1. Define allowed tab keys
type TabKey = 'experiences' | 'projects_resume' | 'education' | 'certifications'

// 2. Define a flexible interface covering all possible resume item fields
interface ResumeItem {
  id: string
  order_index: number
  period?: string
  date?: string
  role?: string
  title?: string
  degree?: string
  company?: string
  issuer?: string
  institution?: string
  description?: string
  tech?: string
}

export default function ResumeManagerHub() {
  const [activeTab, setActiveTab] = useState<TabKey>('experiences')
  
  // 3. Replace any[] with ResumeItem[]
  const [items, setItems] = useState<ResumeItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchData(activeTab)
  }, [activeTab])

  async function fetchData(table: TabKey) {
    setLoading(true)
    try {
      const data = await adminApi.list(table, { orderBy: 'order_index', ascending: true })
      setItems((data as ResumeItem[]) || [])
    } catch (err: any) {
      console.error('Error fetching data:', err.message)
    }
    setLoading(false)
  }

  async function moveItem(index: number, direction: 'up' | 'down') {
    if ((direction === 'up' && index === 0) || (direction === 'down' && index === items.length - 1)) return

    const targetIndex = direction === 'up' ? index - 1 : index + 1
    const currentItem = items[index]
    const targetItem = items[targetIndex]

    try {
      await adminApi.update(activeTab, currentItem.id, { order_index: targetItem.order_index })
      await adminApi.update(activeTab, targetItem.id, { order_index: currentItem.order_index })
      fetchData(activeTab)
    } catch {
      alert('Error updating position')
    }
  }

  async function deleteItem(id: string) {
    if (!confirm('Are you sure you want to delete this item?')) return
    try {
      await adminApi.remove(activeTab, id)
      fetchData(activeTab)
    } catch (err: any) {
      alert('Error deleting: ' + err.message)
    }
  }

  const routeName = activeTab === 'projects_resume' ? 'projects' : activeTab === 'experiences' ? 'experience' : activeTab

  return (
    <div className="max-w-5xl mx-auto py-10 px-6 font-sans">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-light tracking-wide uppercase text-ink-900 mb-1">Resume Manager</h1>
          <p className="text-xs text-ink-500">View, reorder positions with arrows, and manage your live resume data.</p>
        </div>
        <div className="flex gap-3">
          <Link 
            href="/admin/resume/download" 
            className="bg-gray-900 text-white text-xs font-bold tracking-widest uppercase px-4 py-2.5 rounded-none hover:bg-accent-600 transition-colors flex items-center gap-1.5"
          >
            <span>⚡ Custom PDF Builder</span>
          </Link>
          <Link 
            href={`/admin/resume/${routeName}`} 
            className="bg-accent-600 text-white text-xs font-bold tracking-widest uppercase px-4 py-2.5 rounded-none hover:bg-gray-900 transition-colors"
          >
            + Add New Entry
          </Link>
        </div>
      </div>

      {/* Section Tabs */}
      <div className="flex border-b border-ink-100 mb-6 gap-6 text-xs font-bold uppercase tracking-widest">
        {[
          { key: 'experiences', label: 'Experience' },
          { key: 'projects_resume', label: 'Projects' },
          { key: 'education', label: 'Education' },
          { key: 'certifications', label: 'Certifications' }
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key as TabKey)}
            className={`pb-3 border-b-2 transition-colors cursor-pointer ${
              activeTab === tab.key 
                ? 'border-accent-600 text-accent-600' 
                : 'border-transparent text-ink-300 hover:text-ink-700'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Data List View */}
      {loading ? (
        <div className="py-20 text-center font-mono text-xs text-ink-300">Loading section data...</div>
      ) : items.length === 0 ? (
        <div className="py-20 text-center text-sm text-ink-500 bg-paper border rounded-none">
          No entries found in this section. Click "+ Add New Entry" above.
        </div>
      ) : (
        <div className="space-y-4">
          {items.map((item, index) => (
            <div key={item.id} className="bg-paper border border-ink-100 p-5 rounded-none shadow-sm flex items-center justify-between gap-4">
              
              {/* Position Arrow Controls */}
              <div className="flex flex-col gap-1">
                <button 
                  onClick={() => moveItem(index, 'up')}
                  disabled={index === 0}
                  className="w-7 h-7 bg-ink-100 hover:bg-ink-100 disabled:opacity-30 rounded-none flex items-center justify-center text-xs font-bold transition-colors cursor-pointer"
                  title="Move Up"
                >
                  ▲
                </button>
                <button 
                  onClick={() => moveItem(index, 'down')}
                  disabled={index === items.length - 1}
                  className="w-7 h-7 bg-ink-100 hover:bg-ink-100 disabled:opacity-30 rounded-none flex items-center justify-center text-xs font-bold transition-colors cursor-pointer"
                  title="Move Down"
                >
                  ▼
                </button>
              </div>

              {/* Content Overview */}
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[10px] font-mono bg-ink-100 px-2 py-0.5 rounded-none text-ink-500">#{index + 1}</span>
                  <span className="text-xs font-mono text-ink-300 uppercase">{item.period || item.date}</span>
                </div>
                <h3 className="text-base font-medium text-ink-900">
                  {item.role || item.title || item.degree}
                </h3>
                <p className="text-xs font-semibold text-accent-600">
                  {item.company || item.issuer || item.institution}
                </p>
                <p className="text-xs text-ink-700 mt-1 line-clamp-1">{item.description || item.tech}</p>
              </div>

              {/* Actions: Edit & Delete */}
              <div className="flex items-center gap-4">
                <Link 
                  href={`/admin/resume/${routeName}/edit/${item.id}`}
                  className="text-xs font-bold tracking-widest text-ink-500 hover:text-accent-600 uppercase"
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