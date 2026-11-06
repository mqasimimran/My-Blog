'use client'

import Link from 'next/link'
import { MAX_BRIEF_ITEMS, useDesignBrief } from '@/lib/designBrief'

export default function SaveDesign({id}: {id: string}) {
  const {ids, toggle} = useDesignBrief()
  const saved = ids.includes(id)
  return <button type="button" aria-pressed={saved} disabled={!saved && ids.length >= MAX_BRIEF_ITEMS}
    onClick={() => toggle(id)} className="mt-2 border border-current px-3 py-2 text-sm disabled:opacity-50">
    {saved ? 'Remove from brief' : ids.length >= MAX_BRIEF_ITEMS ? 'Brief full (12 examples)' : 'Save to my brief'}
  </button>
}

export function BriefLink() {
  const {ids} = useDesignBrief()
  return <Link href="/contact?brief=1#project-brief" className="inline-block border border-ink-100 px-4 py-3 text-sm">My project brief ({ids.length})</Link>
}
