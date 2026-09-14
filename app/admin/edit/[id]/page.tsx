'use client'

import { useState, useEffect, use } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import RichTextEditor from '@/components/RichTextEditor'

export default function EditArticle({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter()
  // React 19 / Next 15 requires unwrapping the params Promise
  const resolvedParams = use(params)
  const articleId = resolvedParams.id

  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isUploadingImage, setIsUploadingImage] = useState(false)
  
  // Form State
  const [title, setTitle] = useState('')
  const [category, setCategory] = useState('Engineering')
  const [excerpt, setExcerpt] = useState('')
  const [content, setContent] = useState('')
  const [readTime, setReadTime] = useState('5 min read')
  const [featureImage, setFeatureImage] = useState('')
  const [isPublished, setIsPublished] = useState(false)

  useEffect(() => {
    async function fetchArticle() {
      const { data, error } = await supabase
        .from('articles')
        .select('*')
        .eq('id', articleId)
        .single()

      if (data) {
        setTitle(data.title)
        setCategory(data.category)
        setExcerpt(data.excerpt || '')
        setContent(data.content)
        setReadTime(data.read_time || '')
        setFeatureImage(data.feature_image || '')
        setIsPublished(data.published)
      } else if (error) {
        console.error('Error fetching article:', error)
      }
      setIsLoading(false)
    }

    if (articleId) fetchArticle()
  }, [articleId])

  const handleFeatureImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setIsUploadingImage(true)
    try {
      const fileExt = file.name.split('.').pop()
      const fileName = `feature-${Math.random()}.${fileExt}`

      const { error } = await supabase.storage.from('blog-images').upload(fileName, file)
      if (error) throw error

      const { data } = supabase.storage.from('blog-images').getPublicUrl(fileName)
      setFeatureImage(data.publicUrl)
    } catch (error) {
      console.error('Error uploading feature image:', error)
      alert('Failed to upload image.')
    } finally {
      setIsUploadingImage(false)
    }
  }

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    const { error } = await supabase
      .from('articles')
      .update({
        title,
        category,
        excerpt,
        content,
        read_time: readTime,
        feature_image: featureImage,
        published: isPublished
      })
      .eq('id', articleId)

    if (error) {
      console.error('Error updating article:', error)
      alert('Failed to update article.')
      setIsSubmitting(false)
    } else {
      router.push('/admin')
    }
  }

  if (isLoading) return <div className="p-20 text-center font-mono text-gray-500 text-sm">Loading editor...</div>

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <aside className="w-64 bg-gray-900 text-white p-6 flex flex-col hidden md:flex">
        <h2 className="text-xl font-light tracking-wide uppercase mb-10">Qasmic Admin</h2>
        <nav className="flex flex-col gap-4 text-xs font-bold tracking-widest uppercase">
          <Link href="/admin" className="text-left text-[#aa002a] transition-colors">← Back to Blogs</Link>
        </nav>
      </aside>

      <main className="flex-1 p-6 md:p-10 max-w-4xl mx-auto w-full">
        <div className="mb-10">
          <h1 className="text-3xl font-light tracking-wide uppercase text-gray-900">Edit Article</h1>
          <p className="text-gray-500 text-sm mt-2">Update your content, cover image, or publication status.</p>
        </div>

        <form onSubmit={handleUpdate} className="space-y-6 bg-white p-8 rounded-lg shadow-sm border border-gray-100">
          
          {/* Feature Image Uploader */}
          <div className="border-b border-gray-100 pb-6">
            <label className="block text-[10px] font-bold tracking-widest uppercase text-gray-500 mb-2">Feature Image (Cover)</label>
            {featureImage ? (
              <div className="relative w-full h-48 bg-gray-100 rounded overflow-hidden">
                <img src={featureImage} alt="Feature" className="w-full h-full object-cover" />
                <button type="button" onClick={() => setFeatureImage('')} className="absolute top-2 right-2 bg-red-600 text-white text-xs px-2 py-1 rounded shadow">Remove</button>
              </div>
            ) : (
              <label className="w-full h-32 border-2 border-dashed border-gray-300 rounded flex flex-col items-center justify-center cursor-pointer hover:border-[#aa002a] transition-colors bg-gray-50">
                <span className="text-sm text-gray-500 font-medium">
                  {isUploadingImage ? 'Uploading...' : '+ Click to Upload Cover Image'}
                </span>
                <input type="file" accept="image/*" onChange={handleFeatureImageUpload} className="hidden" />
              </label>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2">
              <label className="block text-[10px] font-bold tracking-widest uppercase text-gray-500 mb-2">Article Title</label>
              <input type="text" required value={title} onChange={(e) => setTitle(e.target.value)} className="w-full border-b border-gray-300 py-2 outline-none focus:border-[#aa002a] transition-colors text-lg text-gray-900" />
            </div>
            <div>
              <label className="block text-[10px] font-bold tracking-widest uppercase text-gray-500 mb-2">Category</label>
          <select value={category} onChange={(e) => setCategory(e.target.value)} className="w-full border-b border-gray-300 py-2 outline-none focus:border-[#aa002a] bg-white text-gray-900">
                <option value="Engineering">Engineering</option>
                <option value="Design">Design</option>
                <option value="Productivity">Productivity</option>
                <option value="Leadership">Leadership</option>
                <option value="Personal Growth">Personal Growth</option>
                <option value="Game Development">Game Development</option>
                <option value="Artificial Intelligence">Artificial Intelligence</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="md:col-span-3">
              <label className="block text-[10px] font-bold tracking-widest uppercase text-gray-500 mb-2">Short Excerpt</label>
              <input type="text" value={excerpt} onChange={(e) => setExcerpt(e.target.value)} className="w-full border-b border-gray-300 py-2 outline-none focus:border-[#aa002a] transition-colors text-sm text-gray-900" />
            </div>
            <div>
              <label className="block text-[10px] font-bold tracking-widest uppercase text-gray-500 mb-2">Read Time</label>
              <input type="text" value={readTime} onChange={(e) => setReadTime(e.target.value)} className="w-full border-b border-gray-300 py-2 outline-none focus:border-[#aa002a] transition-colors text-sm text-gray-900" />
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-bold tracking-widest uppercase text-gray-500 mb-2">Article Content</label>
            <RichTextEditor content={content} onChange={setContent} />
          </div>

          <div className="flex items-center justify-between pt-6 border-t border-gray-100">
            <label className="flex items-center gap-3 cursor-pointer">
              <input type="checkbox" checked={isPublished} onChange={(e) => setIsPublished(e.target.checked)} className="w-4 h-4 text-[#aa002a] focus:ring-[#aa002a] rounded border-gray-300" />
              <span className="text-xs font-bold tracking-widest uppercase text-gray-700">Published to Public Blog</span>
            </label>

            <button type="submit" disabled={isSubmitting} className="bg-[#aa002a] text-white text-xs font-bold tracking-widest uppercase px-8 py-3 rounded hover:bg-gray-900 transition-colors disabled:opacity-50">
              {isSubmitting ? 'Updating...' : 'Update Article'}
            </button>
          </div>

        </form>
      </main>
    </div>
  )
}