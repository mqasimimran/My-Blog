'use client'

import { useState } from 'react'
import { useSession, signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'

function slugify(text: string) {
  return text.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
}

export default function NewProductPage() {
  const { data: session, status } = useSession()
  const router = useRouter()

  const [name, setName] = useState('')
  const [slug, setSlug] = useState('')
  const [slugTouched, setSlugTouched] = useState(false)
  const [type, setType] = useState<'digital' | 'physical'>('digital')
  const [category, setCategory] = useState('')
  const [description, setDescription] = useState('')
  const [price, setPrice] = useState('')
  const [compareAtPrice, setCompareAtPrice] = useState('')
  const [imageFiles, setImageFiles] = useState<File[]>([])
  const [digitalFile, setDigitalFile] = useState<File | null>(null)
  const [digitalLinkUrl, setDigitalLinkUrl] = useState('')
  const [stockQuantity, setStockQuantity] = useState('')
  const [weightGrams, setWeightGrams] = useState('')
  const [active, setActive] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleNameChange = (value: string) => {
    setName(value)
    if (!slugTouched) setSlug(slugify(value))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    const uploadedImageUrls: string[] = []
    for (const file of imageFiles) {
      const fileExt = file.name.split('.').pop()
      const fileName = `product_${Math.random().toString(36).substring(2)}.${fileExt}`
      const { error: uploadError } = await supabase.storage.from('blog-images').upload(fileName, file)
      if (uploadError) {
        alert('Error uploading an image: ' + uploadError.message)
        setIsSubmitting(false)
        return
      }
      const { data: publicUrlData } = supabase.storage.from('blog-images').getPublicUrl(fileName)
      uploadedImageUrls.push(publicUrlData.publicUrl)
    }

    let digitalFileUrl: string | null = null
    if (type === 'digital' && digitalLinkUrl.trim()) {
      // A pasted link (Canva template, Google Drive, Adobe CC share, etc.)
      // takes precedence over an uploaded file — these aren't downloadable
      // files at all, just a URL to hand the buyer.
      digitalFileUrl = digitalLinkUrl.trim()
    } else if (type === 'digital' && digitalFile) {
      const fileExt = digitalFile.name.split('.').pop()
      const fileName = `digital_${Math.random().toString(36).substring(2)}.${fileExt}`
      const { error: uploadError } = await supabase.storage.from('blog-images').upload(fileName, digitalFile)
      if (uploadError) {
        alert('Error uploading the digital file: ' + uploadError.message)
        setIsSubmitting(false)
        return
      }
      const { data: publicUrlData } = supabase.storage.from('blog-images').getPublicUrl(fileName)
      digitalFileUrl = publicUrlData.publicUrl
    }

    const { count } = await supabase.from('products').select('*', { count: 'exact', head: true })

    const { error } = await supabase.from('products').insert([{
      name,
      slug: slug || slugify(name),
      type,
      category: category || null,
      description,
      price: parseFloat(price) || 0,
      compare_at_price: compareAtPrice ? parseFloat(compareAtPrice) : null,
      images: uploadedImageUrls,
      digital_file_url: digitalFileUrl,
      stock_quantity: type === 'physical' && stockQuantity ? parseInt(stockQuantity) : null,
      weight_grams: type === 'physical' && weightGrams ? parseInt(weightGrams) : null,
      active,
      order_index: count || 0,
    }])

    if (error) {
      alert('Error saving product: ' + error.message)
      setIsSubmitting(false)
    } else {
      router.push('/admin/shop')
    }
  }

  if (status === 'loading') return <div className="min-h-screen bg-paper flex items-center justify-center font-mono text-xs uppercase tracking-widest text-ink-300">Loading...</div>
  if (!session) return null

  return (
    <div className="min-h-screen bg-paper flex font-sans">
      <aside className="w-64 bg-[#0B1120] text-white p-6 flex flex-col justify-between hidden md:flex">
        <div>
          <h2 className="text-xl font-light tracking-wide uppercase mb-10 text-white">Admin</h2>
          <nav className="flex flex-col gap-4 text-xs font-bold tracking-widest uppercase">
            <Link href="/admin/shop" className="text-ink-300 hover:text-white transition-colors">← Back to Shop</Link>
          </nav>
        </div>
        <div>
          <button onClick={() => signOut({ callbackUrl: '/admin/login' })} className="w-full text-left text-xs font-bold tracking-widest uppercase text-ink-300 hover:text-red-400 transition-colors pt-6 border-t border-gray-800">← Log Out</button>
        </div>
      </aside>

      <main className="flex-1 p-10 overflow-y-auto">
        <div className="max-w-2xl mx-auto bg-paper p-8 rounded-none shadow-sm border border-ink-100">
          <h1 className="text-3xl font-light tracking-wide uppercase text-ink-900 mb-2">New Product</h1>
          <p className="text-xs text-ink-300 mb-8">Browsing only for now — checkout isn't built yet.</p>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-[10px] font-bold tracking-widest uppercase text-ink-500 mb-2">Product Type</label>
              <div className="flex gap-3">
                <button type="button" onClick={() => setType('digital')} className={`flex-1 py-3 text-xs font-bold uppercase tracking-widest rounded-none border ${type === 'digital' ? 'bg-accent-600 text-white border-accent-600' : 'border-ink-100 text-ink-500'}`}>Digital</button>
                <button type="button" onClick={() => setType('physical')} className={`flex-1 py-3 text-xs font-bold uppercase tracking-widest rounded-none border ${type === 'physical' ? 'bg-accent-600 text-white border-accent-600' : 'border-ink-100 text-ink-500'}`}>Physical</button>
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold tracking-widest uppercase text-ink-500 mb-2">Product Name</label>
              <input type="text" value={name} onChange={(e) => handleNameChange(e.target.value)} required placeholder="e.g. Portfolio Website Template" className="w-full border-b border-ink-100 py-2 outline-none focus:border-ink-900 text-sm" />
            </div>

            <div>
              <label className="block text-[10px] font-bold tracking-widest uppercase text-ink-500 mb-2">URL Slug</label>
              <input type="text" value={slug} onChange={(e) => { setSlug(slugify(e.target.value)); setSlugTouched(true) }} required className="w-full border-b border-ink-100 py-2 outline-none focus:border-ink-900 text-ink-500 font-mono text-sm" />
              <p className="text-[10px] text-ink-300 mt-1">Page will be at /shop/{slug || '...'}</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-bold tracking-widest uppercase text-ink-500 mb-2">Category (optional)</label>
                <input type="text" value={category} onChange={(e) => setCategory(e.target.value)} placeholder="e.g. Templates" className="w-full border-b border-ink-100 py-2 outline-none focus:border-ink-900 text-sm" />
              </div>
              <div>
                <label className="block text-[10px] font-bold tracking-widest uppercase text-ink-500 mb-2">Price (USD)</label>
                <input type="number" step="0.01" value={price} onChange={(e) => setPrice(e.target.value)} required placeholder="29.00" className="w-full border-b border-ink-100 py-2 outline-none focus:border-ink-900 text-sm" />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold tracking-widest uppercase text-ink-500 mb-2">Compare-At Price (optional — shows as a strikethrough)</label>
              <input type="number" step="0.01" value={compareAtPrice} onChange={(e) => setCompareAtPrice(e.target.value)} placeholder="49.00" className="w-full border-b border-ink-100 py-2 outline-none focus:border-ink-900 text-sm" />
            </div>

            <div>
              <label className="block text-[10px] font-bold tracking-widest uppercase text-ink-500 mb-2">Description</label>
              <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={4} className="w-full border border-ink-100 p-3 outline-none focus:border-ink-900 text-ink-700 text-sm" />
            </div>

            <div>
              <label className="block text-[10px] font-bold tracking-widest uppercase text-ink-500 mb-2">Product Images (multiple)</label>
              <input type="file" accept="image/*" multiple onChange={(e) => setImageFiles(e.target.files ? Array.from(e.target.files) : [])} className="w-full text-xs text-ink-500 file:mr-4 file:py-2 file:px-4 file:border-0 file:text-xs file:font-bold file:bg-ink-100 file:text-ink-900 hover:file:bg-ink-100 cursor-pointer" />
            </div>

            {type === 'digital' ? (
              <div>
                <label className="block text-[10px] font-bold tracking-widest uppercase text-ink-500 mb-2">Digital File (optional for now)</label>
                <input type="file" onChange={(e) => setDigitalFile(e.target.files?.[0] || null)} disabled={!!digitalLinkUrl.trim()} className="w-full text-xs text-ink-500 file:mr-4 file:py-2 file:px-4 file:border-0 file:text-xs file:font-bold file:bg-ink-100 file:text-ink-900 hover:file:bg-ink-100 cursor-pointer disabled:opacity-40" />
                <div className="flex items-center gap-3 my-3">
                  <div className="h-px bg-ink-100 flex-1" />
                  <span className="text-[10px] text-ink-300 uppercase tracking-widest">Or</span>
                  <div className="h-px bg-ink-100 flex-1" />
                </div>
                <label className="block text-[10px] font-bold tracking-widest uppercase text-ink-500 mb-2">Paste a Link Instead</label>
                <input
                  type="url"
                  value={digitalLinkUrl}
                  onChange={(e) => setDigitalLinkUrl(e.target.value)}
                  placeholder="e.g. a Canva template link, Google Drive, or Adobe Creative Cloud share"
                  className="w-full border-b border-ink-100 py-2 outline-none focus:border-accent-600 text-sm"
                />
                <p className="text-[10px] text-ink-300 mt-1">Use this for Canva templates or anything not meant to be downloaded as a file — the buyer gets taken to this link instead.</p>
                <p className="text-[10px] text-ink-300 mt-1">This file isn't gated behind payment yet — it just gets stored, ready for when checkout is built.</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold tracking-widest uppercase text-ink-500 mb-2">Stock Quantity (optional)</label>
                  <input type="number" value={stockQuantity} onChange={(e) => setStockQuantity(e.target.value)} placeholder="Leave blank = unlimited" className="w-full border-b border-ink-100 py-2 outline-none focus:border-ink-900 text-sm" />
                </div>
                <div>
                  <label className="block text-[10px] font-bold tracking-widest uppercase text-ink-500 mb-2">Weight in grams (optional)</label>
                  <input type="number" value={weightGrams} onChange={(e) => setWeightGrams(e.target.value)} placeholder="For future shipping calc" className="w-full border-b border-ink-100 py-2 outline-none focus:border-ink-900 text-sm" />
                </div>
              </div>
            )}

            <div className="flex items-center gap-3 pt-2">
              <input type="checkbox" id="active" checked={active} onChange={(e) => setActive(e.target.checked)} className="w-4 h-4 accent-gray-900" />
              <label htmlFor="active" className="text-xs font-bold uppercase tracking-wider text-ink-700">Show this product on the site</label>
            </div>

            <button type="submit" disabled={isSubmitting} className="w-full bg-accent-600 text-white text-xs font-bold tracking-widest uppercase py-4 rounded-none hover:bg-gray-900 transition-colors mt-6">
              {isSubmitting ? 'Saving...' : 'Save Product'}
            </button>
          </form>
        </div>
      </main>
    </div>
  )
}
