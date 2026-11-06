'use client'

import SiteImage from '@/components/SiteImage'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { useLocale } from '@/app/components/LocaleProvider'

type C = { id: string; name: string; slug: string | null; image_url: string | null; dark_image_url: string | null }

// "Clients" row at the top of the design page: tap a client to see only their work.
export default function ClientsRow() {
  const { tx } = useLocale()
  const [clients, setClients] = useState<C[]>([])
  const [state,setState] = useState<'loading'|'ready'|'error'>('loading')
  useEffect(() => {
    supabase.from('client_logos').select('id, name, slug, image_url, dark_image_url').eq('show_on_design', true).order('order_index')
      .then(({ data, error }) => { setState(error ? 'error' : 'ready'); setClients((data as C[]) || []) })
  }, [])

  return (
    <section id="clients" className="scroll-mt-24 mb-10" aria-labelledby="clients-heading">
      <h2 id="clients-heading" className="type-h2">{tx('Clients & case studies')}</h2>
      <p className="mt-2 text-sm text-ink-500" role="status">{state === 'loading' ? tx('Loading clients…') : state === 'error' ? tx('The client list could not be loaded.') : clients.length ? tx('Select a client to read the case study and see their designs.') : tx('No client case studies have been published yet.')}</p>
      <ul className="mt-4 flex flex-wrap gap-3">
        {clients.map((c) => (
          <li key={c.id}><Link href={`/design/clients/${encodeURIComponent(c.slug || c.id)}`} className="group flex h-16 items-center gap-3 border border-ink-100 bg-paper-raised px-4 transition-colors hover:border-ink-900">
            {c.image_url && <span className="grid h-9 w-9 place-items-center"><SiteImage src={c.image_url} alt="" aria-hidden className="max-h-full max-w-full object-contain dark:hidden" /><SiteImage src={c.dark_image_url || c.image_url} alt="" aria-hidden className="hidden max-h-full max-w-full object-contain dark:block" /></span>}
            <span className="text-sm font-medium text-ink-900 group-hover:text-accent-600" dir="auto">{c.name}</span>
          </Link></li>
        ))}
      </ul>
    </section>
  )
}
