'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

export default function ResumeDownloadBuilder() {
 const [data, setData] = useState<{
  experiences: any[];
  projects: any[];
  education: any[];
  certifications: any[];
}>({
  experiences: [],
  projects: [],
  education: [],
  certifications: []
})
  const [selectedIds, setSelectedIds] = useState<{ [key: string]: boolean }>({})
  const [loading, setLoading] = useState(true)

  const socialLinks = {
    linkedin: "https://linkedin.com/in/muhammad-qasim-imran",
    github: "https://github.com/qasimdevelops",
    portfolio: "https://my-blog-beta-red.vercel.app/",
    email: "qasimshibli12@gmail.com",
    phone: "92-324-9453952"
  }

  useEffect(() => {
    async function fetchAllData() {
      const [exp, proj, edu, cert] = await Promise.all([
        supabase.from('experiences').select('*').order('order_index', { ascending: true }),
        supabase.from('projects_resume').select('*').order('order_index', { ascending: true }),
        supabase.from('education').select('*').order('order_index', { ascending: true }),
        supabase.from('certifications').select('*').order('order_index', { ascending: true })
      ])

      const allItems = [
        ...(exp.data || []),
        ...(proj.data || []),
        ...(edu.data || []),
        ...(cert.data || [])
      ]

      const initialSelection: { [key: string]: boolean } = {}
      allItems.forEach(item => {
        initialSelection[item.id] = true
      })

      setData({
        experiences: exp.data || [],
        projects: proj.data || [],
        education: edu.data || [],
        certifications: cert.data || []
      })
      setSelectedIds(initialSelection)
      setLoading(false)
    }

    fetchAllData()
  }, [])

  const toggleSelection = (id: string) => {
    setSelectedIds(prev => ({ ...prev, [id]: !prev[id] }))
  }

  const handlePrint = () => {
    window.print()
  }

  if (loading) return <div className="p-10 font-mono text-sm">Loading Resume Builder...</div>

  const filteredExperiences = data.experiences.filter((item: any) => selectedIds[item.id])
  const filteredProjects = data.projects.filter((item: any) => selectedIds[item.id])
  const filteredEducation = data.education.filter((item: any) => selectedIds[item.id])
  const filteredCertifications = data.certifications.filter((item: any) => selectedIds[item.id])

  return (
    <div className="max-w-6xl mx-auto py-10 px-6 font-sans grid grid-cols-1 lg:grid-cols-3 gap-8">
      
      {/* Left Column: Customization Controls (Hidden when printing) */}
      <div className="lg:col-span-1 bg-white p-6 border rounded-lg shadow-sm h-fit space-y-6 print:hidden">
        <div>
          <h1 className="text-xl font-bold uppercase tracking-wide mb-1">Tailor Resume</h1>
          <p className="text-xs text-gray-500">Uncheck items to customize this specific job application.</p>
        </div>

        <button 
          onClick={handlePrint}
          className="w-full bg-[#000000] text-white text-xs font-bold uppercase tracking-widest py-3 rounded hover:bg-[#aa002a] transition-colors cursor-pointer"
        >
          Print / Save as PDF ↓
        </button>

        <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2 text-xs">
          <div>
            <h3 className="font-bold uppercase tracking-wider text-gray-400 mb-2">Education</h3>
            {data.education.map((item: any) => (
              <label key={item.id} className="flex items-center gap-2 mb-1.5 cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={!!selectedIds[item.id]} 
                  onChange={() => toggleSelection(item.id)}
                />
                <span className="truncate text-gray-700">{item.degree}</span>
              </label>
            ))}
          </div>

          <div>
            <h3 className="font-bold uppercase tracking-wider text-gray-400 mb-2">Experience & Leadership</h3>
            {data.experiences.map((item: any) => (
              <label key={item.id} className="flex items-center gap-2 mb-1.5 cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={!!selectedIds[item.id]} 
                  onChange={() => toggleSelection(item.id)}
                />
                <span className="truncate text-gray-700">{item.role} @ {item.company}</span>
              </label>
            ))}
          </div>

          <div>
            <h3 className="font-bold uppercase tracking-wider text-gray-400 mb-2">Projects</h3>
            {data.projects.map((item: any) => (
              <label key={item.id} className="flex items-center gap-2 mb-1.5 cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={!!selectedIds[item.id]} 
                  onChange={() => toggleSelection(item.id)}
                />
                <span className="truncate text-gray-700">{item.title}</span>
              </label>
            ))}
          </div>

          <div>
            <h3 className="font-bold uppercase tracking-wider text-gray-400 mb-2">Certifications</h3>
            {data.certifications.map((item: any) => (
              <label key={item.id} className="flex items-center gap-2 mb-1.5 cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={!!selectedIds[item.id]} 
                  onChange={() => toggleSelection(item.id)}
                />
                <span className="truncate text-gray-700">{item.title}</span>
              </label>
            ))}
          </div>
        </div>
      </div>

      {/* Right Column: Printable Resume Sheet */}
      <div className="lg:col-span-2 bg-gray-100 p-6 rounded-lg overflow-x-auto flex justify-center print:p-0 print:bg-white print:w-full">
        <div 
          id="resume-print-area"
          style={{ 
            width: '210mm', 
            minHeight: '297mm', 
            backgroundColor: '#ffffff', 
            padding: '12mm 15mm', 
            color: '#000000', 
            fontFamily: 'sans-serif', 
            fontSize: '10px', 
            lineHeight: '1.35',
            boxSizing: 'border-box' 
          }}
        >
          {/* Header Format */}
          <div style={{ textAlign: 'center', borderBottom: '1px solid #000000', paddingBottom: '6px', marginBottom: '10px' }}>
            <h1 style={{ fontSize: '20px', fontWeight: '700', letterSpacing: '0.08em', textTransform: 'uppercase', margin: '0 0 4px 0', color: '#000000' }}>
              MUHAMMAD QASIM IMRAN
            </h1>
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '6px', fontSize: '9.5px', color: '#000000', flexWrap: 'wrap' }}>
              <span>{socialLinks.phone}</span>
              <span>•</span>
              <a href={`mailto:${socialLinks.email}`} style={{ color: '#000000', textDecoration: 'none' }}>{socialLinks.email}</a>
              <span>•</span>
              <a href={socialLinks.linkedin} target="_blank" rel="noreferrer" style={{ color: '#000000', textDecoration: 'none' }}>LinkedIn</a>
              <span>•</span>
              <a href={socialLinks.portfolio} target="_blank" rel="noreferrer" style={{ color: '#000000', textDecoration: 'none' }}>Portfolio</a>
            </div>
          </div>

          {/* 1. Education Section First */}
          {filteredEducation.length > 0 && (
            <div style={{ marginBottom: '10px' }}>
              <h2 style={{ fontSize: '10.5px', fontWeight: '700', letterSpacing: '0.1em', textTransform: 'uppercase', color: '#000000', borderBottom: '1px solid #000000', paddingBottom: '1px', marginBottom: '4px' }}>
                Education
              </h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {filteredEducation.map((item: any) => (
                  <div key={item.id}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: '700' }}>
                      <span>{item.institution}</span>
                      <span style={{ fontWeight: 'normal' }}>{item.period}</span>
                    </div>
                    <div style={{ fontStyle: 'italic', color: '#333333' }}>{item.degree}</div>
                    {item.description && <p style={{ margin: '1px 0 0 0', color: '#444444' }}>{item.description}</p>}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 2. Professional Experience & Leadership Second */}
          {filteredExperiences.length > 0 && (
            <div style={{ marginBottom: '10px' }}>
              <h2 style={{ fontSize: '10.5px', fontWeight: '700', letterSpacing: '0.1em', textTransform: 'uppercase', color: '#000000', borderBottom: '1px solid #000000', paddingBottom: '1px', marginBottom: '4px' }}>
                Professional Experience & Leadership
              </h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {filteredExperiences.map((item: any) => (
                  <div key={item.id}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: '700' }}>
                      <span>{item.company}</span>
                      <span style={{ fontWeight: 'normal' }}>{item.period}</span>
                    </div>
                    <div style={{ fontWeight: '600', color: '#222222' }}>{item.role}</div>
                    <p style={{ margin: '2px 0 0 0', color: '#333333', whiteSpace: 'pre-line' }}>• {item.description}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 3. Projects Section */}
          {filteredProjects.length > 0 && (
            <div style={{ marginBottom: '10px' }}>
              <h2 style={{ fontSize: '10.5px', fontWeight: '700', letterSpacing: '0.1em', textTransform: 'uppercase', color: '#000000', borderBottom: '1px solid #000000', paddingBottom: '1px', marginBottom: '4px' }}>
                Technical Projects
              </h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {filteredProjects.map((item: any) => (
                  <div key={item.id}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: '700' }}>
                      <span>{item.title}</span>
                      <span style={{ fontWeight: 'normal', fontStyle: 'italic' }}>{item.tech}</span>
                    </div>
                    <p style={{ margin: '2px 0 0 0', color: '#333333' }}>• {item.description}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 4. Certifications and Online Courses */}
          {filteredCertifications.length > 0 && (
            <div style={{ marginBottom: '10px' }}>
              <h2 style={{ fontSize: '10.5px', fontWeight: '700', letterSpacing: '0.1em', textTransform: 'uppercase', color: '#000000', borderBottom: '1px solid #000000', paddingBottom: '1px', marginBottom: '4px' }}>
                Certifications and Online Courses
              </h2>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '3px 12px' }}>
                {filteredCertifications.map((item: any) => (
                  <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>• {item.title} ({item.issuer})</span>
                    <span style={{ fontFamily: 'monospace', color: '#555555', fontSize: '9px' }}>{item.date}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 5. Additional Section (Skills & Interests) */}
          <div>
            <h2 style={{ fontSize: '10.5px', fontWeight: '700', letterSpacing: '0.1em', textTransform: 'uppercase', color: '#000000', borderBottom: '1px solid #000000', paddingBottom: '1px', marginBottom: '4px' }}>
              Additional
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
              <p style={{ margin: 0 }}>
                <strong>Technical Skills:</strong> C#, Unity Engine, React.js, Node.js, Python, Supabase, Git & GitHub, Visual Studio, Graphic Design, Web Development, AI Automation.
              </p>
              <p style={{ margin: 0 }}>
                <strong>Interests:</strong> Indie Game Development, Graphic Design, AI Automation, Web Development.
              </p>
            </div>
          </div>

        </div>
      </div>

    </div>
  )
}