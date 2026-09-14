'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

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

  if (loading) return <div className="min-h-screen flex items-center justify-center font-mono text-sm text-gray-500">Loading Resume...</div>

  return (
    <div className="max-w-4xl mx-auto px-6 py-20 relative">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-4">
        <div>
          <h1 className="text-4xl font-light tracking-widest text-gray-900 uppercase mb-2">Resume</h1>
          <p className="text-gray-500">Computer Science undergraduate, developer, and technical creator.</p>
        </div>
        
        <a
          href="/resume.pdf"
          download="Muhammad_Qasim_Imran_Resume.pdf"
          className="inline-flex items-center gap-2 bg-gray-900 text-white text-xs font-bold uppercase tracking-[0.15em] px-5 py-3 rounded-md hover:bg-[#aa002a] transition-colors shadow-sm"
        >
          <span>Download CV</span>
          <span>↓</span>
        </a>
      </div>

      <section className="mb-16">
        <h2 className="text-sm font-bold tracking-[0.2em] uppercase text-gray-900 mb-8 border-b border-gray-100 pb-4">
          Experience & Leadership
        </h2>
        <div className="relative border-l border-gray-200 ml-4 space-y-12">
          {data.experiences.map((item) => (
            <div key={item.id} className="relative pl-8 group">
              <div className="absolute -left-[5px] top-1.5 w-2.5 h-2.5 rounded-full bg-gray-300 group-hover:bg-[#aa002a] transition-colors ring-4 ring-white" />
              <span className="inline-block text-xs font-mono text-gray-400 tracking-wider uppercase mb-1">{item.period}</span>
              <h3 className="text-lg font-medium text-gray-900">{item.role}</h3>
              <p className="text-sm font-semibold text-[#aa002a] mb-2">{item.company}</p>
              <p className="text-sm text-gray-600 leading-relaxed">{item.description}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mb-16">
        <h2 className="text-sm font-bold tracking-[0.2em] uppercase text-gray-900 mb-8 border-b border-gray-100 pb-4">
          Key Projects
        </h2>
        <div className="space-y-10">
          {data.projects.map((item) => (
            <div key={item.id} className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="text-xs font-medium text-[#aa002a] tracking-wider uppercase md:pt-1">{item.tech}</div>
              <div className="md:col-span-3">
                <h3 className="text-lg font-medium text-gray-900">{item.title}</h3>
                <p className="text-gray-600 text-sm leading-relaxed mt-1">{item.description}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="mb-16">
        <h2 className="text-sm font-bold tracking-[0.2em] uppercase text-gray-900 mb-8 border-b border-gray-100 pb-4">
          Education
        </h2>
        <div className="space-y-10">
          {data.education.map((item) => (
            <div key={item.id} className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="text-xs font-medium text-gray-400 tracking-wider uppercase md:pt-1">{item.period}</div>
              <div className="md:col-span-3">
                <h3 className="text-lg font-medium text-gray-900">{item.degree}</h3>
                <p className="text-sm text-gray-500 mb-2">{item.institution}</p>
                <p className="text-gray-600 text-sm leading-relaxed">{item.description}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2 className="text-sm font-bold tracking-[0.2em] uppercase text-gray-900 mb-8 border-b border-gray-100 pb-4">
          Licenses & Certifications
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {data.certifications.map((cert) => (
            <div 
              key={cert.id} 
              onClick={() => setSelectedImage(cert.image_url || null)}
              className="bg-white border border-gray-200 p-4 rounded-md shadow-sm hover:border-[#aa002a] transition-all flex flex-col justify-between cursor-pointer group"
            >
              <div>
                <div className="flex justify-between items-start">
                  <h3 className="text-sm font-medium text-gray-900 group-hover:text-[#aa002a] transition-colors">{cert.title}</h3>
                  <span className="text-xs text-gray-400 group-hover:text-[#aa002a] transition-colors ml-2 font-mono">View ↗</span>
                </div>
                <p className="text-xs text-gray-500 mt-1">{cert.issuer}</p>
              </div>
              <div className="text-[10px] tracking-wider uppercase text-gray-400 mt-4">Issued {cert.date}</div>
            </div>
          ))}
        </div>
      </section>

      {selectedImage && (
        <div onClick={() => setSelectedImage(null)} className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="relative max-w-4xl w-full bg-white p-2 rounded-lg shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <button onClick={() => setSelectedImage(null)} className="absolute -top-10 right-0 text-white text-xl font-bold hover:text-[#aa002a] transition-colors">✕ Close</button>
            <div className="bg-gray-100 rounded overflow-hidden flex items-center justify-center min-h-[300px] relative">
              <img src={selectedImage} alt="Credential" className="max-h-[80vh] w-auto object-contain mx-auto rounded" />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}