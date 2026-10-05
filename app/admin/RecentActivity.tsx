'use client'

import { useState, useEffect } from 'react'
import { adminApi } from '@/lib/adminApi'

type ActivityRow = {
  id: string
  created_at: string
  action: string
  entity_type: string
  entity_label: string | null
  count: number
}

function describe(row: ActivityRow): string {
  const subject = row.count > 1 ? `${row.count} ${row.entity_type}s` : row.entity_label || `a ${row.entity_type}`
  const verbs: Record<string, string> = {
    published: 'Published',
    unpublished: 'Unpublished',
    featured: 'Featured',
    unfeatured: 'Unfeatured',
    deleted: 'Deleted',
    order_paid: 'Marked order paid:',
  }
  const verb = verbs[row.action] || row.action
  return row.action === 'order_paid' ? `${verb} ${row.entity_label}` : `${verb} ${subject}`
}

function timeAgo(dateStr: string): string {
  const diffMs = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diffMs / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}h ago`
  return `${Math.floor(hours / 24)}d ago`
}

export default function RecentActivity() {
  const [rows, setRows] = useState<ActivityRow[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function fetchActivity() {
      try {
        const data = await adminApi.list('activity_log', { orderBy: 'created_at', ascending: false, limit: 10 })
        setRows(data || [])
      } catch (err: any) {
        console.error('Error fetching activity log:', err.message)
      }
      setIsLoading(false)
    }
    fetchActivity()
  }, [])

  if (isLoading || rows.length === 0) return null

  return (
    <div className="bg-paper rounded-none border border-ink-100 shadow-sm p-5 mb-8">
      <h2 className="text-[10px] font-bold tracking-widest uppercase text-ink-300 mb-4">Recent Activity</h2>
      <ul className="space-y-2.5">
        {rows.map((row) => (
          <li key={row.id} className="flex items-center justify-between text-xs">
            <span className="text-ink-700">{describe(row)}</span>
            <span className="text-ink-300 font-mono shrink-0 ml-4">{timeAgo(row.created_at)}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}
