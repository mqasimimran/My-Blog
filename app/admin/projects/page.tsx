'use client'

import { useState, useEffect } from 'react'
import { useSession, signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'

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

  if (status === 'loading' || isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center font-mono text-sm text-gray-500">
        Loading admin portal...
      </div>
    )
  }

  if (!session) return null

  return (
    <div className="min-h-screen bg-slate-50 flex font-sans">
      <aside className="w-64 bg-gray-900 text-white p-6 flex flex-col justify-between hidden md:flex">
        <div>
          <h2 className="text-xl font-light tracking-wide uppercase mb-10">Admin</h2>
          <nav className="flex flex-col gap-4 text-xs font-bold tracking-widest uppercase">
            <Link href="/admin" className="text-gray-400 hover:text-white transition-colors">
              Blogs / Articles
            </Link>
            <Link href="/admin/projects" className="text-[#aa002a]">
              Projects
            </Link>
            <Link href="/admin/designs" className="text-gray-400 hover:text-white transition-colors">
              Design Gallery
            </Link>
            <Link href="/admin/messages" className="text-gray-400 hover:text-white transition-colors">
              Messages
            </Link>
          </nav>
        </div>

        <div>
          <button 
            onClick={() => signOut({ callbackUrl: '/admin/login' })}
            className="w-full text-left text-xs font-bold tracking-widest uppercase text-gray-400 hover:text-red-400 transition-colors pt-6 border-t border-gray-800"
          >
            ← Log Out
          </button>
        </div>
      </aside>

      <main className="flex-1 p-10 overflow-y-auto">
        <div className="max-w-5xl mx-auto">
          <div className="flex justify-between items-center mb-10">
            <div>
              <h1 className="text-3xl font-light tracking-wide uppercase text-gray-900">Manage Projects</h1>
              <p className="text-xs text-gray-500 mt-1">Logged in AS {session.user?.name || 'Qasim'}</p>
            </div>
            <Link 
              href="/admin/projects/new" 
              className="bg-[#aa002a] text-white text-xs font-bold tracking-widest uppercase px-6 py-3 rounded hover:bg-gray-900 transition-colors"
            >
              + New Project
            </Link>
          </div>

          {projects.length === 0 ? (
            <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-10 text-center text-sm text-gray-500">
              No projects found. Click "+ New Project" to create your first entry!
            </div>
          ) : (
            <div className="space-y-4">
              {projects.map((project) => (
                <div key={project.id} className="bg-white p-4 border border-gray-200 rounded-lg flex items-center justify-between shadow-sm hover:border-gray-300 transition-colors">
                  <div>
                    <div className="flex items-center gap-3 mb-1">
                      <span className="text-[10px] font-bold tracking-widest uppercase text-[#aa002a]">{project.category}</span>
                      {project.featured && <span className="text-[9px] font-bold tracking-widest uppercase bg-gray-100 text-gray-900 px-2 py-0.5 rounded">Featured</span>}
                    </div>
                    <h2 className="text-base font-medium text-gray-900">{project.title}</h2>
                  </div>
                  <div className="flex items-center gap-6">
                    <Link href={`/admin/projects/edit/${project.id}`} className="text-xs font-bold tracking-widest text-gray-500 hover:text-[#aa002a] uppercase">
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