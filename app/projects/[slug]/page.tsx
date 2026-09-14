'use client'

import { useEffect, useState, use } from 'react'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'

type Project = {
  title: string
  category: string
  tech_stack: string | null
  description: string
  status: string | null
  feature_image: string | null
  live_url: string | null
  github_url: string | null
  content: string | null
}

export default function ProjectDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params)
  const [project, setProject] = useState<Project | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function fetchProjectDetails() {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('slug', slug)
        .single()

      if (error) {
        console.error('Error fetching project:', error)
      } else {
        setProject(data)
      }
      setIsLoading(false)
    }

    fetchProjectDetails()
  }, [slug])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center font-mono text-xs uppercase tracking-widest text-gray-400 bg-white">
        Loading architecture...
      </div>
    )
  }

  if (!project) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-white text-center px-6">
        <h1 className="text-3xl font-serif font-bold text-gray-900 mb-4">Project Not Found</h1>
        <Link href="/projects" className="text-[10px] font-bold tracking-widest uppercase text-gray-500 hover:text-gray-900 border-b border-gray-900 pb-1 transition-colors">
          Return to Portfolio
        </Link>
      </div>
    )
  }

  return (
    <article className="min-h-screen bg-white pt-24 pb-32 font-sans overflow-x-hidden">
      
      {/* Editorial Header */}
      <div className="max-w-4xl mx-auto px-6 text-center mb-16">
        <div className="flex items-center justify-center gap-3 mb-6">
          <span className="text-[10px] font-bold tracking-[0.2em] uppercase text-[#aa002a]">
            {project.category}
          </span>
          {project.status && (
            <span className="text-[9px] font-bold tracking-widest uppercase text-amber-600 bg-amber-50 px-2 py-1 rounded">
              {project.status}
            </span>
          )}
        </div>
        
        <h1 className="text-4xl md:text-6xl font-serif font-bold text-gray-900 tracking-tight leading-none mb-6">
          {project.title}
        </h1>
        
        {project.tech_stack && (
          <p className="text-[11px] font-mono text-gray-400 tracking-widest uppercase mb-8">
            {project.tech_stack}
          </p>
        )}
        
        <p className="text-lg md:text-xl text-gray-500 font-light leading-relaxed max-w-2xl mx-auto">
          {project.description}
        </p>

        {/* Action Links */}
        <div className="flex items-center justify-center gap-8 mt-10">
          {project.live_url && (
            <a href={project.live_url} target="_blank" rel="noopener noreferrer" className="text-[11px] font-bold tracking-widest uppercase text-gray-900 border-b border-gray-900 pb-1 hover:text-gray-500 transition-colors">
              Live Demo ↗
            </a>
          )}
          {project.github_url && (
            <a href={project.github_url} target="_blank" rel="noopener noreferrer" className="text-[11px] font-bold tracking-widest uppercase text-gray-900 border-b border-gray-900 pb-1 hover:text-gray-500 transition-colors">
              GitHub Repo ↗
            </a>
          )}
        </div>
      </div>

      {/* Edge-to-Edge Feature Image */}
      {project.feature_image && (
        <div className="w-full mb-20">
          <img 
            src={project.feature_image} 
            alt={project.title}
            className="w-full h-auto max-h-[80vh] object-cover"
          />
        </div>
      )}

      {/* Case Study Content */}
      <div className="max-w-2xl mx-auto px-6 text-gray-600 prose prose-lg prose-headings:font-serif prose-headings:text-gray-900 prose-a:text-[#aa002a] prose-a:no-underline hover:prose-a:underline">
        {project.content ? (
          <div dangerouslySetInnerHTML={{ __html: project.content }} />
        ) : (
          <div className="text-center italic text-gray-400 py-10">
            A detailed case study for this project is currently in development.
          </div>
        )}
      </div>

    </article>
  )
}