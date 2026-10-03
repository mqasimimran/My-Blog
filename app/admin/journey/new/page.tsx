'use client'

import { useState } from 'react'
import { useSession, signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'

export default function NewJourneyEntryPage() {
  const { data: session, status } = useSession()
  const router = useRouter()

  const [dateLabel, setDateLabel] = useState('')
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    let imageUrl: string | null = null
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
      imageUrl = publicUrlData.publicUrl
    }

    const { count } = await supabase.from('journey_entries').select('*', { count: 'exact', head: true })

    const { error } = await supabase.from('journey_entries').insert([{
      date_label: dateLabel,
      title,
      body,
      image_url: imageUrl,
      order_index: count || 0,
    }])

    if (error) {
      alert('Error saving entry: ' + error.message)
      setIsSubmitting(false)
    } else {
      router.push('/admin/journey')
    }
  }

  if (status === 'loading') {
    return <div className="min-h-screen bg-paper flex items-center justify-center font-mono text-xs uppercase tracking-widest text-ink-300">Loading...</div>
  }

  if (!session) return null

  return (
    <div className="min-h-screen bg-paper flex font-sans">
      <aside className="w-64 bg-[#0B1120] text-white p-6 flex flex-col justify-between hidden md:flex">
        <div>
          <h2 className="text-xl font-light tracking-wide uppercase mb-10 text-white">Admin</h2>
          <nav className="flex flex-col gap-4 text-xs font-bold tracking-widest uppercase">
            <Link href="/admin/journey" className="text-ink-300 hover:text-white transition-colors">
              ← Back to My Journey
            </Link>
          </nav>
        </div>
        <div>
          <button onClick={() => signOut({ callbackUrl: '/admin/login' })} className="w-full text-left text-xs font-bold tracking-widest uppercase text-ink-300 hover:text-red-400 transition-colors pt-6 border-t border-gray-800">
            ← Log Out
          </button>
        </div>
      </aside>

      <main className="flex-1 p-10 overflow-y-auto">
        <div className="max-w-2xl mx-auto bg-paper p-8 rounded-none shadow-sm border border-ink-100">
          <Link href="/admin/journey" className="text-[10px] font-bold tracking-widest uppercase text-ink-300 hover:text-ink-900 block mb-6 md:hidden">
            ← Back to My Journey
          </Link>
          <h1 className="text-3xl font-light tracking-wide uppercase text-ink-900 mb-8">New Journey Entry</h1>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-[10px] font-bold tracking-widest uppercase text-ink-500 mb-2">Date Label</label>
              <input type="text" value={dateLabel} onChange={(e) => setDateLabel(e.target.value)} required placeholder="e.g. 2021 — 2023, or August 2026" className="w-full border-b border-ink-100 py-2 outline-none focus:border-ink-900 text-sm" />
            </div>

            <div>
              <label className="block text-[10px] font-bold tracking-widest uppercase text-ink-500 mb-2">Title</label>
              <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} required placeholder="e.g. Where it started" className="w-full border-b border-ink-100 py-2 outline-none focus:border-ink-900 text-sm" />
            </div>

            <div>
              <label className="block text-[10px] font-bold tracking-widest uppercase text-ink-500 mb-2">Story (one paragraph per line)</label>
              <textarea value={body} onChange={(e) => setBody(e.target.value)} rows={6} className="w-full border border-ink-100 p-3 outline-none focus:border-ink-900 text-ink-700 text-sm" placeholder="Write it the way you'd tell it to someone." />
            </div>

            <div>
              <label className="block text-[10px] font-bold tracking-widest uppercase text-ink-500 mb-2">Photo</label>
              <input type="file" accept="image/*" onChange={(e) => setImageFile(e.target.files?.[0] || null)} className="w-full text-xs text-ink-500 file:mr-4 file:py-2 file:px-4 file:border-0 file:text-xs file:font-bold file:bg-ink-100 file:text-ink-900 hover:file:bg-ink-100 cursor-pointer" />
              {imageFile && (
                <img src={URL.createObjectURL(imageFile)} alt="Preview" className="w-full h-40 object-cover rounded-none mt-3 border border-ink-100" />
              )}
            </div>

            <button type="submit" disabled={isSubmitting} className="w-full bg-accent-600 text-white text-xs font-bold tracking-widest uppercase py-4 rounded-none hover:bg-gray-900 transition-colors mt-6">
              {isSubmitting ? 'Saving...' : 'Save Entry'}
            </button>
          </form>
        </div>
      </main>
    </div>
  )
}
