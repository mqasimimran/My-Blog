'use client'

import { useState, useEffect, use } from 'react'
import { useRouter } from 'next/navigation'
import { adminStorage } from '@/lib/adminStorage'
import { adminApi } from '@/lib/adminApi'
import Link from 'next/link'
import RichTextEditor from '@/components/RichTextEditor'
import { siteConfig } from '@/site.config'

// ISO time -> the value a datetime-local input expects, in the visitor's own timezone.
const toLocalInput = (iso: string) => new Date(new Date(iso).getTime() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 16)

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
  const [titleUr, setTitleUr] = useState('')
  const [excerptUr, setExcerptUr] = useState('')
  const [contentUr, setContentUr] = useState('')
  const [quiz, setQuiz] = useState('')
  const [drafting, setDrafting] = useState(false)
  const [urduKey, setUrduKey] = useState(0)
  const [readTime, setReadTime] = useState('5 min read')
  const [featureImage, setFeatureImage] = useState('')
  const [isPublished, setIsPublished] = useState(false)
  const [wasPublished, setWasPublished] = useState(false)
  const [publishAt, setPublishAt] = useState('')
  const [articleSlug, setArticleSlug] = useState('')

  useEffect(() => {
    async function fetchArticle() {
      try {
        const data = await adminApi.get('articles', articleId)
        if (data) {
          setTitle(data.title)
          setCategory(data.category)
          setExcerpt(data.excerpt || '')
          setContent(data.content)
          setTitleUr(data.title_ur || '')
          setExcerptUr(data.excerpt_ur || '')
          setContentUr(data.content_ur || '')
          setQuiz(data.quiz || '')
          setReadTime(data.read_time || '')
          setFeatureImage(data.feature_image || '')
          setIsPublished(data.published)
          setWasPublished(data.published)
          setPublishAt(data.publish_at ? toLocalInput(data.publish_at) : '')
          setArticleSlug(data.slug || '')
        }
      } catch (err: any) {
        console.error('Error fetching article:', err.message)
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

      const { error } = await adminStorage.from('blog-images').upload(fileName, file)
      if (error) throw error

      const { data } = adminStorage.from('blog-images').getPublicUrl(fileName)
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

    try {
      await adminApi.update('articles', articleId, {
        title,
        category,
        excerpt,
        content,
        title_ur: titleUr.trim() || null,
        excerpt_ur: excerptUr.trim() || null,
        content_ur: contentUr && contentUr !== '<p></p>' ? contentUr : null,
        quiz: quiz.trim() || null,
        read_time: readTime,
        feature_image: featureImage,
        published: isPublished,
        publish_at: publishAt ? new Date(publishAt).toISOString() : null,
      })
      // Only notify on the draft → published transition — never on a
      // re-save of a post that was already live, which would otherwise
      // re-email every subscriber on every minor edit.
      // Scheduled posts aren't emailed now: they're still hidden until their publish time.
      const scheduled = !!publishAt && new Date(publishAt) > new Date()
      if (isPublished && !wasPublished && !scheduled) {
        fetch('/api/newsletter/notify-subscribers', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ articleTitle: title, articleSlug: articleSlug, articleExcerpt: excerpt }),
        }).catch((err) => console.error('Newsletter notification failed (article was still saved):', err))
      }
      router.push('/admin')
    } catch (err: any) {
      console.error('Error updating article:', err.message)
      alert('Failed to update article.')
      setIsSubmitting(false)
    }
  }

  if (isLoading) return <div className="p-20 text-center font-mono text-ink-500 text-sm">Loading editor...</div>

  return (
    <div className="min-h-screen bg-paper flex">
      <aside className="w-64 bg-paper text-ink-900 border-r border-ink-100 p-6 flex flex-col hidden md:flex">
        <h2 className="text-xl font-light tracking-wide uppercase mb-10">{siteConfig.firstName} Admin</h2>
        <nav className="flex flex-col gap-4 text-xs font-bold tracking-widest uppercase">
          <Link href="/admin" className="text-left text-accent-600 transition-colors">← Back to Blogs</Link>
        </nav>
      </aside>

      <main className="flex-1 p-6 md:p-10 max-w-4xl mx-auto w-full">
        <div className="mb-10">
          <h1 className="text-3xl font-light tracking-wide uppercase text-ink-900">Edit Article</h1>
          <p className="text-ink-500 text-sm mt-2">Update your content, cover image, or publication status.</p>
        </div>

        <form onSubmit={handleUpdate} className="space-y-6 bg-paper p-8 rounded-none shadow-sm border border-ink-100">
          
          {/* Feature Image Uploader */}
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
              <input type="text" value={excerpt} onChange={(e) => setExcerpt(e.target.value)} className="w-full border-b border-ink-100 py-2 outline-none focus:border-accent-600 transition-colors text-sm text-ink-900" />
            </div>
            <div>
              <label className="block text-[10px] font-bold tracking-widest uppercase text-ink-500 mb-2">Read Time</label>
              <input type="text" value={readTime} onChange={(e) => setReadTime(e.target.value)} className="w-full border-b border-ink-100 py-2 outline-none focus:border-accent-600 transition-colors text-sm text-ink-900" />
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-bold tracking-widest uppercase text-ink-500 mb-2">Article Content</label>
            <RichTextEditor content={content} onChange={setContent} />
          </div>

          <div className="pt-6 border-t border-ink-100">
            <label className="block text-[10px] font-bold tracking-widest uppercase text-ink-500 mb-1">Quiz (optional)</label>
            <p className="mb-3 text-xs text-ink-500">Shown at the end of the post. One question per block, blank line between. Start with "Q:", list answers with "- ", put a * after the right one, and optionally add "Why:".</p>
            <textarea rows={6} value={quiz} onChange={(e) => setQuiz(e.target.value)} placeholder={'Q: What does CNN stand for?\n- Convolutional neural network *\n- Central neural node\nWhy: Convolution layers scan images for patterns.'} className="w-full border border-ink-100 p-3 font-mono text-sm outline-none focus:border-ink-900" />
          </div>

          <div className="pt-6 border-t border-ink-100">
            <p className="block text-[10px] font-bold tracking-widest uppercase text-ink-500 mb-1">Urdu version (optional)</p>
            <button type="button" disabled={drafting} onClick={async () => {
              if ((titleUr || contentUr.replace(/<[^>]+>/g, '').trim()) && !confirm('Replace the current Urdu version with an AI draft?')) return
              setDrafting(true)
              try {
                const res = await fetch('/api/admin/translate', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ title, excerpt, content }) })
                const d = await res.json()
                if (!res.ok) alert(d.error || 'The AI draft did not work.')
                else { setTitleUr(d.title); setExcerptUr(d.excerpt || ''); setContentUr(d.content); setUrduKey((k) => k + 1) }
              } catch { alert('The AI draft did not work.') }
              setDrafting(false)
            }} className="mb-4 bg-ink-900 px-4 py-2 text-xs font-medium uppercase tracking-[0.08em] text-paper hover:bg-accent-600 disabled:opacity-60">{drafting ? 'Drafting...' : 'Draft Urdu with AI'}</button>
            <p className="mb-5 text-xs text-ink-500">Visitors reading the site in Urdu see this version. Leave it empty and they see the English post with a short note.</p>
            <div dir="rtl" lang="ur" className="space-y-6">
              <div>
                <label className="block text-[10px] font-bold tracking-widest uppercase text-ink-500 mb-2" dir="ltr">Urdu title</label>
                <input type="text" value={titleUr} onChange={(e) => setTitleUr(e.target.value)} className="w-full border-b border-ink-100 py-2 text-lg outline-none focus:border-ink-900" />
              </div>
              <div>
                <label className="block text-[10px] font-bold tracking-widest uppercase text-ink-500 mb-2" dir="ltr">Urdu summary</label>
                <input type="text" value={excerptUr} onChange={(e) => setExcerptUr(e.target.value)} className="w-full border-b border-ink-100 py-2 outline-none focus:border-ink-900" />
              </div>
              <div>
                <label className="block text-[10px] font-bold tracking-widest uppercase text-ink-500 mb-2" dir="ltr">Urdu text</label>
                <RichTextEditor key={urduKey} content={contentUr} onChange={setContentUr} />
              </div>
            </div>
          </div>

          <div className="pt-6 border-t border-ink-100">
            <label htmlFor="publish-at" className="block text-xs font-bold tracking-widest uppercase text-ink-700 mb-2">Publish at (optional)</label>
            <input id="publish-at" type="datetime-local" value={publishAt} onChange={(e) => setPublishAt(e.target.value)} className="border border-ink-100 p-3 text-sm" />
            <p className="mt-2 text-[11px] text-ink-500">Leave empty to go live as soon as it&rsquo;s published. With a time set, the post stays hidden until then (your local time). Scheduled posts aren&rsquo;t emailed to subscribers.</p>
          </div>

          <div className="flex items-center justify-between pt-6 border-t border-ink-100">
            <label className="flex items-center gap-3 cursor-pointer">
              <input type="checkbox" checked={isPublished} onChange={(e) => setIsPublished(e.target.checked)} className="w-4 h-4 text-accent-600 focus:ring-accent-600 rounded-none border-ink-100" />
              <span className="text-xs font-bold tracking-widest uppercase text-ink-700">Published to Public Blog</span>
            </label>

            <button type="submit" disabled={isSubmitting} className="bg-accent-600 text-white text-xs font-bold tracking-widest uppercase px-8 py-3 rounded-none hover:bg-gray-900 transition-colors disabled:opacity-50">
              {isSubmitting ? 'Updating...' : 'Update Article'}
            </button>
          </div>

        </form>
      </main>
    </div>
  )
}