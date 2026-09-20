'use client'

import { useState } from 'react'
import { useSession, signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'

function slugify(text: string) {
  return text.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
}

export default function NewServicePage() {
  const { data: session, status } = useSession()
  const router = useRouter()

  const [name, setName] = useState('')
  const [slug, setSlug] = useState('')
  const [slugTouched, setSlugTouched] = useState(false)
  const [tagline, setTagline] = useState('')
  const [description, setDescription] = useState('')
  const [includes, setIncludes] = useState('')
  const [icon, setIcon] = useState('')
  const [startingPrice, setStartingPrice] = useState('')
  const [coverImageFile, setCoverImageFile] = useState<File | null>(null)
  const [active, setActive] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleNameChange = (value: string) => {
    setName(value)
    if (!slugTouched) setSlug(slugify(value))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    let coverImageUrl: string | null = null
    if (coverImageFile) {
      const fileExt = coverImageFile.name.split('.').pop()
      const fileName = `service_${Math.random().toString(36).substring(2)}.${fileExt}`
      const { error: uploadError } = await supabase.storage.from('blog-images').upload(fileName, coverImageFile)
      if (uploadError) {
        alert('Error uploading cover image: ' + uploadError.message)
        setIsSubmitting(false)
        return
      }
      const { data: publicUrlData } = supabase.storage.from('blog-images').getPublicUrl(fileName)
      coverImageUrl = publicUrlData.publicUrl
    }

    // Put this new service at the end of the current order
    const { count } = await supabase.from('services').select('*', { count: 'exact', head: true })

    const { data: inserted, error } = await supabase.from('services').insert([{
      name,
      slug: slug || slugify(name),
      tagline,
      description,
      includes,
      icon,
      cover_image: coverImageUrl,
      starting_price: startingPrice,
      active,
      order_index: count || 0,
    }]).select().single()

    if (error) {
      alert('Error saving service: ' + error.message)
      setIsSubmitting(false)
    } else {
      router.push(`/admin/services/${inserted.id}/packages`)
    }
  }

  if (status === 'loading') {
    return <div className="min-h-screen bg-slate-50 flex items-center justify-center font-mono text-xs uppercase tracking-widest text-gray-400">Loading...</div>
  }

  if (!session) return null

  return (
    <div className="min-h-screen bg-slate-50 flex font-sans">
      <aside className="w-64 bg-[#0B1120] text-white p-6 flex flex-col justify-between hidden md:flex">
        <div>
          <h2 className="text-xl font-light tracking-wide uppercase mb-10 text-white">Admin</h2>
          <nav className="flex flex-col gap-4 text-xs font-bold tracking-widest uppercase">
            <Link href="/admin/services" className="text-gray-400 hover:text-white transition-colors">
              ← Back to Services
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
          <Link href="/admin/services" className="text-[10px] font-bold tracking-widest uppercase text-gray-400 hover:text-gray-900 block mb-6 md:hidden">
            ← Back to Services
          </Link>
          <h1 className="text-3xl font-light tracking-wide uppercase text-gray-900 mb-2">New Service</h1>
          <p className="text-xs text-gray-400 mb-8">After saving, you'll add Basic/Standard/Premium packages on the next screen.</p>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-[1fr_auto] gap-4">
              <div>
                <label className="block text-[10px] font-bold tracking-widest uppercase text-gray-500 mb-2">Service Name</label>
                <input type="text" value={name} onChange={(e) => handleNameChange(e.target.value)} required placeholder="e.g. Logo Design" className="w-full border-b border-gray-300 py-2 outline-none focus:border-gray-900 text-gray-900 text-sm" />
              </div>
              <div>
                <label className="block text-[10px] font-bold tracking-widest uppercase text-gray-500 mb-2">Icon</label>
                <input type="text" value={icon} onChange={(e) => setIcon(e.target.value)} placeholder="🎨" className="w-20 border-b border-gray-300 py-2 outline-none focus:border-gray-900 text-center text-lg" />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold tracking-widest uppercase text-gray-500 mb-2">URL Slug</label>
              <input type="text" value={slug} onChange={(e) => { setSlug(slugify(e.target.value)); setSlugTouched(true) }} required className="w-full border-b border-gray-300 py-2 outline-none focus:border-gray-900 text-gray-500 font-mono text-sm" />
              <p className="text-[10px] text-gray-400 mt-1">Page will be at /services/{slug || '...'}</p>
            </div>

            <div>
              <label className="block text-[10px] font-bold tracking-widest uppercase text-gray-500 mb-2">Cover Image (optional)</label>
              <input type="file" accept="image/*" onChange={(e) => setCoverImageFile(e.target.files?.[0] || null)} className="w-full text-xs text-gray-500 file:mr-4 file:py-2 file:px-4 file:border-0 file:text-xs file:font-bold file:bg-gray-100 file:text-gray-900 hover:file:bg-gray-200 cursor-pointer" />
            </div>

            <div>
              <label className="block text-[10px] font-bold tracking-widest uppercase text-gray-500 mb-2">Tagline</label>
              <input type="text" value={tagline} onChange={(e) => setTagline(e.target.value)} placeholder="e.g. Clean, memorable marks that scale" className="w-full border-b border-gray-300 py-2 outline-none focus:border-gray-900 text-sm" />
            </div>

            <div>
              <label className="block text-[10px] font-bold tracking-widest uppercase text-gray-500 mb-2">Description</label>
              <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} className="w-full border border-gray-200 p-3 outline-none focus:border-gray-900 text-gray-700 text-sm" />
            </div>

            <div>
              <label className="block text-[10px] font-bold tracking-widest uppercase text-gray-500 mb-2">
                What's Included (one per line) — only shown if you don't add packages below
              </label>
              <textarea
                value={includes}
                onChange={(e) => setIncludes(e.target.value)}
                rows={4}
                placeholder={'Responsive, mobile-first builds\nNext.js / React front-end\nDeployment on Vercel'}
                className="w-full border border-gray-200 p-3 outline-none focus:border-gray-900 text-gray-700 text-sm font-mono"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold tracking-widest uppercase text-gray-500 mb-2">Fallback Starting Price (optional, used only if no packages are set)</label>
              <input type="text" value={startingPrice} onChange={(e) => setStartingPrice(e.target.value)} placeholder="e.g. Starting at $300, or Custom Quote" className="w-full border-b border-gray-300 py-2 outline-none focus:border-gray-900 text-sm" />
            </div>

            <div className="flex items-center gap-3 pt-2">
              <input type="checkbox" id="active" checked={active} onChange={(e) => setActive(e.target.checked)} className="w-4 h-4 accent-gray-900" />
              <label htmlFor="active" className="text-xs font-bold uppercase tracking-wider text-gray-700">Show this service on the site</label>
            </div>

            <button type="submit" disabled={isSubmitting} className="w-full bg-[#aa002a] text-white text-xs font-bold tracking-widest uppercase py-4 rounded hover:bg-gray-900 transition-colors mt-6">
              {isSubmitting ? 'Saving...' : 'Save & Add Packages →'}
            </button>
          </form>
        </div>
      </main>
    </div>
  )
}
