'use client'

import { projectTitle, projectMeta } from '@/lib/projectPresentation'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { ArrowUpRight } from '@phosphor-icons/react'
import { supabase } from '@/lib/supabase'
import PageHeader from '@/app/components/ui/PageHeader'
import FilterTabs from '@/app/components/ui/FilterTabs'
import EmptyState from '@/app/components/EmptyState'
import { SkeletonTextCardGrid } from '@/app/components/Skeleton'
import { useLocale } from '@/app/components/LocaleProvider'
import SiteImage from '@/components/SiteImage'
import { mediaCover } from '@/lib/portfolioVideo'

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
  screenshots: string[] | null
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

export default function AllProjectsPage() {
  const { tx } = useLocale()
  const { t } = useLocale()
  const [projects, setProjects] = useState<Project[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState(false)
  const [activeCategory, setActiveCategory] = useState('ALL')

  useEffect(() => {
    async function fetchAllProjects() {
      // No featured filter here: the archive shows every published project.
      const { data, error } = await supabase
        .from('projects')
        .select('id, title, slug, category, tech_stack, description, status, live_url, feature_image, screenshots')
        .eq('published', true)
        .order('created_at', { ascending: false })

      if (error) setLoadError(true)
      else setProjects(data || [])
      setIsLoading(false)
    }

    fetchAllProjects()
  }, [])

  const filteredProjects =
    activeCategory === 'ALL' ? projects : projects.filter((project) => project.category.toUpperCase() === activeCategory)

  return (
    <main className="pb-24">
      <PageHeader
        title={t('projects.title')}
        description={t('projects.desc')}
      />

      <section className="container-page">
        <FilterTabs label={tx("Filter projects by category")} options={CATEGORIES} value={activeCategory} onChange={setActiveCategory} />

        <div className="mt-12">
          {isLoading ? (
            <SkeletonTextCardGrid count={4} columns={2} />
          ) : loadError ? (
            <div role="alert" className="py-12 text-center">
              <p>{tx('Projects could not be loaded. Please try again.')}</p>
              <button type="button" onClick={() => window.location.reload()} className="mt-4 rounded-lg border border-ink-100 px-5 py-3">{tx('Try again')}</button>
            </div>
          ) : filteredProjects.length === 0 ? (
            <EmptyState icon="search" title={tx("No projects in this category yet")} description={tx("Try another category.")} />
          ) : (
            // Keep covers visible beneath the project name on every screen size.
            <ul className="border-b border-ink-100">
              {filteredProjects.map((project) => {
                const cover = project.feature_image?.trim() || project.screenshots?.map(mediaCover).find(Boolean)
                return (
                <li key={project.id} className="border-t border-ink-100">
                  <Link
                    href={`/projects/${project.slug}`}
                    data-cursor="View"
                    className="group grid gap-x-10 gap-y-3 py-8 md:grid-cols-12 md:py-10"
                  >
                    <div className="type-meta flex flex-wrap items-start gap-x-3 gap-y-1 md:col-span-3 md:pt-1.5">
                      <span>{project.category}</span>
                      {project.status && <span className="border border-ink-100 px-1.5 py-0.5">{tx(project.status)}</span>}
                    </div>
                    <div className="md:col-span-4">
                      <h2 className="type-h3 text-ink-900 transition-colors duration-300 group-hover:text-accent-600">{projectTitle(project.title)}</h2>
                      <p className="mt-2 text-sm text-ink-500">{projectMeta(project.tech_stack, project.category)}</p>
                      {cover && (
                        <div className="mt-4 portfolio-image overflow-hidden border border-ink-100 bg-paper-raised">
                          <SiteImage
                            src={cover}
                            alt={`${projectTitle(project.title)} — ${tx('Cover image')}`}
                            loading="lazy"
                            sizes="(min-width: 768px) 33vw, 100vw"
                            className="block h-auto max-h-80 w-full object-contain"
                          />
                        </div>
                      )}
                    </div>
                    <div className="flex items-start justify-between gap-6 md:col-span-5">
                      <p className="max-w-[52ch] text-[15px] leading-relaxed text-ink-700">{project.description}</p>
                      <span className="sr-only">{tx("View project")}</span>
                      <ArrowUpRight
                        size={20}
                        aria-hidden
                        className="mt-0.5 shrink-0 text-ink-300 transition-[color,transform] duration-300 ease-[var(--ease-smooth)] group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-accent-600"
                      />
                    </div>
                  </Link>
                </li>
                )
              })}
            </ul>
          )}
        </div>
      </section>
    </main>
  )
}
