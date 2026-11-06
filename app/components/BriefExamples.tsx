'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { useDesignBrief } from '@/lib/designBrief'
import SiteImage from '@/components/SiteImage'
import { mediaCover } from '@/lib/portfolioVideo'

type Example = {id: string; title: string; images: string[] | null}
export default function BriefExamples({include, onInclude}: {include: boolean; onInclude: (value: boolean) => void}) {
  const {ids, toggle} = useDesignBrief()
  const key = ids.join(',')
  const [result, setResult] = useState<{key: string; items: Example[]; error?: boolean}>()
  useEffect(() => {
    if (!key) return
    let current = true
    supabase.from('designs').select('id,title,images').in('id',key.split(',')).eq('published',true)
      .then(({data,error}) => {
        if (current) setResult({key, items:data || [], error:!!error})
      })
    return () => { current = false }
  }, [key])
  if (!ids.length) return <div id="project-brief"><Link href="/design" className="text-sm underline">Browse designs to add examples to your brief</Link></div>
  const ready = result?.key === key
  return <section id="project-brief" className="space-y-4 border border-ink-100 p-4">
    <h2 className="font-medium">Your project brief</h2>
    <label className="flex gap-2 text-sm"><input type="checkbox" checked={include} onChange={e => onInclude(e.target.checked)} />Include these examples with my message</label>
    {!ready && <p role="status">Loading examples…</p>}
    {ready && result.error && <p role="alert">Could not load examples. Refresh to try again.</p>}
    <ul className="space-y-3">
      {ids.map(id => {
        const item = ready ? result.items.find(item => item.id === id) : undefined
        return <li key={id} className="flex items-center gap-3">
          {item && <SiteImage src={mediaCover(item.images?.[0])} alt="" className="h-12 w-12 object-cover" />}
          <span className="min-w-0 flex-1 text-sm">{item ? <Link className="underline" href={'/design?item='+id}>{item.title}</Link> : ready && !result.error ? 'This example is unavailable. Remove it to send your brief.' : 'Saved example'}</span>
          <button type="button" className="text-sm underline" onClick={() => toggle(id)} aria-label={'Remove '+(item?.title || 'example')}>Remove</button>
        </li>
      })}
    </ul>
    <Link href="/design" className="inline-block text-sm underline">Add more examples</Link>
  </section>
}
