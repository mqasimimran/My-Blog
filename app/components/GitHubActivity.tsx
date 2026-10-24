'use client'

import { useEffect, useState } from 'react'
import { ArrowUpRight, GitCommit } from '@phosphor-icons/react'
import { useLocale } from '@/app/components/LocaleProvider'
import { dateLocale } from '@/lib/i18n'

type Data = { user: string | null; days: { date: string; count: number }[]; recent: { repo: string; type: string; message: string | null; date: string }[] }

// Live GitHub activity: a 12-week grid (darker = more activity) and the latest public pushes.
export default function GitHubActivity() {
  const { tx, locale } = useLocale()
  const [data, setData] = useState<Data | null>(null)
  useEffect(() => { fetch('/api/github').then((r) => r.json()).then(setData).catch(() => {}) }, [])
  if (!data?.user || (!data.days.some((d) => d.count) && !data.recent.length)) return null
  const max = Math.max(1, ...data.days.map((d) => d.count))
  const total = data.days.reduce((s, d) => s + d.count, 0)
  const level = (n: number) => (n === 0 ? 'bg-ink-100' : n / max < 0.34 ? 'bg-accent-600/35' : n / max < 0.67 ? 'bg-accent-600/65' : 'bg-accent-600')
  const weeks = Array.from({ length: 12 }, (_, w) => data.days.slice(w * 7, w * 7 + 7))

  return (
    <section className="container-page mt-20 border-t border-ink-100 pt-12" aria-labelledby="gh-heading">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="type-meta">GitHub</p>
          <h2 id="gh-heading" className="mt-2 text-2xl font-medium tracking-tight text-ink-900">{tx('Recent coding activity')}</h2>
          <p className="mt-1 text-sm text-ink-500">{tx('{n} contributions in the last 12 weeks').replace('{n}', String(total))}</p>
        </div>
        <a href={`https://github.com/${data.user}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-sm font-medium text-ink-900 hover:text-accent-600">@{data.user} <ArrowUpRight size={14} aria-hidden /></a>
      </div>
      <div className="mt-6 flex gap-1 overflow-x-auto" dir="ltr" role="img" aria-label={tx('{n} contributions in the last 12 weeks').replace('{n}', String(total))}>
        {weeks.map((week, w) => (
          <div key={w} className="flex flex-col gap-1">
            {week.map((d) => <span key={d.date} title={`${d.date}: ${d.count}`} className={`block h-3.5 w-3.5 ${level(d.count)}`} />)}
          </div>
        ))}
      </div>
      {data.recent.length > 0 && (
        <ul className="mt-8 max-w-2xl divide-y divide-ink-100 border-y border-ink-100">
          {data.recent.map((r, i) => (
            <li key={i} className="flex items-start gap-3 py-3 text-sm">
              <GitCommit size={18} aria-hidden className="mt-0.5 shrink-0 text-ink-500" />
              <div className="min-w-0 flex-1" dir="ltr">
                <a href={`https://github.com/${r.repo}`} target="_blank" rel="noopener noreferrer" className="font-medium text-ink-900 hover:text-accent-600">{r.repo.split('/')[1]}</a>
                {r.message && <p className="truncate text-ink-500">{r.message}</p>}
              </div>
              <span className="shrink-0 text-xs text-ink-500">{new Date(r.date).toLocaleDateString(dateLocale(locale), { month: 'short', day: 'numeric' })}</span>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
