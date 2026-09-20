'use client'

import { useEffect, useState, use } from 'react'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import Image from 'next/image'
import ShareButtons from '@/app/components/ShareButtons'

const SITE_URL = 'https://muhammadqasimimran.vercel.app'

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
  problem: string | null
  approach: string | null
  outcome: string | null
  screenshots: string[] | null
}

type RelatedProject = {
  title: string
  slug: string
  category: string
  feature_image: string | null
}

export default function ProjectDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params)
  const [project, setProject] = useState<Project | null>(null)
  const [relatedProjects, setRelatedProjects] = useState<RelatedProject[]>([])
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

        const { data: related } = await supabase
          .from('projects')
          .select('title, slug, category, feature_image')
          .eq('category', data.category)
          .neq('slug', slug)
          .limit(3)

        setRelatedProjects(related || [])
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

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'CreativeWork',
    name: project.title,
    description: project.description,
    image: project.feature_image || undefined,
    keywords: project.tech_stack || undefined,
    genre: project.category,
    url: `${SITE_URL}/projects/${slug}`,
    creator: {
      '@type': 'Person',
      name: 'Muhammad Qasim Imran',
      url: `${SITE_URL}/about`,
    },
  }

  return (
    <article className="min-h-screen bg-white pt-24 pb-32 font-sans overflow-x-hidden">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      
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
      {(project.problem || project.approach || project.outcome) ? (
        <div className="max-w-3xl mx-auto px-6 space-y-16">
          {project.problem && (
            <div>
              <p className="text-[10px] font-bold tracking-[0.2em] uppercase text-[#aa002a] mb-3">The Problem</p>
              <p className="text-gray-700 leading-relaxed text-lg font-light whitespace-pre-line">{project.problem}</p>
            </div>
          )}
          {project.approach && (
            <div>
              <p className="text-[10px] font-bold tracking-[0.2em] uppercase text-[#aa002a] mb-3">The Approach</p>
              <p className="text-gray-700 leading-relaxed text-lg font-light whitespace-pre-line">{project.approach}</p>
            </div>
          )}
          {project.tech_stack && (
            <div>
              <p className="text-[10px] font-bold tracking-[0.2em] uppercase text-[#aa002a] mb-3">The Stack</p>
              <div className="flex flex-wrap gap-2">
                {project.tech_stack.split(',').map((tech) => (
                  <span key={tech} className="text-xs font-mono uppercase tracking-wide text-gray-700 bg-gray-100 px-3 py-1.5 rounded">
                    {tech.trim()}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Screenshots */}
          {project.screenshots && project.screenshots.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {project.screenshots.map((src, i) => (
                <img key={i} src={src} alt={`${project.title} screenshot ${i + 1}`} loading="lazy" className="w-full h-auto rounded-lg border border-gray-100 shadow-sm" />
              ))}
            </div>
          )}

          {project.outcome && (
            <div>
              <p className="text-[10px] font-bold tracking-[0.2em] uppercase text-[#aa002a] mb-3">The Outcome</p>
              <p className="text-gray-700 leading-relaxed text-lg font-light whitespace-pre-line">{project.outcome}</p>
            </div>
          )}

          {project.content && (
            <div className="prose prose-lg prose-headings:font-serif prose-headings:text-gray-900 prose-a:text-[#aa002a] prose-a:no-underline hover:prose-a:underline text-gray-600 pt-4 border-t border-gray-100">
              <div dangerouslySetInnerHTML={{ __html: project.content }} />
            </div>
          )}
        </div>
      ) : (
        <div className="max-w-2xl mx-auto px-6 text-gray-600 prose prose-lg prose-headings:font-serif prose-headings:text-gray-900 prose-a:text-[#aa002a] prose-a:no-underline hover:prose-a:underline">
          {project.content ? (
            <div dangerouslySetInnerHTML={{ __html: project.content }} />
          ) : (
            <div className="text-center italic text-gray-400 py-10">
              A detailed case study for this project is currently in development.
            </div>
          )}
        </div>
      )}

      {/* Share */}
      <div className="max-w-3xl mx-auto px-6 flex justify-center mt-16 pt-10 border-t border-gray-100">
        <ShareButtons url={`${SITE_URL}/projects/${slug}`} title={project.title} />
      </div>

      {/* Related Projects */}
      {relatedProjects.length > 0 && (
        <div className="max-w-5xl mx-auto px-6 mt-24 pt-16 border-t border-gray-100">
          <h2 className="text-[10px] font-bold tracking-[0.2em] uppercase text-gray-400 mb-8 text-center">
            More {project.category} Projects
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {relatedProjects.map((related) => (
              <Link key={related.slug} href={`/projects/${related.slug}`} className="group block">
                {related.feature_image && (
                  <div className="relative aspect-video mb-3 overflow-hidden rounded bg-gray-50">
                    <Image
                      src={related.feature_image}
                      alt={related.title}
                      fill
                      sizes="(max-width: 640px) 100vw, 33vw"
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                )}
                <p className="text-[10px] font-bold uppercase tracking-widest text-[#aa002a] mb-1">{related.category}</p>
                <h3 className="text-sm font-medium text-gray-900 group-hover:text-[#aa002a] transition-colors leading-snug">
                  {related.title}
                </h3>
              </Link>
            ))}
          </div>
        </div>
      )}

    </article>
  )
}