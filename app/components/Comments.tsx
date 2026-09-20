'use client'

import { useEffect, useRef } from 'react'

// Comments powered by Giscus (giscus.app) — free, backed by GitHub
// Discussions on your own repo, with zero moderation infrastructure to run
// yourself (GitHub's own moderation tools apply).
//
// Setup required before this renders anything (see the handoff notes):
//   1. Enable Discussions on a public GitHub repo (can be this one).
//   2. Install the giscus app on that repo: https://github.com/apps/giscus
//   3. Go to https://giscus.app, fill in your repo, and copy the
//      data-repo-id and data-category-id it generates.
//   4. Set NEXT_PUBLIC_GISCUS_REPO, NEXT_PUBLIC_GISCUS_REPO_ID, and
//      NEXT_PUBLIC_GISCUS_CATEGORY_ID as env vars.
//
// Until those are set, this component quietly renders nothing rather than
// showing a broken embed.

export default function Comments() {
  const ref = useRef<HTMLDivElement>(null)

  const repo = process.env.NEXT_PUBLIC_GISCUS_REPO
  const repoId = process.env.NEXT_PUBLIC_GISCUS_REPO_ID
  const categoryId = process.env.NEXT_PUBLIC_GISCUS_CATEGORY_ID

  useEffect(() => {
    if (!repo || !repoId || !categoryId || !ref.current) return
    if (ref.current.querySelector('iframe.giscus-frame')) return // already loaded

    const script = document.createElement('script')
    script.src = 'https://giscus.app/client.js'
    script.setAttribute('data-repo', repo)
    script.setAttribute('data-repo-id', repoId)
    script.setAttribute('data-category', 'General')
    script.setAttribute('data-category-id', categoryId)
    script.setAttribute('data-mapping', 'pathname')
    script.setAttribute('data-strict', '0')
    script.setAttribute('data-reactions-enabled', '1')
    script.setAttribute('data-emit-metadata', '0')
    script.setAttribute('data-input-position', 'top')
    script.setAttribute('data-theme', 'light')
    script.setAttribute('data-lang', 'en')
    script.setAttribute('crossOrigin', 'anonymous')
    script.async = true

    ref.current.appendChild(script)
  }, [repo, repoId, categoryId])

  if (!repo || !repoId || !categoryId) return null

  return (
    <div className="max-w-2xl mx-auto mt-16 pt-10 border-t border-gray-100">
      <p className="text-[10px] font-bold tracking-[0.2em] uppercase text-gray-400 mb-6">Discussion</p>
      <div ref={ref} />
    </div>
  )
}
