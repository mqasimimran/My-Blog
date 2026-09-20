'use client'

import { useState, useEffect } from 'react'
import { useSession, signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'

type Message = {
  id: string
  name: string
  email: string
  subject: string
  message: string
  is_read: boolean
  created_at: string
}

export default function AdminMessagesPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [messages, setMessages] = useState<Message[]>([])
  const [isLoading, setIsLoading] = useState(true)


  useEffect(() => {
    async function fetchMessages() {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) console.error('Error fetching messages:', error)
      else setMessages(data || [])
      setIsLoading(false)
    }

    if (status === 'authenticated') {
      fetchMessages()
    }
  }, [status])

  const toggleReadStatus = async (id: string, currentStatus: boolean) => {
    const { data, error } = await supabase
      .from('messages')
      .update({ is_read: !currentStatus })
      .eq('id', id)
      .select() // Forces Supabase to return the updated row

    if (error) {
      alert(`Error: ${error.message}`)
    } else if (data && data.length === 0) {
      alert('Action blocked by Supabase permissions (RLS). Check your SQL policies.')
    } else {
      setMessages(prev => prev.map(msg => msg.id === id ? { ...msg, is_read: !currentStatus } : msg))
    }
  }

  const deleteMessage = async (id: string) => {
    console.log("1. Delete initiated for ID:", id)
    
    const { data, error } = await supabase
      .from('messages')
      .delete()
      .eq('id', id)
      .select() 

    console.log("2. Supabase Response:", { data, error })

    if (error) {
      alert(`Error deleting message: ${error.message}`)
    } else if (data && data.length === 0) {
      alert('Delete blocked by Supabase permissions. Check your browser console.')
    } else {
      console.log("3. Delete successful! Removing from UI.")
      setMessages(prev => prev.filter(msg => msg.id !== id))
    }
  }

  if (status === 'loading' || isLoading) {
    return <div className="min-h-screen bg-slate-50 flex items-center justify-center font-mono text-xs uppercase tracking-widest text-gray-400">Loading inbox...</div>
  }

  if (!session) return null

  return (
    <div className="min-h-screen bg-slate-50 flex font-sans">
      
      <aside className="w-64 bg-[#0B1120] text-white p-6 flex flex-col justify-between hidden md:flex">
        <div>
          <h2 className="text-xl font-light tracking-wide uppercase mb-10 text-white">Admin</h2>
          <nav className="flex flex-col gap-4 text-xs font-bold tracking-widest uppercase">
            <Link href="/admin" className="text-gray-400 hover:text-white transition-colors">Blogs / Articles</Link>
            <Link href="/admin/projects" className="text-gray-400 hover:text-white transition-colors">Projects</Link>
            <Link href="/admin/designs" className="text-gray-400 hover:text-white transition-colors">Design Gallery</Link>
            <Link href="/admin/services" className="text-gray-400 hover:text-white transition-colors">Services</Link>
            <Link href="/admin/journey" className="text-gray-400 hover:text-white transition-colors">My Journey</Link>
            <Link href="/admin/testimonials" className="text-gray-400 hover:text-white transition-colors">Testimonials</Link>
            <Link href="/admin/newsletter" className="text-gray-400 hover:text-white transition-colors">Newsletter</Link>
            <Link href="/admin/settings" className="text-gray-400 hover:text-white transition-colors">Site Settings</Link>
            <Link href="/admin/messages" className="text-[#aa002a]">Messages</Link>
            <Link href="/admin/resume" className="text-gray-400 hover:text-white transition-colors pt-2 border-t border-gray-800">
              Resume Manager
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
        <div className="max-w-5xl mx-auto">
          <div className="mb-10">
            <h1 className="text-3xl font-light tracking-wide uppercase text-gray-900">Inbox</h1>
            <p className="text-xs text-gray-500 mt-1">Manage client inquiries and contact forms</p>
          </div>

          {messages.length === 0 ? (
            <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-10 text-center text-sm text-gray-500">
              Your inbox is empty. No new messages!
            </div>
          ) : (
            <div className="space-y-4">
              {messages.map((msg) => (
                <div key={msg.id} className={`bg-white p-6 border rounded-lg shadow-sm transition-colors ${msg.is_read ? 'border-gray-200 opacity-70' : 'border-[#aa002a]/30 shadow-md'}`}>
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <div className="flex items-center gap-3">
                        <h2 className="text-lg font-medium text-gray-900">{msg.name}</h2>
                        {!msg.is_read && <span className="bg-[#aa002a] text-white text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full">New</span>}
                      </div>
                      <a href={`mailto:${msg.email}`} className="text-sm text-[#aa002a] hover:underline">{msg.email}</a>
                    </div>
                    <span className="text-xs text-gray-400 font-mono">
                      {new Date(msg.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  
                  <div className="mb-4">
                    <h3 className="text-xs font-bold tracking-widest uppercase text-gray-500 mb-2">Subject: {msg.subject || 'No Subject'}</h3>
                    <p className="text-gray-700 text-sm whitespace-pre-wrap bg-gray-50 p-4 rounded border border-gray-100">{msg.message}</p>
                  </div>

                  <div className="flex items-center justify-end gap-4 border-t border-gray-100 pt-4 mt-4">
                    <button onClick={() => toggleReadStatus(msg.id, msg.is_read)} className="text-xs font-bold tracking-widest uppercase text-gray-500 hover:text-gray-900">
                      {msg.is_read ? 'Mark as Unread' : 'Mark as Read'}
                    </button>
                   <button 
  type="button" 
  onClick={() => deleteMessage(msg.id)} 
  className="text-xs font-bold tracking-widest uppercase text-red-500 hover:text-red-700"
>
  Delete
</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}