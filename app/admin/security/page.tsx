'use client'

import { useState, useEffect, useMemo } from 'react'
import { useSession } from 'next-auth/react'
import AdminNav from '@/app/admin/AdminNav'

type AuditEvent = {
  id: string
  created_at: string
  event: string
  ip: string | null
  user_agent: string | null
  detail: Record<string, any> | null
}

type HealthCheck = { id: string; label: string; status: 'ok' | 'warn' | 'fail'; hint?: string }

const WARN = new Set(['login_failed', 'login_blocked', 'admin_unauthorized', 'admin_cross_site_blocked', 'admin_table_blocked', 'upload_refused'])
const LABELS: Record<string, string> = {
  login_success: 'Login succeeded',
  login_failed: 'Login failed',
  login_blocked: 'Login blocked (too many attempts)',
  admin_unauthorized: 'Admin API call without login',
  admin_cross_site_blocked: 'Cross-site admin request blocked',
  admin_table_blocked: 'Blocked table access',
  admin_write: 'Content changed',
  upload_issued: 'Upload permitted',
  upload_refused: 'Upload refused',
}

function describe(e: AuditEvent): string {
  const d = e.detail || {}
  if (e.event === 'admin_write') {
    const n = Array.isArray(d.ids) ? d.ids.length : 0
    return `${d.op} on ${d.table}${n > 1 ? ` (${n} rows)` : ''}${d.fields ? ` — ${d.fields.join(', ')}` : ''}`
  }
  if (e.event === 'login_failed') {
    const why = String(d.reason || 'unknown')
    const nice = why === 'two_factor_store_error' ? 'two factor store error — run supabase/migrations/admin-totp-used.sql' : why.replace(/_/g, ' ')
    return `reason: ${nice}`
  }
  if (e.event === 'upload_issued' || e.event === 'upload_refused') return `${d.bucket || ''}/${d.path || ''}${d.reason ? ` — ${d.reason}` : ''}`
  if (e.event === 'admin_table_blocked') return `${d.method} ${d.table}`
  return ''
}

export default function SecurityPage() {
  const { data: session, status } = useSession()
  const [events, setEvents] = useState<AuditEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [filter, setFilter] = useState<'all' | 'warnings' | 'logins' | 'changes'>('warnings')
  const [health, setHealth] = useState<HealthCheck[] | null>(null)

  useEffect(() => {
    if (status !== 'authenticated') return
    fetch('/api/admin/security-events')
      .then(async (r) => {
        const j = await r.json()
        if (!r.ok) throw new Error(j.error || 'Failed to load')
        setEvents(j.data || [])
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))

    fetch('/api/admin/security-health')
      .then((r) => r.json())
      .then((j) => setHealth(j.checks || []))
      .catch(() => setHealth([]))
  }, [status])

  const stats = useMemo(() => {
    const dayAgo = Date.now() - 24 * 60 * 60 * 1000
    const recent = events.filter((e) => new Date(e.created_at).getTime() > dayAgo)
    return {
      failed: recent.filter((e) => e.event === 'login_failed' || e.event === 'login_blocked').length,
      blocked: recent.filter((e) => ['admin_unauthorized', 'admin_cross_site_blocked', 'admin_table_blocked', 'upload_refused'].includes(e.event)).length,
      lastLogin: events.find((e) => e.event === 'login_success'),
    }
  }, [events])

  const shown = events.filter((e) =>
    filter === 'all' ? true :
    filter === 'warnings' ? WARN.has(e.event) :
    filter === 'logins' ? e.event.startsWith('login_') :
    e.event === 'admin_write' || e.event === 'upload_issued'
  )

  if (status === 'loading') return <div className="min-h-screen bg-paper flex items-center justify-center font-mono text-sm text-ink-500">Loading...</div>
  if (!session) return null

  return (
    <div className="min-h-screen bg-paper flex flex-col md:flex-row">
      <AdminNav />
      <main className="flex-1 p-6 md:p-10 overflow-y-auto">
        <div className="max-w-5xl mx-auto">
          <h1 className="text-3xl font-light tracking-wide uppercase text-ink-900">Security Log</h1>
          <p className="text-xs text-ink-500 mt-1 mb-8">Every login attempt, admin change, and blocked request — recorded by the server, not the browser.</p>


          {/* Protection status — what is actually switched on and actually working */}
          <div className="border border-ink-100 p-5 mb-8">
            <p className="text-[10px] font-bold tracking-widest uppercase text-ink-500 mb-3">Protection status</p>
            {health === null && <p className="text-xs text-ink-300 font-mono">Checking...</p>}
            <ul className="space-y-2">
              {(health || []).map((c) => (
                <li key={c.id} className="text-sm">
                  <span className={`inline-block w-5 font-bold ${c.status === 'ok' ? 'text-green-600' : c.status === 'warn' ? 'text-amber-500' : 'text-red-500'}`}>
                    {c.status === 'ok' ? '✓' : c.status === 'warn' ? '!' : '✗'}
                  </span>
                  <span className="text-ink-900">{c.label}</span>
                  {c.hint && <span className="block ml-5 text-xs text-ink-500 break-words">{c.hint}</span>}
                </li>
              ))}
            </ul>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
            <div className="border border-ink-100 p-4">
              <p className="text-2xl font-light text-ink-900">{stats.failed}</p>
              <p className="text-[10px] font-bold tracking-widest uppercase text-ink-500 mt-1">Failed logins · 24h</p>
            </div>
            <div className="border border-ink-100 p-4">
              <p className="text-2xl font-light text-ink-900">{stats.blocked}</p>
              <p className="text-[10px] font-bold tracking-widest uppercase text-ink-500 mt-1">Blocked requests · 24h</p>
            </div>
            <div className="border border-ink-100 p-4">
              <p className="text-sm text-ink-900">{stats.lastLogin ? new Date(stats.lastLogin.created_at).toLocaleString() : '—'}</p>
              <p className="text-[10px] font-bold tracking-widest uppercase text-ink-500 mt-1">Last login{stats.lastLogin?.ip ? ` · ${stats.lastLogin.ip}` : ''}</p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 mb-6">
            {(['warnings', 'logins', 'changes', 'all'] as const).map((f) => (
              <button key={f} onClick={() => setFilter(f)}
                className={`text-[10px] font-bold tracking-widest uppercase px-4 py-2 rounded-none border transition-colors ${filter === f ? 'bg-accent-600 border-accent-600 text-white' : 'border-ink-100 text-ink-500 hover:text-ink-900'}`}>
                {f}
              </button>
            ))}
          </div>

          {loading && <p className="text-sm text-ink-500 font-mono">Loading events...</p>}
          {error && <p className="text-sm text-red-500">{error}. If this says the table doesn't exist, run supabase/migrations/security-audit-log.sql.</p>}
          {!loading && !error && shown.length === 0 && <p className="text-sm text-ink-500">Nothing to show for this filter.</p>}

          <div className="space-y-2">
            {shown.map((e) => (
              <div key={e.id} className="border border-ink-100 p-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
                <div className="min-w-0">
                  <span className={`text-[10px] font-bold tracking-widest uppercase mr-3 ${WARN.has(e.event) ? 'text-red-500' : e.event === 'login_success' ? 'text-green-600' : 'text-ink-500'}`}>
                    {LABELS[e.event] || e.event}
                  </span>
                  <span className="text-xs text-ink-700 break-words">{describe(e)}</span>
                </div>
                <div className="text-[10px] font-mono text-ink-300 shrink-0">{e.ip || 'unknown ip'} · {new Date(e.created_at).toLocaleString()}</div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  )
}
