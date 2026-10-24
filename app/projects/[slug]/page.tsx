'use client'

import { useEffect, useState, use } from 'react'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import Image from '@/components/SafeImage'
import ShareButtons from '@/app/components/ShareButtons'
import { ArrowLeft } from '@phosphor-icons/react'
import { ButtonLink } from '@/app/components/ui/Button'
import CountUp from '@/app/components/ui/CountUp'
import GamePlayer from '@/app/components/GamePlayer'
import { SkeletonBlock } from '@/app/components/Skeleton'
import EmptyState from '@/app/components/EmptyState'


import { siteConfig, SITE_URL_SLASH as SITE_URL } from '@/site.config'
import SplitText from '@/app/components/ui/SplitText'
import { useLocale } from '@/app/components/LocaleProvider'
import ExplainProject from '@/app/components/ExplainProject'
type Project = {
  title: string
  category: string
  tech_stack: string | null
  description: string
  status: string | null
  feature_image: string | null
  live_url: string | null
  github_url: string | null
  play_url?: string | null
  content: string | null
  problem: string | null
  approach: string | null
  outcome: string | null
  screenshots: string[] | null
  stats: string | null
}

type RelatedProject = {
  title: string
  slug: string
  category: string
  feature_image: string | null
}

export default function ProjectDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { tx } = useLocale()
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
        .eq('published', true)
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

  const backLink = (
    <Link href="/projects" className="inline-flex items-center gap-2 text-sm font-medium text-ink-500 transition-colors duration-200 hover:text-ink-900">
      <ArrowLeft size={16} aria-hidden /> {tx("Project archive")}
    </Link>
  )

  if (isLoading) {
    return (
      <div className="container-page pb-24 pt-10 md:pt-14">
        <div className="mt-12 max-w-3xl space-y-5">
          <SkeletonBlock className="h-3 w-32" />
          <SkeletonBlock className="h-14 w-3/4" />
          <SkeletonBlock className="h-5 w-full" />
        </div>
        <SkeletonBlock className="mt-14 aspect-[16/9] w-full" />
      </div>
    )
  }

  if (!project) {
    return (
      <div className="container-page pb-24 pt-10">
        {backLink}
        <EmptyState icon="search" title={tx("Project not found")} description={tx("It may have been unpublished or renamed.")} />
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
      name: siteConfig.name,
      url: `${SITE_URL}/about`,
    },
  }

  // One row of the case study: the section name on the left, the text on the right.
  const Row = ({ label, children }: { label: string; children: React.ReactNode }) => (
    <section className="grid gap-4 border-t border-ink-100 py-12 md:grid-cols-12 md:gap-10 md:py-16">
      <h2 className="type-h3 text-ink-900 md:col-span-4">{label}</h2>
      <div className="md:col-span-8">{children}</div>
    </section>
  )
  const bodyText = 'whitespace-pre-line text-lg leading-[1.75] text-ink-700 max-w-[62ch]'
  const proseClass =
    'prose prose-lg max-w-[62ch] prose-headings:font-semibold prose-headings:tracking-[-0.025em] prose-headings:text-ink-900 prose-p:text-ink-700 prose-li:text-ink-700 prose-strong:text-ink-900 prose-a:text-ink-900 prose-a:decoration-accent-600 prose-a:underline-offset-4 hover:prose-a:text-accent-600 prose-pre:rounded-none prose-pre:bg-ink-900 prose-pre:text-paper'

  return (
    <article className="pb-24 pt-10 md:pt-14">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c') }} />

      <div className="container-page">
        {backLink}

        <header className="mt-12 max-w-4xl md:mt-16">
          <p className="type-meta flex flex-wrap items-center gap-x-4 gap-y-2">
            <span className="text-ink-900">{project.category}</span>
            {project.status && <span className="border border-ink-100 px-1.5 py-0.5">{tx(project.status)}</span>}
          </p>
          <h1 className="type-title mt-5 text-ink-900"><SplitText text={project.title} /></h1>
          {project.tech_stack && <p className="type-meta mt-5">{project.tech_stack}</p>}
          <p className="type-lead mt-6 max-w-[52ch]">{project.description}</p>

          {(project.live_url || project.github_url) && (
            <div className="mt-10 flex flex-wrap items-center gap-x-8 gap-y-4">
              {project.live_url && <ButtonLink href={project.live_url} external>{tx("Live demo")}</ButtonLink>}
              {project.github_url && <ButtonLink href={project.github_url} external variant="text">{tx("GitHub repo")}</ButtonLink>}
            </div>
          )}
        </header>
      </div>

      {project.feature_image && (
        <figure className="container-page mt-14 md:mt-20">
          <div className="overflow-hidden bg-ink-50">
            <img src={project.feature_image} alt={project.title} className="h-auto max-h-[80vh] w-full object-cover" />
          </div>
        </figure>
      )}

      {project.play_url && (
        <section className="container-page mt-14 md:mt-20" aria-label={tx("Play the game")}>
          <h2 className="type-h2 text-ink-900"><SplitText text={tx("Play it in your browser")} /></h2>
          <div className="mt-8">
            <GamePlayer src={project.play_url} title={project.title} poster={project.feature_image} />
          </div>
        </section>
      )}

      <div className="container-page">
        <ExplainProject slug={slug} />

        {/* Stats */}
        {project.stats && (
          <div className="mt-14 grid grid-cols-2 gap-x-8 gap-y-10 border-y border-ink-100 py-10 sm:grid-cols-3 md:mt-20">
            {project.stats.split('\n').map((line) => {
              const [value, label] = line.split('|').map((s) => s.trim())
              if (!value) return null
              return (
                <div key={line}>
                  <p className="text-[clamp(2rem,1.4rem+2vw,3.25rem)] font-semibold leading-none tracking-[-0.04em] text-accent-600"><CountUp value={value} /></p>
                  <p className="mt-3 text-sm text-ink-500">{label}</p>
                </div>
              )
            })}
          </div>
        )}

        {/* Case study */}
        {project.problem || project.approach || project.outcome ? (
          <div className="mt-8 md:mt-12">
            {project.problem && <Row label={tx("The problem")}><p className={bodyText}>{project.problem}</p></Row>}
            {project.approach && <Row label={tx("The approach")}><p className={bodyText}>{project.approach}</p></Row>}
            {project.tech_stack && (
              <Row label={tx("The stack")}>
                <ul className="flex flex-wrap gap-2">
                  {project.tech_stack.split(',').map((tech) => (
                    <li key={tech} className="border border-ink-100 bg-paper-raised px-3 py-1.5 font-mono text-[13px] text-ink-700">{tech.trim()}</li>
                  ))}
                </ul>
              </Row>
            )}
            {project.screenshots && project.screenshots.length > 0 && (
              <div className="grid grid-cols-1 gap-6 border-t border-ink-100 py-12 sm:grid-cols-2 md:py-16">
                {project.screenshots.map((src, i) => (
                  <div key={i} className="overflow-hidden bg-ink-50">
                    <img src={src} alt={`${project.title} screenshot ${i + 1}`} loading="lazy" className="h-auto w-full" />
                  </div>
                ))}
              </div>
            )}
            {project.outcome && <Row label={tx("The outcome")}><p className={bodyText}>{project.outcome}</p></Row>}
            {project.content && (
              <Row label={tx("Notes")}>
                <div className={proseClass} dangerouslySetInnerHTML={{ __html: project.content }} />
              </Row>
            )}
          </div>
        ) : (
          <div className="mt-14 border-t border-ink-100 pt-12 md:mt-20">
            {project.content ? (
              <div className={`${proseClass} mx-auto`} dangerouslySetInnerHTML={{ __html: project.content }} />
            ) : (
              <p className="text-base text-ink-500">{tx("A detailed case study for this project is on its way.")}</p>
            )}
          </div>
        )}

        {/* Share */}
        <div className="mt-12 border-t border-ink-100 pt-10">
          <ShareButtons url={`${SITE_URL}/projects/${slug}`} title={project.title} />
        </div>

        {/* Related projects */}
        {relatedProjects.length > 0 && (
          <section className="mt-24 border-t border-ink-100 pt-16">
            <h2 className="type-h3 text-ink-900">More {project.category} projects</h2>
            <div className="mt-10 grid grid-cols-1 gap-x-8 gap-y-12 sm:grid-cols-3">
              {relatedProjects.map((related) => (
                <Link key={related.slug} href={`/projects/${related.slug}`} className="group flex h-full w-full flex-col border border-ink-100 bg-paper-raised transition-colors duration-300 hover:border-ink-900">
                  <div className="relative aspect-[4/3] overflow-hidden bg-ink-50">
                    {related.feature_image && (
                      <Image
                        src={related.feature_image}
                        alt={related.title}
                        fill
                        sizes="(max-width: 640px) 100vw, 33vw"
                        className="object-cover transition-transform duration-[900ms] ease-[var(--ease-smooth)] group-hover:scale-[1.03]"
                      />
                    )}
                  </div>
                  <div className="p-5">
                    <p className="type-meta">{related.category}</p>
                    <h3 className="mt-2 text-lg font-medium leading-snug tracking-tight text-ink-900 transition-colors duration-300 group-hover:text-accent-600">{related.title}</h3>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>
    </article>
  )
}
