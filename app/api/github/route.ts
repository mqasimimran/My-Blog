import { NextResponse } from 'next/server'
import { siteConfig } from '@/site.config'

// Recent public GitHub activity for the Tech Stack page, cached for an hour. Optional GITHUB_TOKEN
// raises GitHub's rate limit; without it the public limit is plenty with caching.
export const revalidate = 3600

export async function GET() {
  const user = siteConfig.social.github.replace(/\/+$/, '').split('/').pop()
  if (!user) return NextResponse.json({ user: null, days: [], recent: [] })
  try {
    const res = await fetch(`${process.env.GITHUB_API_URL || 'https://api.github.com'}/users/${user}/events/public?per_page=100`, {
      headers: { Accept: 'application/vnd.github+json', 'User-Agent': 'portfolio-site', ...(process.env.GITHUB_TOKEN ? { Authorization: `Bearer ${process.env.GITHUB_TOKEN}` } : {}) },
      next: { revalidate: 3600 },
    })
    if (!res.ok) throw new Error(`GitHub ${res.status}`)
    const events: any[] = await res.json()
    const WORK = new Set(['PushEvent', 'CreateEvent', 'PullRequestEvent', 'IssuesEvent', 'ReleaseEvent', 'PublicEvent'])
    // Activity per day for the last 12 weeks (84 days).
    const today = new Date(); today.setUTCHours(0, 0, 0, 0)
    const days = Array.from({ length: 84 }, (_, i) => ({ date: new Date(today.getTime() - (83 - i) * 86400000).toISOString().slice(0, 10), count: 0 }))
    const index = new Map(days.map((d, i) => [d.date, i]))
    for (const e of events) {
      const i = index.get(String(e.created_at).slice(0, 10))
      // Real work only: commits pushed, new repos/branches, pull requests, issues, releases (not stars or forks).
      if (i === undefined || !WORK.has(e.type)) continue
      days[i].count += e.type === 'PushEvent' ? Math.max(1, Number(e.payload?.size ?? e.payload?.commits?.length ?? 1)) : 1
    }
    const recent = events.filter((e) => ['PushEvent', 'CreateEvent', 'ReleaseEvent', 'PublicEvent'].includes(e.type)).slice(0, 5).map((e) => ({
      repo: e.repo?.name as string,
      type: e.type as string,
      message: (e.payload?.commits?.[e.payload.commits.length - 1]?.message as string | undefined)?.split('\n')[0] || null,
      date: e.created_at as string,
    }))
    return NextResponse.json({ user, days, recent }, { headers: { 'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=7200' } })
  } catch {
    return NextResponse.json({ user, days: [], recent: [] }, { headers: { 'Cache-Control': 'public, s-maxage=600' } })
  }
}
