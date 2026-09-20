'use client'

import { useState, useEffect } from 'react'
import { useSession, signOut } from 'next-auth/react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'

type Subscriber = { id: string; email: string; created_at: string }

export default function AdminNewsletterPage() {
  const { data: session, status } = useSession()
  const [subscribers, setSubscribers] = useState<Subscriber[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    async function fetchSubscribers() {
      const { data, error } = await supabase
        .from('newsletter_subscribers')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) console.error('Error fetching subscribers:', error)
      else setSubscribers(data || [])
      setIsLoading(false)
    }

    if (status === 'authenticated') fetchSubscribers()
  }, [status])

  async function deleteSubscriber(id: string) {
    if (!confirm('Remove this subscriber?')) return
    const { error } = await supabase.from('newsletter_subscribers').delete().eq('id', id)
    if (error) alert('Error: ' + error.message)
    else setSubscribers(prev => prev.filter(s => s.id !== id))
  }

  function copyAllEmails() {
    const emails = subscribers.map(s => s.email).join(', ')
    navigator.clipboard.writeText(emails)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (status === 'loading' || isLoading) {
    return <div className="min-h-screen bg-slate-50 flex items-center justify-center font-mono text-sm text-gray-500">Loading admin portal...</div>
  }

  if (!session) return null

  return (
    <div className="min-h-screen bg-slate-50 flex font-sans">
      <aside className="w-64 bg-gray-900 text-white p-6 flex flex-col justify-between hidden md:flex">
        <div>
          <h2 className="text-xl font-light tracking-wide uppercase mb-10">Admin</h2>
          <nav className="flex flex-col gap-4 text-xs font-bold tracking-widest uppercase">
            <Link href="/admin" className="text-gray-400 hover:text-white transition-colors">Blogs / Articles</Link>
            <Link href="/admin/projects" className="text-gray-400 hover:text-white transition-colors">Projects</Link>
            <Link href="/admin/designs" className="text-gray-400 hover:text-white transition-colors">Design Gallery</Link>
            <Link href="/admin/services" className="text-gray-400 hover:text-white transition-colors">Services</Link>
            <Link href="/admin/journey" className="text-gray-400 hover:text-white transition-colors">My Journey</Link>
            <Link href="/admin/testimonials" className="text-gray-400 hover:text-white transition-colors">Testimonials</Link>
            <Link href="/admin/newsletter" className="text-[#aa002a]">Newsletter</Link>
            <Link href="/admin/messages" className="text-gray-400 hover:text-white transition-colors">Messages</Link>
            <Link href="/admin/settings" className="text-gray-400 hover:text-white transition-colors">Site Settings</Link>
            <Link href="/admin/resume" className="text-gray-400 hover:text-white transition-colors pt-2 border-t border-gray-800">Resume Manager</Link>
          </nav>
        </div>
        <div>
          <button onClick={() => signOut({ callbackUrl: '/admin/login' })} className="w-full text-left text-xs font-bold tracking-widest uppercase text-gray-400 hover:text-red-400 transition-colors pt-6 border-t border-gray-800">← Log Out</button>
        </div>
      </aside>

      <main className="flex-1 p-10 overflow-y-auto">
        <div className="max-w-3xl mx-auto">
          <div className="flex justify-between items-center mb-10">
            <div>
              <h1 className="text-3xl font-light tracking-wide uppercase text-gray-900">Newsletter</h1>
              <p className="text-xs text-gray-500 mt-1">{subscribers.length} subscriber{subscribers.length !== 1 ? 's' : ''}</p>
            </div>
            {subscribers.length > 0 && (
              <button onClick={copyAllEmails} className="bg-gray-900 text-white text-xs font-bold tracking-widest uppercase px-6 py-3 rounded hover:bg-[#aa002a] transition-colors">
                {copied ? 'Copied!' : 'Copy All Emails'}
              </button>
            )}
          </div>

          {subscribers.length === 0 ? (
            <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-10 text-center text-sm text-gray-500">
              No subscribers yet.
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow-sm border border-gray-100 divide-y divide-gray-100">
              {subscribers.map((s) => (
                <div key={s.id} className="p-4 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{s.email}</p>
                    <p className="text-[10px] text-gray-400">{new Date(s.created_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
                  </div>
                  <button onClick={() => deleteSubscriber(s.id)} className="text-xs font-bold tracking-widest text-red-500 hover:text-red-700 uppercase">Remove</button>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
