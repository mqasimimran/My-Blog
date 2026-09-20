'use client'

import { useState, useEffect } from 'react'
import { useSession, signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'

export default function NewDesignPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [title, setTitle] = useState('')
  const [category, setCategory] = useState('Graphic Design')
  const [imageFiles, setImageFiles] = useState<File[]>([])
  const [featured, setFeatured] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files)
      setImageFiles((prev) => [...prev, ...filesArray])
    }
  }

  const removeImage = (index: number) => {
    setImageFiles(imageFiles.filter((_, idx) => idx !== index))
  }

  const moveImage = (index: number, direction: 'left' | 'right') => {
    const newIndex = direction === 'left' ? index - 1 : index + 1
    if (newIndex < 0 || newIndex >= imageFiles.length) return
    const updated = [...imageFiles]
    const [movedItem] = updated.splice(index, 1)
    updated.splice(newIndex, 0, movedItem)
    setImageFiles(updated)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (imageFiles.length === 0) {
      alert('Please select at least one image.')
      return
    }

    setIsSubmitting(true)
    const uploadedImageUrls: string[] = []

    for (let i = 0; i < imageFiles.length; i++) {
      const file = imageFiles[i]
      const fileExt = file.name.split('.').pop()
      const fileName = `design_${Math.random().toString(36).substring(2)}.${fileExt}`
      
      const { error: uploadError } = await supabase.storage.from('blog-images').upload(fileName, file)

      if (uploadError) {
        alert(`Error uploading image ${file.name}: ` + uploadError.message)
        setIsSubmitting(false)
        return
      }

      const { data: publicUrlData } = supabase.storage.from('blog-images').getPublicUrl(fileName)
      uploadedImageUrls.push(publicUrlData.publicUrl)
    }

    const { error } = await supabase.from('designs').insert([{
      title,
      category,
      images: uploadedImageUrls,
      featured
    }])

    if (error) {
      alert('Error saving design record: ' + error.message)
      setIsSubmitting(false)
    } else {
      router.push('/admin/designs')
    }
  }

  if (status === 'loading') {
    return <div className="min-h-screen bg-slate-50 flex items-center justify-center font-mono text-xs uppercase tracking-widest text-gray-400">Loading...</div>
  }

  if (!session) return null

  return (
    <div className="min-h-screen bg-slate-50 flex font-sans">
      <aside className="w-64 bg-gray-900 text-white p-6 flex flex-col justify-between hidden md:flex">
        <div>
          <h2 className="text-xl font-light tracking-wide uppercase mb-10 text-white">Admin</h2>
          <nav className="flex flex-col gap-4 text-xs font-bold tracking-widest uppercase">
            <Link href="/admin/designs" className="text-gray-400 hover:text-white transition-colors">
              ← Back to Designs
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
        <div className="max-w-2xl mx-auto bg-white p-8 rounded-lg shadow-sm border border-gray-100">
          <Link href="/admin/designs" className="text-[10px] font-bold tracking-widest uppercase text-gray-400 hover:text-gray-900 block mb-6 md:hidden">
            ← Back to Designs
          </Link>
          <h1 className="text-3xl font-light tracking-wide uppercase text-gray-900 mb-8">New Design Entry</h1>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-[10px] font-bold tracking-widest uppercase text-gray-500 mb-2">Design Title</label>
              <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} required className="w-full border-b border-gray-300 py-2 outline-none focus:border-gray-900 text-gray-900 text-sm" placeholder="e.g. TEDxUMTLahore Registration Poster" />
            </div>

            <div>
              <label className="block text-[10px] font-bold tracking-widest uppercase text-gray-500 mb-2">Category</label>
              <select value={category} onChange={(e) => setCategory(e.target.value)} className="w-full border-b border-gray-300 py-2 outline-none focus:border-gray-900 bg-white text-gray-900 text-sm">
                <option value="Branding &amp; Identity">Branding &amp; Identity</option>
                <option value="Logo Design">Logo Design</option>
                <option value="Social Media Posts">Social Media Posts</option>
                <option value="Print Design">Print Design</option>
                <option value="Packaging Design">Packaging Design</option>
                <option value="Product Design">Product Design</option>
                <option value="Advertising">Advertising</option>
                <option value="UI/UX Design">UI/UX Design</option>
                <option value="Illustration">Illustration</option>
                <option value="Graphic Design">Graphic Design (Other)</option>
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-bold tracking-widest uppercase text-gray-500 mb-2">Upload Images</label>
              <input type="file" accept="image/*" multiple onChange={handleFileChange} className="w-full text-xs text-gray-500 file:mr-4 file:py-2 file:px-4 file:border-0 file:text-xs file:font-bold file:bg-gray-100 file:text-gray-900 hover:file:bg-gray-200 cursor-pointer" />
            </div>

            {imageFiles.length > 0 && (
              <div>
                <label className="block text-[10px] font-bold tracking-widest uppercase text-gray-500 mb-2">Manage Sequence (<span className="text-[#aa002a]">First image is cover</span>)</label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {imageFiles.map((file, idx) => {
                    const previewUrl = URL.createObjectURL(file)
                    return (
                      <div key={idx} className="relative bg-gray-50 border border-gray-200 rounded-lg p-2 flex flex-col items-center">
                        <div className="relative w-full h-32 mb-2 rounded overflow-hidden bg-white border border-gray-100">
                          <img src={previewUrl} alt="Preview" className="w-full h-full object-contain" />
                          {idx === 0 && (
                            <span className="absolute bottom-1 left-1 bg-[#aa002a] text-white text-[8px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded">Cover</span>
                          )}
                          <button type="button" onClick={() => removeImage(idx)} className="absolute top-1 right-1 bg-red-600 text-white w-5 h-5 rounded-full text-[10px] font-bold flex items-center justify-center shadow hover:bg-red-700">✕</button>
                        </div>
                        <div className="flex items-center justify-between w-full text-xs">
                          <button type="button" disabled={idx === 0} onClick={() => moveImage(idx, 'left')} className="px-2 py-1 bg-gray-200 rounded disabled:opacity-35 hover:bg-gray-300 font-bold">←</button>
                          <span className="text-[10px] font-mono text-gray-500">#{idx + 1}</span>
                          <button type="button" disabled={idx === imageFiles.length - 1} onClick={() => moveImage(idx, 'right')} className="px-2 py-1 bg-gray-200 rounded disabled:opacity-35 hover:bg-gray-300 font-bold">→</button>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            <div>
              <label className="flex items-center gap-3 cursor-pointer">
                <input type="checkbox" checked={featured} onChange={(e) => setFeatured(e.target.checked)} className="w-4 h-4 text-[#aa002a] focus:ring-[#aa002a] rounded border-gray-300" />
                <span className="text-xs font-bold tracking-widest uppercase text-gray-700">Feature on Homepage</span>
              </label>
            </div>

            <button type="submit" disabled={isSubmitting} className="w-full bg-[#aa002a] text-white text-xs font-bold tracking-widest uppercase py-4 rounded hover:bg-gray-900 transition-colors mt-6">
              {isSubmitting ? 'Uploading & Publishing...' : 'Publish Design Entry'}
            </button>
          </form>
        </div>
      </main>
    </div>
  )
}