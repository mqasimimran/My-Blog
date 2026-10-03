'use client'

import { useState, useEffect } from 'react'
import { useSession, signOut } from 'next-auth/react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import AdminNav from '@/app/admin/AdminNav'

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
    return <div className="min-h-screen bg-paper flex items-center justify-center font-mono text-sm text-ink-500">Loading admin portal...</div>
  }

  if (!session) return null

  return (
    <div className="min-h-screen bg-paper flex flex-col md:flex-row font-sans">
      <AdminNav />

      <main className="flex-1 p-10 overflow-y-auto">
        <div className="max-w-3xl mx-auto">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-10">
            <div>
              <h1 className="text-3xl font-light tracking-wide uppercase text-ink-900">Newsletter</h1>
              <p className="text-xs text-ink-500 mt-1">{subscribers.length} subscriber{subscribers.length !== 1 ? 's' : ''}</p>
            </div>
            {subscribers.length > 0 && (
              <button onClick={copyAllEmails} className="bg-gray-900 text-white text-xs font-bold tracking-widest uppercase px-6 py-3 rounded-none hover:bg-accent-600 transition-colors">
                {copied ? 'Copied!' : 'Copy All Emails'}
              </button>
            )}
          </div>

          {subscribers.length === 0 ? (
            <div className="bg-paper rounded-none shadow-sm border border-ink-100 p-10 text-center text-sm text-ink-500">
              No subscribers yet.
            </div>
          ) : (
            <div className="bg-paper rounded-none shadow-sm border border-ink-100 divide-y divide-gray-100">
              {subscribers.map((s) => (
                <div key={s.id} className="p-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm font-medium text-ink-900">{s.email}</p>
                    <p className="text-[10px] text-ink-300">{new Date(s.created_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
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
