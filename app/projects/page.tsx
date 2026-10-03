'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { SkeletonTextCardGrid } from '@/app/components/Skeleton'

type Project = {
  id: string
  title: string
  slug: string
  category: string
  tech_stack: string | null
  description: string
  status: string | null
  live_url: string | null
}

export default function AllProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [activeCategory, setActiveCategory] = useState('ALL')

  useEffect(() => {
    async function fetchAllProjects() {
      // Notice there is no .eq('featured', true) filter here. 
      // This pulls everything in the database.
      const { data, error } = await supabase
        .from('projects')
        .select('id, title, slug, category, tech_stack, description, status, live_url')
        .eq('published', true)
        .order('created_at', { ascending: false })

      if (error) console.error('Error fetching all projects:', error)
      else setProjects(data || [])
      setIsLoading(false)
    }

    fetchAllProjects()
  }, [])

  const categories = ['ALL', 'AI & ML', 'GAME DEV', 'SOFTWARE ENG', 'WEB APPS', 'DESIGN']

  const filteredProjects = activeCategory === 'ALL' 
    ? projects 
    : projects.filter(project => project.category.toUpperCase() === activeCategory)

  return (
    <main className="min-h-screen bg-paper pt-28 pb-24 font-sans w-full">
      <div className="max-w-7xl mx-auto px-6">
        
        {/* Page Header */}
        <div className="mb-14 text-center">
          <h1 className="text-4xl md:text-5xl font-light tracking-wide uppercase text-ink-900 mb-4">
            Project Archive
          </h1>
          <p className="text-ink-500 text-sm md:text-base max-w-2xl mx-auto leading-relaxed">
            A complete collection of my work across software engineering, machine learning, game development, and design.
          </p>
        </div>

        {/* Filter Tabs */}
        <div className="flex flex-wrap items-center justify-center gap-2 mb-12 border-b border-ink-100 pb-8">
          {categories.map((category, index) => {
            const isActive = activeCategory === category
            return (
              <button
                key={index}
                onClick={() => setActiveCategory(category)}
                className={`text-[10px] font-bold tracking-[0.15em] uppercase px-5 py-2.5 rounded-none transition-colors ${
                  isActive 
                    ? 'bg-accent-600 text-white shadow-sm' 
                    : 'bg-paper text-ink-500 hover:text-ink-900 border border-ink-100 hover:border-ink-100'
                }`}
              >
                {category}
              </button>
            )
          })}
        </div>

        {/* 3-Column Card Grid */}
        {isLoading ? (
          <SkeletonTextCardGrid count={6} columns={3} />
        ) : filteredProjects.length === 0 ? (
          <div className="text-center py-20 text-ink-300 text-sm">
            No projects found in this category.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProjects.map((project) => (
              <div key={project.id} className="bg-paper border border-ink-100 rounded-none p-8 flex flex-col shadow-sm hover:shadow-md transition-shadow">
                
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-[10px] font-bold tracking-widest uppercase text-accent-600">
                    {project.category}
                  </span>
                  {project.status && (
                    <span className="text-[9px] font-bold tracking-widest uppercase text-amber-600 bg-amber-50 px-2 py-1 rounded-none">
                      {project.status}
                    </span>
                  )}
                </div>
                
                <h3 className="text-xl font-medium text-ink-900 mb-1">
                  {project.title}
                </h3>
                
                <p className="text-[11px] text-ink-300 font-mono mb-5 tracking-wide">
                  {project.tech_stack}
                </p>
                
                <p className="text-sm text-ink-700 leading-relaxed mb-8 flex-grow">
                  {project.description}
                </p>
                
                <Link 
                  href={project.live_url || `/projects/${project.slug}`} 
                  className="text-[10px] font-bold uppercase tracking-widest text-ink-900 hover:text-accent-600 transition-colors mt-auto flex items-center gap-1"
                >
                  {project.category === 'Game Dev' ? 'Play Demo' : 'View Details'} ↗
                </Link>
                
              </div>
            ))}
          </div>
        )}
        
      </div>
    </main>
  )
}