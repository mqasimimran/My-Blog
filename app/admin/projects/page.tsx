'use client'

import { useState, useEffect } from 'react'
import { useSession, signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import AdminNav from '@/app/admin/AdminNav'

type Project = {
  id: string
  title: string
  slug: string
  category: string
  created_at: string
  featured: boolean
}

export default function AdminProjectsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [projects, setProjects] = useState<Project[]>([])
  const [isLoading, setIsLoading] = useState(true)


  useEffect(() => {
    async function fetchProjects() {
      const { data, error } = await supabase
        .from('projects')
        .select('id, title, slug, category, created_at, featured')
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching projects:', error)
      } else {
        setProjects(data || [])
      }
      setIsLoading(false)
    }

    if (status === 'authenticated') {
      fetchProjects()
    }
  }, [status])

  async function toggleFeatured(project: Project) {
    const { error } = await supabase.from('projects').update({ featured: !project.featured }).eq('id', project.id)
    if (error) {
      alert('Error updating: ' + error.message)
    } else {
      setProjects(prev => prev.map(p => p.id === project.id ? { ...p, featured: !p.featured } : p))
    }
  }

  if (status === 'loading' || isLoading) {
    return (
      <div className="min-h-screen bg-paper flex items-center justify-center font-mono text-sm text-ink-500">
        Loading admin portal...
      </div>
    )
  }

  if (!session) return null

  return (
    <div className="min-h-screen bg-paper flex flex-col md:flex-row font-sans">
      <AdminNav />

      <main className="flex-1 p-10 overflow-y-auto">
        <div className="max-w-5xl mx-auto">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-10">
            <div>
              <h1 className="text-3xl font-light tracking-wide uppercase text-ink-900">Manage Projects</h1>
              <p className="text-xs text-ink-500 mt-1">Logged in AS {session.user?.name || 'Qasim'}</p>
            </div>
            <Link 
              href="/admin/projects/new" 
              className="bg-accent-600 text-white text-xs font-bold tracking-widest uppercase px-6 py-3 rounded-none hover:bg-gray-900 transition-colors"
            >
              + New Project
            </Link>
          </div>

          {projects.length === 0 ? (
            <div className="bg-paper rounded-none shadow-sm border border-ink-100 p-10 text-center text-sm text-ink-500">
              No projects found. Click "+ New Project" to create your first entry!
            </div>
          ) : (
            <div className="space-y-4">
              {projects.map((project) => (
                <div key={project.id} className="bg-paper p-4 border border-ink-100 rounded-none flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between shadow-sm hover:border-ink-100 transition-colors">
                  <div>
                    <div className="flex items-center gap-3 mb-1">
                      <span className="text-[10px] font-bold tracking-widest uppercase text-accent-600">{project.category}</span>
                      <button
                        onClick={() => toggleFeatured(project)}
                        className={`text-[9px] font-bold tracking-widest uppercase px-2 py-1 rounded-none transition-colors cursor-pointer ${
                          project.featured ? 'bg-accent-600 text-white hover:bg-gray-900' : 'bg-ink-100 text-ink-300 hover:bg-ink-100'
                        }`}
                      >
                        {project.featured ? '★ Featured' : '☆ Feature'}
                      </button>
                    </div>
                    <h2 className="text-base font-medium text-ink-900">{project.title}</h2>
                  </div>
                  <div className="flex items-center flex-wrap gap-4">
                    <Link href={`/admin/projects/edit/${project.id}`} className="text-xs font-bold tracking-widest text-ink-500 hover:text-accent-600 uppercase">
                      Edit
                    </Link>
                    
                    <form onSubmit={async (e) => {
                      e.preventDefault()
                      try {
                        console.log("1. Form submitted for ID:", project.id)
                        
                        const isConfirmed = window.confirm(`Are you sure you want to delete "${project.title}"?`)
                        console.log("2. Confirm dialog result:", isConfirmed)
                        
                        if (!isConfirmed) return

                        console.log("3. Attempting state filter...")
                        setProjects(prev => {
                          const updated = prev.filter(p => p.id !== project.id)
                          console.log("4. State updated, new length:", updated.length)
                          return updated
                        })

                        console.log("5. Sending request to Supabase...")
                        const { error } = await supabase
                          .from('projects')
                          .delete()
                          .eq('id', project.id)

                        if (error) {
                          console.error("6. Supabase delete error:", error.message)
                          alert(`Database error: ${error.message}`)
                        } else {
                          console.log("6. Supabase delete completed successfully!")
                        }
                      } catch (err) {
                        console.error("CATCH ERROR IN DELETE:", err)
                      }
                    }}>
                      <button 
                        type="submit" 
                        className="text-xs font-bold tracking-widest text-red-500 hover:text-red-700 uppercase cursor-pointer py-2"
                      >
                        Delete
                      </button>
                    </form>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}