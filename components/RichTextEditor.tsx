'use client'

import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Image from '@tiptap/extension-image'
import { supabase } from '@/lib/supabase'
import { useState } from 'react'

export default function RichTextEditor({ 
  content, 
  onChange 
}: { 
  content: string
  onChange: (html: string) => void 
}) {
  const [isUploading, setIsUploading] = useState(false)

  const editor = useEditor({
    extensions: [
      StarterKit,
      Image.configure({
        HTMLAttributes: {
          class: 'rounded max-w-full my-8 shadow-sm cursor-pointer border hover:border-[#aa002a] transition-all',
        },
      })
    ],
    content: content,
    immediatelyRender: false,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML())
    },
    editorProps: {
      attributes: {
        class: [
          'min-h-[500px] outline-none text-gray-900 bg-white cursor-text text-lg leading-relaxed font-serif',
          '[&_h1]:text-4xl [&_h1]:font-bold [&_h1]:text-gray-900 [&_h1]:mt-10 [&_h1]:mb-4 [&_h1]:leading-tight [&_h1]:font-sans',
          '[&_h2]:text-3xl [&_h2]:font-bold [&_h2]:text-gray-900 [&_h2]:mt-8 [&_h2]:mb-3 [&_h2]:font-sans',
          '[&_h3]:text-2xl [&_h3]:font-semibold [&_h3]:text-gray-800 [&_h3]:mt-6 [&_h3]:mb-2 [&_h3]:font-sans',
          '[&_h4]:text-xl [&_h4]:font-medium [&_h4]:text-gray-800 [&_h4]:mt-5 [&_h4]:mb-2 [&_h4]:font-sans',
          '[&_h5]:text-lg [&_h5]:font-medium [&_h5]:text-gray-800 [&_h5]:mt-4 [&_h5]:mb-2 [&_h5]:font-sans',
          '[&_ul]:list-disc [&_ul]:pl-6 [&_ul]:my-4 [&_ul]:space-y-2',
          '[&_ol]:list-decimal [&_ol]:pl-6 [&_ol]:my-4 [&_ol]:space-y-2',
          '[&_li]:text-gray-800',
          '[&_p]:my-4 [&_p]:leading-loose',
          '[&_blockquote]:text-center [&_blockquote]:text-2xl [&_blockquote]:font-light [&_blockquote]:italic [&_blockquote]:text-gray-600 [&_blockquote]:my-10 [&_blockquote]:border-none [&_blockquote]:p-0',
          // New Code Block Styling
          '[&_pre]:bg-gray-900 [&_pre]:text-gray-100 [&_pre]:p-4 [&_pre]:rounded-lg [&_pre]:my-6 [&_pre]:overflow-x-auto [&_pre]:font-mono [&_pre]:text-sm',
          '[&_code]:font-mono [&_code]:bg-gray-100 [&_code]:text-[#aa002a] [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:rounded [&_code]:text-sm',
          '[&_pre_code]:bg-transparent [&_pre_code]:text-inherit [&_pre_code]:p-0', // Override inline code style when inside a pre block
        ].join(' ')
      },
    },
  })

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !editor) return

    setIsUploading(true)
    try {
      const fileExt = file.name.split('.').pop()
      const fileName = `${Math.random()}.${fileExt}`

      const { error: uploadError } = await supabase.storage
        .from('blog-images')
        .upload(fileName, file)

      if (uploadError) throw uploadError

      const { data } = supabase.storage.from('blog-images').getPublicUrl(fileName)
      editor.chain().focus().setImage({ src: data.publicUrl }).run()
    } catch (error) {
      console.error('Upload failed:', error)
      alert('Image upload failed.')
    } finally {
      setIsUploading(false)
    }
  }

  const removeSelectedImage = () => {
    if (!editor) return
    editor.chain().focus().deleteSelection().run()
  }

  if (!editor) return null

  const HeadingButton = ({ level }: { level: 1 | 2 | 3 | 4 | 5 }) => (
    <button 
      type="button" 
      onClick={() => editor.chain().focus().toggleHeading({ level }).run()} 
      className={`px-2 py-1.5 text-xs font-bold rounded transition-colors ${editor.isActive('heading', { level }) ? 'bg-gray-900 text-white' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100'}`}
    >
      H{level}
    </button>
  )

  return (
    <div className="flex flex-col bg-white">
      
      <div className="flex flex-wrap items-center justify-between border-b border-gray-100 pb-3 mb-6 sticky top-0 bg-white/95 backdrop-blur z-10">
        <div className="flex flex-wrap items-center gap-1">
          <button type="button" onClick={() => editor.chain().focus().toggleBold().run()} className={`px-3 py-1.5 text-xs font-bold rounded transition-colors ${editor.isActive('bold') ? 'bg-gray-900 text-white' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100'}`}>B</button>
          <button type="button" onClick={() => editor.chain().focus().toggleItalic().run()} className={`px-3 py-1.5 text-xs font-bold rounded italic transition-colors ${editor.isActive('italic') ? 'bg-gray-900 text-white' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100'}`}>I</button>
          
          <div className="w-px h-4 bg-gray-200 mx-2"></div>
          
          <HeadingButton level={1} />
          <HeadingButton level={2} />
          <HeadingButton level={3} />
          <HeadingButton level={4} />
          <HeadingButton level={5} />
          
          <div className="w-px h-4 bg-gray-200 mx-2"></div>
          
          <button type="button" onClick={() => editor.chain().focus().toggleBulletList().run()} className={`px-3 py-1.5 text-xs font-bold rounded transition-colors ${editor.isActive('bulletList') ? 'bg-gray-900 text-white' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100'}`}>• List</button>
          <button type="button" onClick={() => editor.chain().focus().toggleBlockquote().run()} className={`px-3 py-1.5 text-xs font-bold rounded transition-colors ${editor.isActive('blockquote') ? 'bg-gray-900 text-white' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100'}`}>” Quote</button>
          
          {/* New Code Block Button */}
          <button type="button" onClick={() => editor.chain().focus().toggleCodeBlock().run()} className={`px-3 py-1.5 text-xs font-bold rounded transition-colors ${editor.isActive('codeBlock') ? 'bg-gray-900 text-white' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100'}`}>{'</> Code'}</button>
          
          <div className="w-px h-4 bg-gray-200 mx-2"></div>
          
          <label className="cursor-pointer px-3 py-1.5 text-xs font-bold rounded text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition-colors flex items-center gap-1">
            {isUploading ? 'Uploading...' : '🖼️ Image'}
            <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
          </label>
        </div>

        {editor.isActive('image') && (
          <button 
            type="button" 
            onClick={removeSelectedImage}
            className="text-red-500 hover:text-red-700 text-[10px] font-bold tracking-widest uppercase transition-colors"
          >
            ✕ Remove Image
          </button>
        )}
      </div>

      <EditorContent editor={editor} />
    </div>
  )
}