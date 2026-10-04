'use client'

import { useState, useEffect } from 'react'
import { useSession, signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { adminApi } from '@/lib/adminApi'
import Link from 'next/link'
import AdminNav from '@/app/admin/AdminNav'
import RecentActivity from '@/app/admin/RecentActivity'
import { logActivity } from '@/lib/logActivity'

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
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [isBulkWorking, setIsBulkWorking] = useState(false)
  const [stats, setStats] = useState<{
    unreadMessages: number
    subscribers: number
    activeTestimonials: number
    mostLovedPost: { title: string; slug: string; reaction_count: number } | null
  } | null>(null)

  useEffect(() => {
    async function fetchArticles() {
      try {
        const data = await adminApi.list('articles', { orderBy: 'created_at', ascending: false })
        setArticles((data as Article[]) || [])
      } catch (err: any) {
        console.error('Error fetching articles:', err.message)
      }
      setIsLoading(false)
    }

    async function fetchStats() {
      try {
        const res = await fetch('/api/admin/stats')
        if (res.ok) setStats(await res.json())
      } catch (err: any) {
        console.error('Error fetching stats:', err.message)
      }
    }

    if (status === 'authenticated') {
      fetchArticles()
      fetchStats()
    }
  }, [status])

  async function toggleFeatured(article: Article) {
    try {
      await adminApi.update('articles', article.id, { featured: !article.featured })
      setArticles(prev => prev.map(a => a.id === article.id ? { ...a, featured: !a.featured } : a))
      logActivity({ action: article.featured ? 'unfeatured' : 'featured', entityType: 'article', entityLabel: article.title })
    } catch (err: any) {
      alert('Error updating: ' + err.message)
    }
  }

  function toggleSelected(id: string) {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id])
  }

  function toggleSelectAll() {
    setSelectedIds(prev => prev.length === articles.length ? [] : articles.map(a => a.id))
  }

  async function bulkSetPublished(published: boolean) {
    if (selectedIds.length === 0) return
    setIsBulkWorking(true)
    try {
      await adminApi.updateMany('articles', selectedIds, { published })
      setArticles(prev => prev.map(a => selectedIds.includes(a.id) ? { ...a, published } : a))
      logActivity({ action: published ? 'published' : 'unpublished', entityType: 'article', count: selectedIds.length })
      setSelectedIds([])
    } catch (err: any) {
      alert('Error updating articles: ' + err.message)
    }
    setIsBulkWorking(false)
  }

  async function bulkSetFeatured(featured: boolean) {
    if (selectedIds.length === 0) return
    setIsBulkWorking(true)
    try {
      await adminApi.updateMany('articles', selectedIds, { featured })
      setArticles(prev => prev.map(a => selectedIds.includes(a.id) ? { ...a, featured } : a))
      logActivity({ action: featured ? 'featured' : 'unfeatured', entityType: 'article', count: selectedIds.length })
      setSelectedIds([])
    } catch (err: any) {
      alert('Error updating articles: ' + err.message)
    }
    setIsBulkWorking(false)
  }

  async function bulkDelete() {
    if (selectedIds.length === 0) return
    if (!confirm(`Delete ${selectedIds.length} article(s)? This can't be undone.`)) return
    setIsBulkWorking(true)
    try {
      await adminApi.removeMany('articles', selectedIds)
      setArticles(prev => prev.filter(a => !selectedIds.includes(a.id)))
      logActivity({ action: 'deleted', entityType: 'article', count: selectedIds.length })
      setSelectedIds([])
    } catch (err: any) {
      alert('Error deleting articles: ' + err.message)
    }
    setIsBulkWorking(false)
  }

  if (status === 'loading' || isLoading) {
    return (
      <div className="min-h-screen bg-paper flex items-center justify-center font-mono text-sm text-ink-500">
        Loading admin portal...
      </div>
    )
  }

  if (!session) return null

  return (
    <div className="min-h-screen bg-paper flex flex-col md:flex-row font-sans">
      {/* Sidebar Navigation */}
      <AdminNav />

      <main className="flex-1 p-10 overflow-y-auto">
        <div className="max-w-5xl mx-auto">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-10">
            <div>
              <h1 className="text-3xl font-light tracking-wide uppercase text-ink-900">Manage Articles</h1>
              <p className="text-xs text-ink-500 mt-1">Logged in AS {session.user?.name || 'Qasim'}</p>
            </div>
            <Link 
              href="/admin/new" 
              className="bg-accent-600 text-white text-xs font-bold tracking-widest uppercase px-6 py-3 rounded-none hover:bg-gray-900 transition-colors"
            >
              + New Article
            </Link>
          </div>

          <RecentActivity />

          {/* Quick Stats */}
          {stats && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-10">
              <Link href="/admin/messages" className="bg-paper rounded-none border border-ink-100 p-4 shadow-sm hover:border-accent-600/30 transition-colors">
                <p className="text-2xl font-light text-ink-900">{stats.unreadMessages}</p>
                <p className="text-[10px] font-bold uppercase tracking-widest text-ink-300 mt-1">Unread Messages</p>
              </Link>
              <Link href="/admin/newsletter" className="bg-paper rounded-none border border-ink-100 p-4 shadow-sm hover:border-accent-600/30 transition-colors">
                <p className="text-2xl font-light text-ink-900">{stats.subscribers}</p>
                <p className="text-[10px] font-bold uppercase tracking-widest text-ink-300 mt-1">Subscribers</p>
              </Link>
              <Link href="/admin/testimonials" className="bg-paper rounded-none border border-ink-100 p-4 shadow-sm hover:border-accent-600/30 transition-colors">
                <p className="text-2xl font-light text-ink-900">{stats.activeTestimonials}</p>
                <p className="text-[10px] font-bold uppercase tracking-widest text-ink-300 mt-1">Testimonials Live</p>
              </Link>
              {stats.mostLovedPost ? (
                <Link href={`/blog/${stats.mostLovedPost.slug}`} target="_blank" className="bg-paper rounded-none border border-ink-100 p-4 shadow-sm hover:border-accent-600/30 transition-colors">
                  <p className="text-2xl font-light text-ink-900">🔥 {stats.mostLovedPost.reaction_count}</p>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-ink-300 mt-1 truncate">{stats.mostLovedPost.title}</p>
                </Link>
              ) : (
                <div className="bg-paper rounded-none border border-ink-100 p-4 shadow-sm">
                  <p className="text-2xl font-light text-ink-100">—</p>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-ink-300 mt-1">No Reactions Yet</p>
                </div>
              )}
            </div>
          )}

          {/* Articles Table Section */}
          <div className="bg-paper rounded-none shadow-sm border border-ink-100 overflow-hidden">
            {articles.length === 0 ? (
              <div className="p-10 text-center text-sm text-ink-500">
                No articles found. Click "+ New Article" to write your first post!
              </div>
            ) : (
              <>
              {selectedIds.length > 0 && (
                <div className="flex flex-wrap items-center gap-3 px-6 py-3 bg-gray-900 text-white text-xs">
                  <span className="font-bold tracking-wider uppercase">{selectedIds.length} selected</span>
                  <button disabled={isBulkWorking} onClick={() => bulkSetPublished(true)} className="font-bold tracking-wider uppercase hover:text-accent-600 transition-colors disabled:opacity-50">Publish</button>
                  <button disabled={isBulkWorking} onClick={() => bulkSetPublished(false)} className="font-bold tracking-wider uppercase hover:text-accent-600 transition-colors disabled:opacity-50">Unpublish</button>
                  <button disabled={isBulkWorking} onClick={() => bulkSetFeatured(true)} className="font-bold tracking-wider uppercase hover:text-accent-600 transition-colors disabled:opacity-50">Feature</button>
                  <button disabled={isBulkWorking} onClick={() => bulkSetFeatured(false)} className="font-bold tracking-wider uppercase hover:text-accent-600 transition-colors disabled:opacity-50">Unfeature</button>
                  <button disabled={isBulkWorking} onClick={bulkDelete} className="font-bold tracking-wider uppercase text-red-400 hover:text-red-300 transition-colors disabled:opacity-50">Delete</button>
                  <button disabled={isBulkWorking} onClick={() => setSelectedIds([])} className="ml-auto text-ink-300 hover:text-white transition-colors">Clear</button>
                </div>
              )}
              <div className="overflow-x-auto">
              <table className="w-full text-left text-sm min-w-[640px]">
                <thead className="bg-paper text-[10px] font-bold tracking-widest uppercase text-ink-500">
                  <tr>
                    <th className="px-6 py-4 w-10">
                      <input type="checkbox" checked={selectedIds.length === articles.length && articles.length > 0} onChange={toggleSelectAll} className="w-4 h-4 accent-gray-900" aria-label="Select all articles" />
                    </th>
                    <th className="px-6 py-4">Title</th>
                    <th className="px-6 py-4">Category</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4">Featured</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {articles.map((article) => (
                    <tr key={article.id} className="hover:bg-paper transition-colors">
                      <td className="px-6 py-4">
                        <input type="checkbox" checked={selectedIds.includes(article.id)} onChange={() => toggleSelected(article.id)} className="w-4 h-4 accent-gray-900" aria-label={`Select ${article.title}`} />
                      </td>
                      <td className="px-6 py-4 font-medium text-ink-900">{article.title}</td>
                      <td className="px-6 py-4 text-xs text-ink-500 uppercase tracking-wider">{article.category}</td>
                      <td className="px-6 py-4">
                        <span className={`text-[10px] uppercase tracking-widest px-2 py-1 rounded-none ${article.published ? 'bg-green-50 text-green-700' : 'bg-amber-50 text-amber-700'}`}>
                          {article.published ? 'Published' : 'Draft'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => toggleFeatured(article)}
                          className={`text-[9px] font-bold tracking-widest uppercase px-2 py-1 rounded-none transition-colors cursor-pointer ${
                            article.featured ? 'bg-accent-600 text-white hover:bg-gray-900' : 'bg-ink-100 text-ink-300 hover:bg-ink-100'
                          }`}
                        >
                          {article.featured ? '★ Featured' : '☆ Feature'}
                        </button>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-4">
                          <Link 
                            href={`/admin/edit/${article.id}`} 
                            className="text-xs font-bold tracking-widest text-ink-500 hover:text-accent-600 uppercase"
                          >
                            Edit
                          </Link>

                          <form onSubmit={async (e: React.FormEvent) => {
                            e.preventDefault()
                            if (!confirm(`Are you sure you want to delete "${article.title}"?`)) return

                            try {
                              await adminApi.remove('articles', article.id)
                              setArticles(prev => prev.filter(a => a.id !== article.id))
                              logActivity({ action: 'deleted', entityType: 'article', entityLabel: article.title })
                            } catch (err: any) {
                              alert('Error deleting article: ' + err.message)
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
              </div>
              </>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}