'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import RichTextEditor from '@/components/RichTextEditor'

export default function NewArticle() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isUploadingImage, setIsUploadingImage] = useState(false)
  
  const [title, setTitle] = useState('')
  const [category, setCategory] = useState('Engineering')
  const [excerpt, setExcerpt] = useState('')
  const [content, setContent] = useState('')
  const [readTime, setReadTime] = useState('5 min read')
  const [featureImage, setFeatureImage] = useState('')

  const generateSlug = (text: string) => {
    return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '')
  }

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

  const handleSubmit = async (e: React.FormEvent, publishStatus: boolean) => {
    e.preventDefault()
    if (!title || !content) return alert('Title and content are required!')
    
    setIsSubmitting(true)
    const slug = generateSlug(title)

    const { error } = await supabase.from('articles').insert([{
      title,
      slug,
      category,
      excerpt,
      content,
      read_time: readTime,
      feature_image: featureImage,
      published: publishStatus
    }])

    if (error) {
      console.error('Error saving article:', error.message)
      alert('Failed to save article.')
      setIsSubmitting(false)
    } else {
      if (publishStatus) {
        // Best-effort — don't block navigation on this
        fetch('/api/newsletter/notify-subscribers', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ articleTitle: title, articleSlug: slug, articleExcerpt: excerpt }),
        }).catch((err) => console.error('Newsletter notification failed (article was still saved):', err))
      }
      router.push('/admin')
    }
  }

  return (
    <div className="min-h-screen bg-paper flex">
      <aside className="w-64 bg-gray-900 text-white p-6 flex flex-col hidden md:flex">
        <h2 className="text-xl font-light tracking-wide uppercase mb-10">Admin</h2>
        <nav className="flex flex-col gap-4 text-xs font-bold tracking-widest uppercase">
          <Link href="/admin" className="text-left text-accent-600 transition-colors">← Back to Blogs</Link>
        </nav>
      </aside>

      <main className="flex-1 p-6 md:p-10 max-w-4xl mx-auto w-full">
        <div className="mb-10">
          <h1 className="text-3xl font-light tracking-wide uppercase text-ink-900">Write New Article</h1>
        </div>

        <form className="space-y-6 bg-paper p-8 rounded-none shadow-sm border border-ink-100">
          
          <div className="border-b border-ink-100 pb-6">
            <label className="block text-[10px] font-bold tracking-widest uppercase text-ink-500 mb-2">Feature Image (Cover)</label>
            {featureImage ? (
              <div className="relative w-full h-48 bg-ink-100 rounded-none overflow-hidden">
                <img src={featureImage} alt="Feature" className="w-full h-full object-cover" />
                <button type="button" onClick={() => setFeatureImage('')} className="absolute top-2 right-2 bg-red-600 text-white text-xs px-2 py-1 rounded-none shadow">Remove</button>
              </div>
            ) : (
              <label className="w-full h-32 border-2 border-dashed border-ink-100 rounded-none flex flex-col items-center justify-center cursor-pointer hover:border-accent-600 transition-colors bg-paper">
                <span className="text-sm text-ink-500 font-medium">
                  {isUploadingImage ? 'Uploading...' : '+ Click to Upload Cover Image'}
                </span>
                <input type="file" accept="image/*" onChange={handleFeatureImageUpload} className="hidden" />
              </label>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2">
              <label className="block text-[10px] font-bold tracking-widest uppercase text-ink-500 mb-2">Article Title</label>
              <input type="text" required value={title} onChange={(e) => setTitle(e.target.value)} className="w-full border-b border-ink-100 py-2 outline-none focus:border-accent-600 transition-colors text-lg text-ink-900" />
            </div>
            <div>
              <label className="block text-[10px] font-bold tracking-widest uppercase text-ink-500 mb-2">Category</label>
              <select value={category} onChange={(e) => setCategory(e.target.value)} className="w-full border-b border-ink-100 py-2 outline-none focus:border-accent-600 bg-paper text-ink-900">
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
              <label className="block text-[10px] font-bold tracking-widest uppercase text-ink-500 mb-2">Short Excerpt</label>
              <input type="text" value={excerpt} onChange={(e) => setExcerpt(e.target.value)} className="w-full border-b border-ink-100 py-2 outline-none focus:border-accent-600 text-sm text-ink-900" />
            </div>
            <div>
              <label className="block text-[10px] font-bold tracking-widest uppercase text-ink-500 mb-2">Read Time</label>
              <input type="text" value={readTime} onChange={(e) => setReadTime(e.target.value)} className="w-full border-b border-ink-100 py-2 outline-none focus:border-accent-600 text-sm text-ink-900" />
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-bold tracking-widest uppercase text-ink-500 mb-2">Article Content</label>
            <RichTextEditor content={content} onChange={setContent} />
          </div>

          <div className="flex items-center justify-end gap-4 pt-6 border-t border-ink-100">
            <button 
              type="button"
              onClick={(e) => handleSubmit(e, false)}
              disabled={isSubmitting}
              className="bg-ink-100 text-ink-700 text-xs font-bold tracking-widest uppercase px-6 py-3 rounded-none hover:bg-ink-100 transition-colors disabled:opacity-50"
            >
              Save Draft
            </button>

            <button 
              type="button" 
              onClick={(e) => handleSubmit(e, true)}
              disabled={isSubmitting}
              className="bg-accent-600 text-white text-xs font-bold tracking-widest uppercase px-8 py-3 rounded-none hover:bg-gray-900 transition-colors disabled:opacity-50"
            >
              Publish Live
            </button>
          </div>

        </form>
      </main>
    </div>
  )
}