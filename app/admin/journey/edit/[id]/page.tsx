'use client'

import { useState, useEffect, use } from 'react'
import { useSession, signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'

export default function EditJourneyEntryPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const { data: session, status } = useSession()
  const router = useRouter()

  const [dateLabel, setDateLabel] = useState('')
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [imageUrl, setImageUrl] = useState<string | null>(null)
  const [imageFile, setImageFile] = useState<File | null>(null)

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function fetchEntry() {
      const { data, error } = await supabase.from('journey_entries').select('*').eq('id', id).single()
      if (error) {
        console.error('Error fetching entry:', error)
      } else if (data) {
        setDateLabel(data.date_label)
        setTitle(data.title)
        setBody(data.body || '')
        setImageUrl(data.image_url || null)
      }
      setIsLoading(false)
    }

    if (status === 'authenticated') fetchEntry()
  }, [id, status])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    let finalImageUrl = imageUrl
    if (imageFile) {
      const fileExt = imageFile.name.split('.').pop()
      const fileName = `journey_${Math.random().toString(36).substring(2)}.${fileExt}`
      const { error: uploadError } = await supabase.storage.from('blog-images').upload(fileName, imageFile)
      if (uploadError) {
        alert('Error uploading image: ' + uploadError.message)
        setIsSubmitting(false)
        return
      }
      const { data: publicUrlData } = supabase.storage.from('blog-images').getPublicUrl(fileName)
      finalImageUrl = publicUrlData.publicUrl
    }

    const { error } = await supabase.from('journey_entries').update({
      date_label: dateLabel,
      title,
      body,
      image_url: finalImageUrl,
    }).eq('id', id)

    if (error) {
      alert('Error updating entry: ' + error.message)
      setIsSubmitting(false)
    } else {
      router.push('/admin/journey')
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
            <Link href="/admin/journey" className="text-gray-400 hover:text-white transition-colors">
              ← Back to My Journey
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
          <Link href="/admin/journey" className="text-[10px] font-bold tracking-widest uppercase text-gray-400 hover:text-gray-900 block mb-6 md:hidden">
            ← Back to My Journey
          </Link>
          <h1 className="text-3xl font-light tracking-wide uppercase text-gray-900 mb-8">Edit Journey Entry</h1>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-[10px] font-bold tracking-widest uppercase text-gray-500 mb-2">Date Label</label>
              <input type="text" value={dateLabel} onChange={(e) => setDateLabel(e.target.value)} required className="w-full border-b border-gray-300 py-2 outline-none focus:border-gray-900 text-sm" />
            </div>

            <div>
              <label className="block text-[10px] font-bold tracking-widest uppercase text-gray-500 mb-2">Title</label>
              <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} required className="w-full border-b border-gray-300 py-2 outline-none focus:border-gray-900 text-sm" />
            </div>

            <div>
              <label className="block text-[10px] font-bold tracking-widest uppercase text-gray-500 mb-2">Story (one paragraph per line)</label>
              <textarea value={body} onChange={(e) => setBody(e.target.value)} rows={6} className="w-full border border-gray-200 p-3 outline-none focus:border-gray-900 text-gray-700 text-sm" />
            </div>

            <div>
              <label className="block text-[10px] font-bold tracking-widest uppercase text-gray-500 mb-2">Photo</label>
              {imageUrl && !imageFile && (
                <img src={imageUrl} alt="Current" className="w-full h-40 object-cover rounded mb-2 border border-gray-200" />
              )}
              {imageFile && (
                <img src={URL.createObjectURL(imageFile)} alt="Preview" className="w-full h-40 object-cover rounded mb-2 border border-gray-200" />
              )}
              <input type="file" accept="image/*" onChange={(e) => setImageFile(e.target.files?.[0] || null)} className="w-full text-xs text-gray-500 file:mr-4 file:py-2 file:px-4 file:border-0 file:text-xs file:font-bold file:bg-gray-100 file:text-gray-900 hover:file:bg-gray-200 cursor-pointer" />
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
