'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { siteConfig } from '@/site.config'
import { ArrowUpRight, DownloadSimple, X } from '@phosphor-icons/react'
import SplitText from '@/app/components/ui/SplitText'

// Define the exact shape of your data to satisfy TypeScript
interface ResumeItem {
  id: string
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
  image_url?: string
  verify_url?: string
}

export default function Resume() {
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  
  // Strongly type the state so TypeScript doesn't infer never[]
  const [data, setData] = useState<{
    experiences: ResumeItem[]
    projects: ResumeItem[]
    education: ResumeItem[]
    certifications: ResumeItem[]
  }>({
    experiences: [],
    projects: [],
    education: [],
    certifications: []
  })
  
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchResumeData() {
      const [expRes, projRes, eduRes, certRes] = await Promise.all([
        supabase.from('experiences').select('*').order('order_index', { ascending: true }),
        supabase.from('projects_resume').select('*').order('order_index', { ascending: true }),
        supabase.from('education').select('*').order('order_index', { ascending: true }),
        supabase.from('certifications').select('*').order('order_index', { ascending: true })
      ])

      setData({
        experiences: (expRes.data as ResumeItem[]) || [],
        projects: (projRes.data as ResumeItem[]) || [],
        education: (eduRes.data as ResumeItem[]) || [],
        certifications: (certRes.data as ResumeItem[]) || []
      })
      setLoading(false)
    }

    fetchResumeData()
  }, [])

  if (loading) return <div className="min-h-screen bg-paper flex items-center justify-center font-mono text-sm text-ink-500">Loading Resume...</div>

  // One resume section: its name on the left, the entries on the right.
  const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
    <section className="grid gap-8 border-t border-ink-100 py-14 md:grid-cols-12 md:gap-10 md:py-16">
      <h2 className="type-h3 text-ink-900 md:col-span-3">{title}</h2>
      <div className="md:col-span-9">{children}</div>
    </section>
  )

  return (
    <main className="pb-24">
      <header className="container-page flex flex-col gap-8 pb-12 pt-12 md:flex-row md:items-end md:justify-between md:pb-16 md:pt-20">
        <div>
          <h1 className="type-display text-ink-900"><SplitText text={"Resume"} /></h1>
          <p className="type-lead mt-6 max-w-[48ch]">Computer Science undergraduate, developer, and technical creator.</p>
        </div>
        <a
          href={siteConfig.resume.cvFile || '/api/cv'}
          download={`${siteConfig.name.replace(/\s+/g, '_')}_Resume.pdf`}
          className="group inline-flex h-12 shrink-0 items-center gap-2 self-start bg-ink-900 px-6 text-sm font-medium tracking-tight text-paper transition-[background-color,color,transform] duration-300 ease-[var(--ease-smooth)] hover:bg-accent-600 hover:text-on-accent active:translate-y-px md:self-auto"
        >
          Download CV
          <DownloadSimple size={16} weight="bold" aria-hidden className="transition-transform duration-300 group-hover:translate-y-0.5" />
        </a>
      </header>

      <div id="resume-print-area" className="container-page">
        <Section title="Experience and leadership">
          <ol className="divide-y divide-ink-100">
            {data.experiences.map((item) => (
              <li key={item.id} className="py-8 first:pt-0 last:pb-0">
                <p className="type-meta">{item.period}</p>
                <h3 className="mt-2 text-xl font-medium tracking-tight text-ink-900">{item.role}</h3>
                <p className="mt-1 text-[15px] font-medium text-accent-600">{item.company}</p>
                <p className="mt-3 max-w-[64ch] text-[15px] leading-relaxed text-ink-700">{item.description}</p>
              </li>
            ))}
          </ol>
        </Section>

        <Section title="Key projects">
          <ul className="divide-y divide-ink-100">
            {data.projects.map((item) => (
              <li key={item.id} className="py-8 first:pt-0 last:pb-0">
                <h3 className="text-xl font-medium tracking-tight text-ink-900">{item.title}</h3>
                <p className="type-meta mt-2">{item.tech}</p>
                <p className="mt-3 max-w-[64ch] text-[15px] leading-relaxed text-ink-700">{item.description}</p>
              </li>
            ))}
          </ul>
        </Section>

        <Section title="Education">
          <ul className="divide-y divide-ink-100">
            {data.education.map((item) => (
              <li key={item.id} className="py-8 first:pt-0 last:pb-0">
                <p className="type-meta">{item.period}</p>
                <h3 className="mt-2 text-xl font-medium tracking-tight text-ink-900">{item.degree}</h3>
                <p className="mt-1 text-[15px] text-ink-500">{item.institution}</p>
                {item.description && <p className="mt-3 max-w-[64ch] text-[15px] leading-relaxed text-ink-700">{item.description}</p>}
              </li>
            ))}
          </ul>
        </Section>

        <Section title="Licenses and certifications">
          <ul className="border-b border-ink-100">
            {data.certifications.map((cert) => {
              const hasVerifyLink = !!cert.verify_url
              const hasImage = !!cert.image_url
              const rowClass = 'group flex w-full items-start justify-between gap-6 border-t border-ink-100 py-5 text-left'
              const row = (
                <>
                  <span className="min-w-0">
                    <span className="block text-base font-medium leading-snug tracking-tight text-ink-900 transition-colors duration-300 group-hover:text-accent-600">{cert.title}</span>
                    <span className="mt-1 block text-[15px] text-ink-500">{cert.issuer}</span>
                  </span>
                  <span className="flex shrink-0 flex-col items-end gap-2 text-right">
                    {cert.date && <span className="type-meta">Issued {cert.date}</span>}
                    {(hasVerifyLink || hasImage) && (
                      <span className="inline-flex items-center gap-1 text-sm font-medium text-ink-700 transition-colors duration-300 group-hover:text-accent-600">
                        {hasVerifyLink ? 'Verify' : 'View'}
                        <ArrowUpRight size={14} weight="bold" aria-hidden />
                      </span>
                    )}
                  </span>
                </>
              )
              return (
                <li key={cert.id}>
                  {hasVerifyLink ? (
                    <a href={cert.verify_url} target="_blank" rel="noopener noreferrer" className={rowClass}>{row}</a>
                  ) : hasImage ? (
                    <button type="button" onClick={() => setSelectedImage(cert.image_url || null)} className={rowClass}>{row}</button>
                  ) : (
                    <div className={rowClass}>{row}</div>
                  )}
                </li>
              )
            })}
          </ul>
        </Section>
      </div>

      {selectedImage && (
        <div role="dialog" aria-modal="true" aria-label="Certificate" onClick={() => setSelectedImage(null)} className="fixed inset-0 z-overlay flex items-center justify-center bg-zinc-950/90 p-4 backdrop-blur-sm">
          <div className="relative w-full max-w-4xl" onClick={(e) => e.stopPropagation()}>
            <button autoFocus onClick={() => setSelectedImage(null)} aria-label="Close" className="absolute -top-12 right-0 grid h-10 w-10 place-items-center text-white transition-colors duration-200 hover:text-accent-600">
              <X size={24} aria-hidden />
            </button>
            <div className="flex min-h-[300px] items-center justify-center bg-paper-raised p-2">
              <img src={selectedImage} alt="Certificate" className="mx-auto max-h-[80vh] w-auto object-contain" />
            </div>
          </div>
        </div>
      )}
    </main>
  )
}
