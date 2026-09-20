'use client'

import { useState, useEffect, use } from 'react'
import { useSession, signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'

export default function EditProjectPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const { data: session, status } = useSession()
  const router = useRouter()
  
  const [title, setTitle] = useState('')
  const [slug, setSlug] = useState('')
  const [category, setCategory] = useState('Game Dev')
  const [techStack, setTechStack] = useState('')
  const [statusVal, setStatusVal] = useState('')
  const [description, setDescription] = useState('')
  const [content, setContent] = useState('') // <--- Added for case study
  const [problem, setProblem] = useState('')
  const [approach, setApproach] = useState('')
  const [outcome, setOutcome] = useState('')
  const [existingScreenshots, setExistingScreenshots] = useState<string[]>([])
  const [screenshotFiles, setScreenshotFiles] = useState<File[]>([])
  const [liveUrl, setLiveUrl] = useState('')
  const [githubUrl, setGithubUrl] = useState('')
  const [featured, setFeatured] = useState(false)
  
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  

  useEffect(() => {
    async function fetchProject() {
      const { data, error } = await supabase.from('projects').select('*').eq('id', id).single()
      if (error) {
        console.error('Error fetching project:', error)
      } else if (data) {
        setTitle(data.title)
        setSlug(data.slug)
        setCategory(data.category)
        setTechStack(data.tech_stack || '')
        setStatusVal(data.status || '')
        setDescription(data.description || '')
        setContent(data.content || '') // <--- Loaded from database
        setProblem(data.problem || '')
        setApproach(data.approach || '')
        setOutcome(data.outcome || '')
        setExistingScreenshots(data.screenshots || [])
        setLiveUrl(data.live_url || '')
        setGithubUrl(data.github_url || '')
        setFeatured(data.featured)
      }
      setIsLoading(false)
    }

    if (status === 'authenticated') {
      fetchProject()
    }
  }, [id, status])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    let screenshotUrls = existingScreenshots
    if (screenshotFiles.length > 0) {
      const newUrls: string[] = []
      for (const file of screenshotFiles) {
        const fileExt = file.name.split('.').pop()
        const fileName = `screenshot_${Math.random().toString(36).substring(2)}.${fileExt}`
        const { error: uploadError } = await supabase.storage.from('blog-images').upload(fileName, file)
        if (uploadError) {
          alert('Error uploading a screenshot: ' + uploadError.message)
          setIsSubmitting(false)
          return
        }
        const { data: publicUrlData } = supabase.storage.from('blog-images').getPublicUrl(fileName)
        newUrls.push(publicUrlData.publicUrl)
      }
      screenshotUrls = [...existingScreenshots, ...newUrls]
    }

    const { error } = await supabase.from('projects').update({
      title,
      slug,
      category,
      tech_stack: techStack,
      status: statusVal,
      description,
      content, // <--- Updated in database
      problem,
      approach,
      outcome,
      screenshots: screenshotUrls,
      live_url: liveUrl,
      github_url: githubUrl,
      featured
    }).eq('id', id)

    if (error) {
      alert('Error updating project: ' + error.message)
      setIsSubmitting(false)
    } else {
      router.push('/admin/projects')
    }
  }

  if (status === 'loading' || isLoading) {
    return <div className="min-h-screen bg-slate-50 flex items-center justify-center font-mono text-xs uppercase tracking-widest text-gray-400">Loading editor...</div>
  }

  if (!session) return null

  return (
    <div className="min-h-screen bg-slate-50 flex font-sans">
      <aside className="w-64 bg-[#0B1120] text-white p-6 flex flex-col justify-between hidden md:flex">
        <div>
          <h2 className="text-xl font-light tracking-wide uppercase mb-10 text-white">Admin</h2>
          <nav className="flex flex-col gap-4 text-xs font-bold tracking-widest uppercase">
            <Link href="/admin/projects" className="text-gray-400 hover:text-white transition-colors">
              ← Back to Projects
            </Link>
          </nav>
        </div>
        <div>
          <button onClick={() => signOut({ callbackUrl: '/admin/login' })} className="w-full text-left text-xs font-bold tracking-widest uppercase text-gray-400 hover:text-red-400 transition-colors pt-6 border-t border-gray-800">
            ← Log Out
          </button>
        </div>
      </aside>

      <main className="flex-1 p-10 overflow-y-auto">
        <div className="max-w-3xl mx-auto bg-white p-8 rounded-lg shadow-sm border border-gray-100">
          <Link href="/admin/projects" className="text-[10px] font-bold tracking-widest uppercase text-gray-400 hover:text-gray-900 block mb-6 md:hidden">
            ← Back to Projects
          </Link>
          <h1 className="text-3xl font-light tracking-wide uppercase text-gray-900 mb-8">Edit Project</h1>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-[10px] font-bold tracking-widest uppercase text-gray-500 mb-2">Project Title</label>
              <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} required className="w-full border-b border-gray-300 py-2 outline-none focus:border-gray-900 text-gray-900 text-sm" />
            </div>

            <div>
              <label className="block text-[10px] font-bold tracking-widest uppercase text-gray-500 mb-2">Slug</label>
              <input type="text" value={slug} onChange={(e) => setSlug(e.target.value)} required className="w-full border-b border-gray-300 py-2 outline-none focus:border-gray-900 text-gray-500 font-mono text-sm" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-bold tracking-widest uppercase text-gray-500 mb-2">Category</label>
                <select value={category} onChange={(e) => setCategory(e.target.value)} className="w-full border-b border-gray-300 py-2 outline-none focus:border-gray-900 bg-white text-gray-900 text-sm">
                  <option value="Game Dev">Game Dev</option>
                  <option value="AI & ML">AI & ML</option>
                  <option value="Software Eng">Software Eng</option>
                  <option value="Web Apps">Web Apps</option>
                  <option value="Design">Design</option>
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-bold tracking-widest uppercase text-gray-500 mb-2">Status Label</label>
                <input type="text" value={statusVal} onChange={(e) => setStatusVal(e.target.value)} placeholder="e.g. IN DEVELOPMENT" className="w-full border-b border-gray-300 py-2 outline-none focus:border-gray-900 text-sm" />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold tracking-widest uppercase text-gray-500 mb-2">Tech Stack</label>
              <input type="text" value={techStack} onChange={(e) => setTechStack(e.target.value)} className="w-full border-b border-gray-300 py-2 outline-none focus:border-gray-900 text-sm font-mono" />
            </div>

            <div>
              <label className="block text-[10px] font-bold tracking-widest uppercase text-gray-500 mb-2">Short Description</label>
              <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={2} className="w-full border border-gray-200 p-3 outline-none focus:border-gray-900 text-gray-700 text-sm" />
            </div>

            {/* Structured Case Study — for your top projects */}
            <div className="pt-2 border-t border-gray-100">
              <p className="text-xs font-bold uppercase tracking-widest text-gray-900 mb-1 mt-4">Case Study (optional)</p>
              <p className="text-[11px] text-gray-400 mb-4">Fill these in for the projects you want recruiters to actually read.</p>
            </div>

            <div>
              <label className="block text-[10px] font-bold tracking-widest uppercase text-gray-500 mb-2">The Problem</label>
              <textarea value={problem} onChange={(e) => setProblem(e.target.value)} rows={3} className="w-full border border-gray-200 p-3 outline-none focus:border-gray-900 text-gray-700 text-sm" />
            </div>

            <div>
              <label className="block text-[10px] font-bold tracking-widest uppercase text-gray-500 mb-2">The Approach</label>
              <textarea value={approach} onChange={(e) => setApproach(e.target.value)} rows={3} className="w-full border border-gray-200 p-3 outline-none focus:border-gray-900 text-gray-700 text-sm" />
            </div>

            <div>
              <label className="block text-[10px] font-bold tracking-widest uppercase text-gray-500 mb-2">The Outcome</label>
              <textarea value={outcome} onChange={(e) => setOutcome(e.target.value)} rows={3} className="w-full border border-gray-200 p-3 outline-none focus:border-gray-900 text-gray-700 text-sm" />
            </div>

            <div>
              <label className="block text-[10px] font-bold tracking-widest uppercase text-gray-500 mb-2">Screenshots</label>
              {existingScreenshots.length > 0 && (
                <div className="grid grid-cols-4 gap-2 mb-3">
                  {existingScreenshots.map((src, i) => (
                    <div key={i} className="relative group">
                      <img src={src} alt="" className="w-full h-16 object-cover rounded border border-gray-200" />
                      <button
                        type="button"
                        onClick={() => setExistingScreenshots(prev => prev.filter((_, idx) => idx !== i))}
                        className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white rounded-full text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}
              <input type="file" accept="image/*" multiple onChange={(e) => setScreenshotFiles(e.target.files ? Array.from(e.target.files) : [])} className="w-full text-xs text-gray-500 file:mr-4 file:py-2 file:px-4 file:border-0 file:text-xs file:font-bold file:bg-gray-100 file:text-gray-900 hover:file:bg-gray-200 cursor-pointer" />
              <p className="text-[10px] text-gray-400 mt-1">New uploads are added to the existing screenshots above.</p>
            </div>

            <div>
              <label className="block text-[10px] font-bold tracking-widest uppercase text-gray-500 mb-2">Additional Content (HTML, optional)</label>
              <textarea 
                value={content} 
                onChange={(e) => setContent(e.target.value)} 
                rows={6} 
                placeholder="Optional — anything extra beyond Problem/Approach/Outcome, as HTML."
                className="w-full border border-gray-200 p-4 font-mono text-xs outline-none focus:border-gray-900 text-gray-700 rounded" 
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-bold tracking-widest uppercase text-gray-500 mb-2">Live Demo URL</label>
                <input type="url" value={liveUrl} onChange={(e) => setLiveUrl(e.target.value)} className="w-full border-b border-gray-300 py-2 outline-none focus:border-gray-900 text-sm" />
              </div>
              <div>
                <label className="block text-[10px] font-bold tracking-widest uppercase text-gray-500 mb-2">GitHub / Repo URL</label>
                <input type="url" value={githubUrl} onChange={(e) => setGithubUrl(e.target.value)} className="w-full border-b border-gray-300 py-2 outline-none focus:border-gray-900 text-sm" />
              </div>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <input type="checkbox" id="featured" checked={featured} onChange={(e) => setFeatured(e.target.checked)} className="w-4 h-4 accent-gray-900" />
              <label htmlFor="featured" className="text-xs font-bold uppercase tracking-wider text-gray-700">Feature this project on homepage</label>
            </div>

            <button type="submit" disabled={isSubmitting} className="w-full bg-[#aa002a] text-white text-xs font-bold tracking-widest uppercase py-4 rounded hover:bg-gray-900 transition-colors mt-6">
              {isSubmitting ? 'Saving...' : 'Save Changes'}
            </button>
          </form>
        </div>
      </main>
    </div>
  )
}