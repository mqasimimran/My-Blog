'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { useLocale } from '@/app/components/LocaleProvider'

type C = { id: string; name: string; slug: string; image_url: string | null; dark_image_url: string | null }

// "Clients" row at the top of the design page: tap a client to see only their work.
export default function ClientsRow() {
  const { tx } = useLocale()
  const [clients, setClients] = useState<C[]>([])
  useEffect(() => {
    supabase.from('client_logos').select('id, name, slug, image_url, dark_image_url').eq('show_on_design', true).not('slug', 'is', null).order('order_index')
      .then(({ data, error }) => { if (!error) setClients((data as C[]) || []) })
  }, [])
  if (!clients.length) return null
  return (
    <section className="mt-12" aria-labelledby="clients-heading">
      <h2 id="clients-heading" className="type-meta">{tx('Clients')} <span className="normal-case tracking-normal text-ink-500">&middot; {tx('tap a client to see their work')}</span></h2>
      <ul className="mt-4 flex flex-wrap gap-3">
        {clients.map((c) => (
          <li key={c.id}><Link href={`/design/clients/${c.slug}`} className="group flex h-16 items-center gap-3 border border-ink-100 bg-paper-raised px-4 transition-colors hover:border-ink-900">
            {c.image_url && <span className="grid h-9 w-9 place-items-center"><img src={c.image_url} alt="" aria-hidden className="max-h-full max-w-full object-contain dark:hidden" /><img src={c.dark_image_url || c.image_url} alt="" aria-hidden className="hidden max-h-full max-w-full object-contain dark:block" /></span>}
            <span className="text-sm font-medium text-ink-900 group-hover:text-accent-600" dir="auto">{c.name}</span>
          </Link></li>
        ))}
      </ul>
    </section>
  )
}
