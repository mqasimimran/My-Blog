'use client'

import { useState, useEffect } from 'react'
import { useSession, signOut } from 'next-auth/react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'

export default function AdminSettingsPage() {
  const { data: session, status } = useSession()
  const [availableForWork, setAvailableForWork] = useState(true)
  const [availabilityMessage, setAvailabilityMessage] = useState('')
  const [nowText, setNowText] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    async function fetchSettings() {
      const { data, error } = await supabase.from('site_settings').select('*').eq('id', 1).single()
      if (error) console.error('Error fetching settings:', error)
      else if (data) {
        setAvailableForWork(data.available_for_work)
        setAvailabilityMessage(data.availability_message || '')
        setNowText(data.now_text || '')
      }
      setIsLoading(false)
    }

    if (status === 'authenticated') fetchSettings()
  }, [status])

  async function handleSave() {
    setIsSaving(true)
    const { error } = await supabase.from('site_settings').update({
      available_for_work: availableForWork,
      availability_message: availabilityMessage,
      now_text: nowText,
    }).eq('id', 1)

    if (error) {
      alert('Error saving: ' + error.message)
    } else {
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    }
    setIsSaving(false)
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
            <Link href="/admin/newsletter" className="text-gray-400 hover:text-white transition-colors">Newsletter</Link>
            <Link href="/admin/messages" className="text-gray-400 hover:text-white transition-colors">Messages</Link>
            <Link href="/admin/settings" className="text-[#aa002a]">Site Settings</Link>
            <Link href="/admin/resume" className="text-gray-400 hover:text-white transition-colors pt-2 border-t border-gray-800">Resume Manager</Link>
          </nav>
        </div>
        <div>
          <button onClick={() => signOut({ callbackUrl: '/admin/login' })} className="w-full text-left text-xs font-bold tracking-widest uppercase text-gray-400 hover:text-red-400 transition-colors pt-6 border-t border-gray-800">← Log Out</button>
        </div>
      </aside>

      <main className="flex-1 p-10 overflow-y-auto">
        <div className="max-w-2xl mx-auto bg-white p-8 rounded-lg shadow-sm border border-gray-100">
          <h1 className="text-3xl font-light tracking-wide uppercase text-gray-900 mb-8">Site Settings</h1>

          <div className="space-y-8">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-gray-900 mb-3">Availability Badge</p>
              <div className="flex items-center gap-3 mb-4">
                <input type="checkbox" id="available" checked={availableForWork} onChange={(e) => setAvailableForWork(e.target.checked)} className="w-4 h-4 accent-gray-900" />
                <label htmlFor="available" className="text-sm text-gray-700">Show "Available for work" badge on the homepage and Services</label>
              </div>
              <label className="block text-[10px] font-bold tracking-widest uppercase text-gray-500 mb-2">Badge Text</label>
              <input
                type="text"
                value={availabilityMessage}
                onChange={(e) => setAvailabilityMessage(e.target.value)}
                placeholder="Available for new projects"
                className="w-full border-b border-gray-300 py-2 outline-none focus:border-gray-900 text-sm"
              />
            </div>

            <div className="pt-6 border-t border-gray-100">
              <p className="text-xs font-bold uppercase tracking-widest text-gray-900 mb-3">"Right Now" Widget</p>
              <p className="text-[11px] text-gray-400 mb-3">Shown on the homepage. Leave blank to hide it.</p>
              <textarea
                value={nowText}
                onChange={(e) => setNowText(e.target.value)}
                rows={3}
                placeholder="e.g. Currently building a bilingual AI Urdu teaching assistant for my final year project."
                className="w-full border border-gray-200 p-3 outline-none focus:border-gray-900 text-gray-700 text-sm"
              />
            </div>

            <button onClick={handleSave} disabled={isSaving} className="w-full bg-[#aa002a] text-white text-xs font-bold tracking-widest uppercase py-4 rounded hover:bg-gray-900 transition-colors">
              {isSaving ? 'Saving...' : saved ? 'Saved!' : 'Save Settings'}
            </button>
          </div>
        </div>
      </main>
    </div>
  )
}
