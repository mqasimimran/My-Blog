'use client'

import { useState, useEffect, useRef } from 'react'
import useStackShrink from '@/app/components/ui/useStackShrink'
import Link from 'next/link'
import { ArrowUpRight } from '@phosphor-icons/react'
import { supabase } from '@/lib/supabase'
import SplitText from '@/app/components/ui/SplitText'
import { ButtonLink } from '@/app/components/ui/Button'
import { SkeletonBlock } from '@/app/components/Skeleton'

type Project = {
  id: string
  title: string
  slug: string
  category: string
  tech_stack: string | null
  description: string
  status: string | null
  live_url: string | null
  feature_image: string | null
  preview_video_url: string | null
}

// `key` is compared (upper-case) with the category stored in the database. `label` is what visitors read.
const CATEGORIES = [
  { key: 'ALL', label: 'All' },
  { key: 'AI & ML', label: 'AI & ML' },
  { key: 'GAME DEV', label: 'Game dev' },
  { key: 'SOFTWARE ENG', label: 'Software eng' },
  { key: 'WEB APPS', label: 'Web apps' },
  { key: 'DESIGN', label: 'Design' },
]

export default function ProjectFilters() {
  const [projects, setProjects] = useState<Project[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [activeCategory, setActiveCategory] = useState('ALL')

  useEffect(() => {
    async function fetchFeaturedProjects() {
      const { data, error } = await supabase
        .from('projects')
        .select('id, title, slug, category, tech_stack, description, status, live_url, feature_image, preview_video_url')
        .eq('featured', true)
        .order('created_at', { ascending: false })

      if (error) console.error('Error fetching projects:', error)
      else setProjects(data || [])
      setIsLoading(false)
    }

    fetchFeaturedProjects()
  }, [])

  const filtered =
    activeCategory === 'ALL' ? projects : projects.filter((p) => p.category.toUpperCase() === activeCategory)
  const listRef = useRef<HTMLUListElement>(null)
  useStackShrink(listRef, [filtered.length, isLoading])

  return (
    <section className="container-page section-y">
      <div className="grid gap-12 lg:grid-cols-12 lg:gap-16">
        {/* Pinned while the work stacks up beside it */}
        <div className="lg:col-span-4">
          <div className="lg:sticky lg:top-24">
            <h2 className="type-h2 text-ink-900"><SplitText text="Featured work" /></h2>
            <p className="type-lead mt-4 max-w-[40ch]">Select a category to explore my projects across software engineering, machine learning, and game development.</p>
            <div role="group" aria-label="Filter projects by category" className="mt-8 flex flex-wrap gap-x-6 gap-y-3">
              {CATEGORIES.map((category) => {
                const isActive = activeCategory === category.key
                return (
                  <button
                    key={category.key}
                    onClick={() => setActiveCategory(category.key)}
                    aria-pressed={isActive}
                    className={`border-b-2 pb-1.5 text-sm font-medium tracking-tight transition-colors duration-300 ${
                      isActive ? 'border-accent-600 text-ink-900' : 'border-transparent text-ink-500 hover:text-ink-900'
                    }`}
                  >
                    {category.label}
                  </button>
                )
              })}
            </div>
            <div className="mt-10">
              <ButtonLink href="/projects" variant="text">See all projects</ButtonLink>
            </div>
          </div>
        </div>

        <div className="lg:col-span-8">
          {isLoading ? (
            <SkeletonBlock className="aspect-[16/10] w-full" />
          ) : filtered.length === 0 ? (
            <p className="text-base text-ink-500">No projects in this category yet.</p>
          ) : (
            // Each card sticks just under the navbar, so the next one slides up over it.
            <ul ref={listRef}>
              {filtered.map((project) => (
                <li data-no-animate key={project.id} className="sticky top-[72px] bg-paper pb-12">
                  <ProjectCard project={project} />
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </section>
  )
}

function ProjectCard({ project }: { project: Project }) {
  const [isHovering, setIsHovering] = useState(false)
  const hasThumbnail = project.preview_video_url || project.feature_image

  return (
    <Link
      // Always the case study; the live demo is a button on that page.
      href={`/projects/${project.slug}`}
      data-cursor="View"
      className="group block"
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
      <div className="relative aspect-[16/10] w-full overflow-hidden border border-ink-100 bg-ink-50">
        {hasThumbnail ? (
          project.preview_video_url ? (
            <>
              {project.feature_image && (
                <img src={project.feature_image} alt={project.title} className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-500 ${isHovering ? 'opacity-0' : 'opacity-100'}`} />
              )}
              {isHovering && <video src={project.preview_video_url} autoPlay muted loop playsInline className="absolute inset-0 h-full w-full object-cover" />}
            </>
          ) : (
            <img src={project.feature_image!} alt={project.title} className="absolute inset-0 h-full w-full object-cover transition-transform duration-[900ms] ease-[var(--ease-smooth)] group-hover:scale-[1.03]" />
          )
        ) : (
          <div className="absolute inset-0 grid place-items-center text-ink-300" aria-hidden>
            <span className="type-display">{project.title.charAt(0)}</span>
          </div>
        )}
      </div>

      <div className="mt-5 flex flex-wrap items-start justify-between gap-x-8 gap-y-2">
        <div>
          <h3 className="type-h3 text-ink-900 transition-colors duration-300 group-hover:text-accent-600">{project.title}</h3>
          <p className="type-meta mt-2 flex flex-wrap gap-x-3">
            <span>{project.category}</span>
            {project.status && <span>{project.status}</span>}
          </p>
        </div>
        <span className="inline-flex items-center gap-1.5 text-sm font-medium text-ink-900 transition-colors duration-300 group-hover:text-accent-600">
          View project
          <ArrowUpRight size={16} weight="bold" aria-hidden className="transition-transform duration-300 ease-[var(--ease-smooth)] group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
        </span>
      </div>
      <p className="mt-3 line-clamp-2 max-w-[60ch] text-[15px] leading-relaxed text-ink-700">{project.description}</p>
    </Link>
  )
}
