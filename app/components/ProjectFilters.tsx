'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'

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

export default function ProjectFilters() {
  const [projects, setProjects] = useState<Project[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [activeCategory, setActiveCategory] = useState('ALL')

  useEffect(() => {
    async function fetchFeaturedProjects() {
      const { data, error } = await supabase
        .from('projects')
        .select('id, title, slug, category, tech_stack, description, status, live_url')
        .eq('featured', true)
        .order('created_at', { ascending: false })

      if (error) console.error('Error fetching projects:', error)
      else setProjects(data || [])
      setIsLoading(false)
    }

    fetchFeaturedProjects()
  }, [])

  const categories = ['ALL', 'AI & ML', 'GAME DEV', 'SOFTWARE ENG', 'WEB APPS', 'DESIGN']

  const filteredProjects = activeCategory === 'ALL' 
    ? projects 
    : projects.filter(project => project.category.toUpperCase() === activeCategory)

  return (
    <section className="max-w-7xl mx-auto px-6 py-20 font-sans bg-white">
      
      {/* Header & Filter Flex Layout */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between mb-12 gap-8">
        <div className="max-w-lg">
          <h2 className="text-3xl font-light tracking-wide uppercase text-gray-900 mb-3">
            Featured Work
          </h2>
          <p className="text-sm text-gray-500 leading-relaxed">
            Select a category below to explore my projects across software engineering, machine learning, and game development.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          {categories.map((category, index) => {
            const isActive = activeCategory === category
            return (
              <button
                key={index}
                onClick={() => setActiveCategory(category)}
                className={`text-[10px] font-bold tracking-[0.15em] uppercase px-4 py-2 rounded transition-colors ${
                  isActive 
                    ? 'bg-[#aa002a] text-white shadow-sm' 
                    : 'bg-transparent text-gray-500 hover:text-gray-900'
                }`}
              >
                {category}
              </button>
            )
          })}
        </div>
      </div>

      {/* 3-Column Card Grid */}
      {isLoading ? (
        <div className="text-center py-20 text-gray-400 text-xs font-mono uppercase tracking-widest">
          Loading featured work...
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.map((project) => (
            <div key={project.id} className="bg-white border border-gray-200 rounded-xl p-8 flex flex-col shadow-sm hover:shadow-md transition-shadow">
              
              <div className="flex items-center gap-3 mb-4">
                <span className="text-[10px] font-bold tracking-widest uppercase text-[#aa002a]">
                  {project.category}
                </span>
                {project.status && (
                  <span className="text-[9px] font-bold tracking-widest uppercase text-amber-600 bg-amber-50 px-2 py-1 rounded">
                    {project.status}
                  </span>
                )}
              </div>
              
              <h3 className="text-xl font-medium text-gray-900 mb-1">
                {project.title}
              </h3>
              
              <p className="text-[11px] text-gray-400 font-mono mb-5 tracking-wide">
                {project.tech_stack}
              </p>
              
              <p className="text-sm text-gray-600 leading-relaxed mb-8 flex-grow">
                {project.description}
              </p>
              
              <Link 
                href={project.live_url || `/projects/${project.slug}`} 
                className="text-[10px] font-bold uppercase tracking-widest text-gray-900 hover:text-[#aa002a] transition-colors mt-auto flex items-center gap-1"
              >
                {project.category === 'Game Dev' ? 'Play Demo' : 'View Details'} ↗
              </Link>
              
            </div>
          ))}
        </div>
      )}
      
    </section>
  )
}