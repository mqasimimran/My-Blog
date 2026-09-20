'use client'

import { useState, useEffect } from 'react'
import { useSession, signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'

// Define the exact shape of your data to keep TypeScript happy
interface Article {
  id: string
  title: string
  category: string
  published: boolean
  featured: boolean
  created_at?: string
}

export default function AdminDashboard() {
  const { data: session, status } = useSession()
  const router = useRouter()
  
  // Use the interface instead of any[]
  const [articles, setArticles] = useState<Article[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [stats, setStats] = useState<{
    unreadMessages: number
    subscribers: number
    activeTestimonials: number
    mostLovedPost: { title: string; slug: string; reaction_count: number } | null
  } | null>(null)

  useEffect(() => {
    async function fetchArticles() {
      const { data, error } = await supabase
        .from('articles')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Supabase fetch error on articles:', error.message)
      } else {
        setArticles((data as Article[]) || [])
      }
      setIsLoading(false)
    }

    async function fetchStats() {
      const [messagesRes, subscribersRes, testimonialsRes, topPostRes] = await Promise.all([
        supabase.from('messages').select('*', { count: 'exact', head: true }).eq('is_read', false),
        supabase.from('newsletter_subscribers').select('*', { count: 'exact', head: true }),
        supabase.from('testimonials').select('*', { count: 'exact', head: true }).eq('active', true),
        supabase.from('articles').select('title, slug, reaction_count').order('reaction_count', { ascending: false }).limit(1).single(),
      ])

      setStats({
        unreadMessages: messagesRes.count || 0,
        subscribers: subscribersRes.count || 0,
        activeTestimonials: testimonialsRes.count || 0,
        mostLovedPost: topPostRes.data && topPostRes.data.reaction_count > 0 ? topPostRes.data : null,
      })
    }

    if (status === 'authenticated') {
      fetchArticles()
      fetchStats()
    }
  }, [status])

  async function toggleFeatured(article: Article) {
    const { error } = await supabase.from('articles').update({ featured: !article.featured }).eq('id', article.id)
    if (error) {
      alert('Error updating: ' + error.message)
    } else {
      setArticles(prev => prev.map(a => a.id === article.id ? { ...a, featured: !a.featured } : a))
    }
  }

  if (status === 'loading' || isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center font-mono text-sm text-gray-500">
        Loading admin portal...
      </div>
    )
  }

  if (!session) return null

  return (
    <div className="min-h-screen bg-slate-50 flex font-sans">
      {/* Sidebar Navigation */}
      <aside className="w-64 bg-gray-900 text-white p-6 flex flex-col justify-between hidden md:flex">
        <div>
          <h2 className="text-xl font-light tracking-wide uppercase mb-10">Admin</h2>
          <nav className="flex flex-col gap-4 text-xs font-bold tracking-widest uppercase">
            <Link href="/admin" className="text-[#aa002a]">
              Blogs / Articles
            </Link>
            <Link href="/admin/projects" className="text-gray-400 hover:text-white transition-colors">
              Projects
            </Link>
            <Link href="/admin/designs" className="text-gray-400 hover:text-white transition-colors">
              Design Gallery
            </Link>
            <Link href="/admin/services" className="text-gray-400 hover:text-white transition-colors">
              Services
            </Link>
            <Link href="/admin/journey" className="text-gray-400 hover:text-white transition-colors">
              My Journey
            </Link>
            <Link href="/admin/testimonials" className="text-gray-400 hover:text-white transition-colors">
              Testimonials
            </Link>
            <Link href="/admin/newsletter" className="text-gray-400 hover:text-white transition-colors">
              Newsletter
            </Link>
            <Link href="/admin/settings" className="text-gray-400 hover:text-white transition-colors">
              Site Settings
            </Link>
            <Link href="/admin/messages" className="text-gray-400 hover:text-white transition-colors">
              Messages
            </Link>
            <Link href="/admin/resume" className="text-gray-400 hover:text-white transition-colors pt-2 border-t border-gray-800">
              Resume Manager
            </Link>
          </nav>
        </div>

        <div>
          <button 
            onClick={() => signOut({ callbackUrl: '/admin/login' })}
            className="w-full text-left text-xs font-bold tracking-widest uppercase text-gray-400 hover:text-red-400 transition-colors pt-6 border-t border-gray-800"
          >
            ← Log Out
          </button>
        </div>
      </aside>

      <main className="flex-1 p-10 overflow-y-auto">
        <div className="max-w-5xl mx-auto">
          <div className="flex justify-between items-center mb-10">
            <div>
              <h1 className="text-3xl font-light tracking-wide uppercase text-gray-900">Manage Articles</h1>
              <p className="text-xs text-gray-500 mt-1">Logged in AS {session.user?.name || 'Qasim'}</p>
            </div>
            <Link 
              href="/admin/new" 
              className="bg-[#aa002a] text-white text-xs font-bold tracking-widest uppercase px-6 py-3 rounded hover:bg-gray-900 transition-colors"
            >
              + New Article
            </Link>
          </div>

          {/* Quick Stats */}
          {stats && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-10">
              <Link href="/admin/messages" className="bg-white rounded-lg border border-gray-100 p-4 shadow-sm hover:border-[#aa002a]/30 transition-colors">
                <p className="text-2xl font-light text-gray-900">{stats.unreadMessages}</p>
                <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mt-1">Unread Messages</p>
              </Link>
              <Link href="/admin/newsletter" className="bg-white rounded-lg border border-gray-100 p-4 shadow-sm hover:border-[#aa002a]/30 transition-colors">
                <p className="text-2xl font-light text-gray-900">{stats.subscribers}</p>
                <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mt-1">Subscribers</p>
              </Link>
              <Link href="/admin/testimonials" className="bg-white rounded-lg border border-gray-100 p-4 shadow-sm hover:border-[#aa002a]/30 transition-colors">
                <p className="text-2xl font-light text-gray-900">{stats.activeTestimonials}</p>
                <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mt-1">Testimonials Live</p>
              </Link>
              {stats.mostLovedPost ? (
                <Link href={`/blog/${stats.mostLovedPost.slug}`} target="_blank" className="bg-white rounded-lg border border-gray-100 p-4 shadow-sm hover:border-[#aa002a]/30 transition-colors">
                  <p className="text-2xl font-light text-gray-900">🔥 {stats.mostLovedPost.reaction_count}</p>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mt-1 truncate">{stats.mostLovedPost.title}</p>
                </Link>
              ) : (
                <div className="bg-white rounded-lg border border-gray-100 p-4 shadow-sm">
                  <p className="text-2xl font-light text-gray-300">—</p>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mt-1">No Reactions Yet</p>
                </div>
              )}
            </div>
          )}

          {/* Articles Table Section */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
            {articles.length === 0 ? (
              <div className="p-10 text-center text-sm text-gray-500">
                No articles found. Click "+ New Article" to write your first post!
              </div>
            ) : (
              <table className="w-full text-left text-sm">
                <thead className="bg-gray-50 text-[10px] font-bold tracking-widest uppercase text-gray-500">
                  <tr>
                    <th className="px-6 py-4">Title</th>
                    <th className="px-6 py-4">Category</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4">Featured</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {articles.map((article) => (
                    <tr key={article.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 font-medium text-gray-900">{article.title}</td>
                      <td className="px-6 py-4 text-xs text-gray-500 uppercase tracking-wider">{article.category}</td>
                      <td className="px-6 py-4">
                        <span className={`text-[10px] uppercase tracking-widest px-2 py-1 rounded ${article.published ? 'bg-green-50 text-green-700' : 'bg-amber-50 text-amber-700'}`}>
                          {article.published ? 'Published' : 'Draft'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => toggleFeatured(article)}
                          className={`text-[9px] font-bold tracking-widest uppercase px-2 py-1 rounded transition-colors cursor-pointer ${
                            article.featured ? 'bg-[#aa002a] text-white hover:bg-gray-900' : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
                          }`}
                        >
                          {article.featured ? '★ Featured' : '☆ Feature'}
                        </button>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-4">
                          <Link 
                            href={`/admin/edit/${article.id}`} 
                            className="text-xs font-bold tracking-widest text-gray-500 hover:text-[#aa002a] uppercase"
                          >
                            Edit
                          </Link>

                          <form onSubmit={async (e: React.FormEvent) => {
                            e.preventDefault()
                            if (!confirm(`Are you sure you want to delete "${article.title}"?`)) return

                            const { data, error } = await supabase
                              .from('articles')
                              .delete()
                              .eq('id', article.id)
                              .select()

                            if (error) {
                              alert('Error deleting article: ' + error.message)
                            } else if (!data || data.length === 0) {
                              alert('Delete blocked by Supabase RLS policies.')
                            } else {
                              // TypeScript now knows 'a' is of type Article
                              setArticles(prev => prev.filter(a => a.id !== article.id))
                            }
                          }}>
                            <button 
                              type="submit" 
                              className="text-xs font-bold tracking-widest text-red-500 hover:text-red-700 uppercase cursor-pointer py-1"
                            >
                              Delete
                            </button>
                          </form>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}