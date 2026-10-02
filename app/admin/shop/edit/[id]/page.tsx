'use client'

import { useState, useEffect, use } from 'react'
import { useSession, signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'

function slugify(text: string) {
  return text.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
}

export default function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const { data: session, status } = useSession()
  const router = useRouter()

  const [name, setName] = useState('')
  const [slug, setSlug] = useState('')
  const [type, setType] = useState<'digital' | 'physical'>('digital')
  const [category, setCategory] = useState('')
  const [description, setDescription] = useState('')
  const [price, setPrice] = useState('')
  const [compareAtPrice, setCompareAtPrice] = useState('')
  const [existingImages, setExistingImages] = useState<string[]>([])
  const [newImageFiles, setNewImageFiles] = useState<File[]>([])
  const [digitalFileUrl, setDigitalFileUrl] = useState<string | null>(null)
  const [digitalFile, setDigitalFile] = useState<File | null>(null)
  const [stockQuantity, setStockQuantity] = useState('')
  const [weightGrams, setWeightGrams] = useState('')
  const [active, setActive] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function fetchProduct() {
      const { data, error } = await supabase.from('products').select('*').eq('id', id).single()
      if (error) {
        console.error(error)
      } else if (data) {
        setName(data.name)
        setSlug(data.slug)
        setType(data.type)
        setCategory(data.category || '')
        setDescription(data.description || '')
        setPrice(String(data.price))
        setCompareAtPrice(data.compare_at_price ? String(data.compare_at_price) : '')
        setExistingImages(data.images || [])
        setDigitalFileUrl(data.digital_file_url || null)
        setStockQuantity(data.stock_quantity ? String(data.stock_quantity) : '')
        setWeightGrams(data.weight_grams ? String(data.weight_grams) : '')
        setActive(data.active)
      }
      setIsLoading(false)
    }
    if (status === 'authenticated') fetchProduct()
  }, [id, status])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    let finalImages = [...existingImages]
    for (const file of newImageFiles) {
      const fileExt = file.name.split('.').pop()
      const fileName = `product_${Math.random().toString(36).substring(2)}.${fileExt}`
      const { error: uploadError } = await supabase.storage.from('blog-images').upload(fileName, file)
      if (uploadError) {
        alert('Error uploading an image: ' + uploadError.message)
        setIsSubmitting(false)
        return
      }
      const { data: publicUrlData } = supabase.storage.from('blog-images').getPublicUrl(fileName)
      finalImages.push(publicUrlData.publicUrl)
    }

    let finalDigitalFileUrl = digitalFileUrl
    if (digitalFile) {
      const fileExt = digitalFile.name.split('.').pop()
      const fileName = `digital_${Math.random().toString(36).substring(2)}.${fileExt}`
      const { error: uploadError } = await supabase.storage.from('blog-images').upload(fileName, digitalFile)
      if (uploadError) {
        alert('Error uploading the digital file: ' + uploadError.message)
        setIsSubmitting(false)
        return
      }
      const { data: publicUrlData } = supabase.storage.from('blog-images').getPublicUrl(fileName)
      finalDigitalFileUrl = publicUrlData.publicUrl
    }

    const { error } = await supabase.from('products').update({
      name,
      slug: slug || slugify(name),
      type,
      category: category || null,
      description,
      price: parseFloat(price) || 0,
      compare_at_price: compareAtPrice ? parseFloat(compareAtPrice) : null,
      images: finalImages,
      digital_file_url: finalDigitalFileUrl,
      stock_quantity: type === 'physical' && stockQuantity ? parseInt(stockQuantity) : null,
      weight_grams: type === 'physical' && weightGrams ? parseInt(weightGrams) : null,
      active,
    }).eq('id', id)

    if (error) {
      alert('Error updating product: ' + error.message)
      setIsSubmitting(false)
    } else {
      router.push('/admin/shop')
    }
  }

  if (status === 'loading' || isLoading) return <div className="min-h-screen bg-slate-50 flex items-center justify-center font-mono text-xs uppercase tracking-widest text-gray-400">Loading editor...</div>
  if (!session) return null

  return (
    <div className="min-h-screen bg-slate-50 flex font-sans">
      <aside className="w-64 bg-[#0B1120] text-white p-6 flex flex-col justify-between hidden md:flex">
        <div>
          <h2 className="text-xl font-light tracking-wide uppercase mb-10 text-white">Admin</h2>
          <nav className="flex flex-col gap-4 text-xs font-bold tracking-widest uppercase">
            <Link href="/admin/shop" className="text-gray-400 hover:text-white transition-colors">← Back to Shop</Link>
          </nav>
        </div>
        <div>
          <button onClick={() => signOut({ callbackUrl: '/admin/login' })} className="w-full text-left text-xs font-bold tracking-widest uppercase text-gray-400 hover:text-red-400 transition-colors pt-6 border-t border-gray-800">← Log Out</button>
        </div>
      </aside>

      <main className="flex-1 p-10 overflow-y-auto">
        <div className="max-w-2xl mx-auto bg-white p-8 rounded-lg shadow-sm border border-gray-100">
          <h1 className="text-3xl font-light tracking-wide uppercase text-gray-900 mb-8">Edit Product</h1>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-[10px] font-bold tracking-widest uppercase text-gray-500 mb-2">Product Type</label>
              <div className="flex gap-3">
                <button type="button" onClick={() => setType('digital')} className={`flex-1 py-3 text-xs font-bold uppercase tracking-widest rounded border ${type === 'digital' ? 'bg-[#aa002a] text-white border-[#aa002a]' : 'border-gray-200 text-gray-500'}`}>Digital</button>
                <button type="button" onClick={() => setType('physical')} className={`flex-1 py-3 text-xs font-bold uppercase tracking-widest rounded border ${type === 'physical' ? 'bg-[#aa002a] text-white border-[#aa002a]' : 'border-gray-200 text-gray-500'}`}>Physical</button>
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold tracking-widest uppercase text-gray-500 mb-2">Product Name</label>
              <input type="text" value={name} onChange={(e) => setName(e.target.value)} required className="w-full border-b border-gray-300 py-2 outline-none focus:border-gray-900 text-sm" />
            </div>

            <div>
              <label className="block text-[10px] font-bold tracking-widest uppercase text-gray-500 mb-2">URL Slug</label>
              <input type="text" value={slug} onChange={(e) => setSlug(slugify(e.target.value))} required className="w-full border-b border-gray-300 py-2 outline-none focus:border-gray-900 text-gray-500 font-mono text-sm" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-bold tracking-widest uppercase text-gray-500 mb-2">Category</label>
                <input type="text" value={category} onChange={(e) => setCategory(e.target.value)} className="w-full border-b border-gray-300 py-2 outline-none focus:border-gray-900 text-sm" />
              </div>
              <div>
                <label className="block text-[10px] font-bold tracking-widest uppercase text-gray-500 mb-2">Price (USD)</label>
                <input type="number" step="0.01" value={price} onChange={(e) => setPrice(e.target.value)} required className="w-full border-b border-gray-300 py-2 outline-none focus:border-gray-900 text-sm" />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold tracking-widest uppercase text-gray-500 mb-2">Compare-At Price (optional)</label>
              <input type="number" step="0.01" value={compareAtPrice} onChange={(e) => setCompareAtPrice(e.target.value)} className="w-full border-b border-gray-300 py-2 outline-none focus:border-gray-900 text-sm" />
            </div>

            <div>
              <label className="block text-[10px] font-bold tracking-widest uppercase text-gray-500 mb-2">Description</label>
              <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={4} className="w-full border border-gray-200 p-3 outline-none focus:border-gray-900 text-gray-700 text-sm" />
            </div>

            <div>
              <label className="block text-[10px] font-bold tracking-widest uppercase text-gray-500 mb-2">Images</label>
              {existingImages.length > 0 && (
                <div className="grid grid-cols-4 gap-2 mb-3">
                  {existingImages.map((src, i) => (
                    <div key={i} className="relative group">
                      <img src={src} alt="" className="w-full h-16 object-cover rounded border border-gray-200" />
                      <button type="button" onClick={() => setExistingImages(prev => prev.filter((_, idx) => idx !== i))} className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white rounded-full text-xs opacity-0 group-hover:opacity-100 transition-opacity">×</button>
                    </div>
                  ))}
                </div>
              )}
              <input type="file" accept="image/*" multiple onChange={(e) => e.target.files && setNewImageFiles(Array.from(e.target.files))} className="w-full text-xs text-gray-500 file:mr-4 file:py-2 file:px-4 file:border-0 file:text-xs file:font-bold file:bg-gray-100 file:text-gray-900 hover:file:bg-gray-200 cursor-pointer" />
            </div>

            {type === 'digital' ? (
              <div>
                <label className="block text-[10px] font-bold tracking-widest uppercase text-gray-500 mb-2">Digital File</label>
                {digitalFileUrl && !digitalFile && <p className="text-xs text-gray-500 mb-2 truncate">Current: {digitalFileUrl}</p>}
                <input type="file" onChange={(e) => setDigitalFile(e.target.files?.[0] || null)} className="w-full text-xs text-gray-500 file:mr-4 file:py-2 file:px-4 file:border-0 file:text-xs file:font-bold file:bg-gray-100 file:text-gray-900 hover:file:bg-gray-200 cursor-pointer" />
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold tracking-widest uppercase text-gray-500 mb-2">Stock Quantity</label>
                  <input type="number" value={stockQuantity} onChange={(e) => setStockQuantity(e.target.value)} className="w-full border-b border-gray-300 py-2 outline-none focus:border-gray-900 text-sm" />
                </div>
                <div>
                  <label className="block text-[10px] font-bold tracking-widest uppercase text-gray-500 mb-2">Weight (grams)</label>
                  <input type="number" value={weightGrams} onChange={(e) => setWeightGrams(e.target.value)} className="w-full border-b border-gray-300 py-2 outline-none focus:border-gray-900 text-sm" />
                </div>
              </div>
            )}

            <div className="flex items-center gap-3 pt-2">
              <input type="checkbox" id="active" checked={active} onChange={(e) => setActive(e.target.checked)} className="w-4 h-4 accent-gray-900" />
              <label htmlFor="active" className="text-xs font-bold uppercase tracking-wider text-gray-700">Show this product on the site</label>
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
