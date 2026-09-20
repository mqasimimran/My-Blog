'use client'

import { useState, useEffect, use } from 'react'
import { useSession, signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'

export default function EditTestimonialPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const { data: session, status } = useSession()
  const router = useRouter()

  const [name, setName] = useState('')
  const [role, setRole] = useState('')
  const [quote, setQuote] = useState('')
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null)
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [active, setActive] = useState(true)

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function fetchTestimonial() {
      const { data, error } = await supabase.from('testimonials').select('*').eq('id', id).single()
      if (error) {
        console.error('Error fetching testimonial:', error)
      } else if (data) {
        setName(data.name)
        setRole(data.role || '')
        setQuote(data.quote)
        setAvatarUrl(data.avatar_url || null)
        setActive(data.active)
      }
      setIsLoading(false)
    }

    if (status === 'authenticated') fetchTestimonial()
  }, [id, status])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    let finalAvatarUrl = avatarUrl
    if (avatarFile) {
      const fileExt = avatarFile.name.split('.').pop()
      const fileName = `testimonial_${Math.random().toString(36).substring(2)}.${fileExt}`
      const { error: uploadError } = await supabase.storage.from('blog-images').upload(fileName, avatarFile)
      if (uploadError) {
        alert('Error uploading photo: ' + uploadError.message)
        setIsSubmitting(false)
        return
      }
      const { data: publicUrlData } = supabase.storage.from('blog-images').getPublicUrl(fileName)
      finalAvatarUrl = publicUrlData.publicUrl
    }

    const { error } = await supabase.from('testimonials').update({
      name, role, quote, avatar_url: finalAvatarUrl, active,
    }).eq('id', id)

    if (error) {
      alert('Error updating testimonial: ' + error.message)
      setIsSubmitting(false)
    } else {
      router.push('/admin/testimonials')
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
            <Link href="/admin/testimonials" className="text-gray-400 hover:text-white transition-colors">← Back to Testimonials</Link>
          </nav>
        </div>
        <div>
          <button onClick={() => signOut({ callbackUrl: '/admin/login' })} className="w-full text-left text-xs font-bold tracking-widest uppercase text-gray-400 hover:text-red-400 transition-colors pt-6 border-t border-gray-800">← Log Out</button>
        </div>
      </aside>

      <main className="flex-1 p-10 overflow-y-auto">
        <div className="max-w-2xl mx-auto bg-white p-8 rounded-lg shadow-sm border border-gray-100">
          <Link href="/admin/testimonials" className="text-[10px] font-bold tracking-widest uppercase text-gray-400 hover:text-gray-900 block mb-6 md:hidden">← Back to Testimonials</Link>
          <h1 className="text-3xl font-light tracking-wide uppercase text-gray-900 mb-8">Edit Testimonial</h1>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-[10px] font-bold tracking-widest uppercase text-gray-500 mb-2">Name</label>
              <input type="text" value={name} onChange={(e) => setName(e.target.value)} required className="w-full border-b border-gray-300 py-2 outline-none focus:border-gray-900 text-sm" />
            </div>

            <div>
              <label className="block text-[10px] font-bold tracking-widest uppercase text-gray-500 mb-2">Role / Context</label>
              <input type="text" value={role} onChange={(e) => setRole(e.target.value)} className="w-full border-b border-gray-300 py-2 outline-none focus:border-gray-900 text-sm" />
            </div>

            <div>
              <label className="block text-[10px] font-bold tracking-widest uppercase text-gray-500 mb-2">Quote</label>
              <textarea value={quote} onChange={(e) => setQuote(e.target.value)} required rows={4} className="w-full border border-gray-200 p-3 outline-none focus:border-gray-900 text-gray-700 text-sm" />
            </div>

            <div>
              <label className="block text-[10px] font-bold tracking-widest uppercase text-gray-500 mb-2">Photo</label>
              {avatarUrl && !avatarFile && (
                <img src={avatarUrl} alt="Current" className="w-16 h-16 rounded-full object-cover mb-2 border border-gray-200" />
              )}
              <input type="file" accept="image/*" onChange={(e) => setAvatarFile(e.target.files?.[0] || null)} className="w-full text-xs text-gray-500 file:mr-4 file:py-2 file:px-4 file:border-0 file:text-xs file:font-bold file:bg-gray-100 file:text-gray-900 hover:file:bg-gray-200 cursor-pointer" />
            </div>

            <div className="flex items-center gap-3 pt-2">
              <input type="checkbox" id="active" checked={active} onChange={(e) => setActive(e.target.checked)} className="w-4 h-4 accent-gray-900" />
              <label htmlFor="active" className="text-xs font-bold uppercase tracking-wider text-gray-700">Show on the homepage</label>
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
