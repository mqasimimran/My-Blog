import SiteImage from '@/components/SiteImage'
import { createClient } from '@supabase/supabase-js'

type Reference = { column: 'client_id' | 'design_id' | 'campaign_id'; ids: string[] }
type Review = {
  id: string
  name: string
  role: string | null
  quote: string
  avatar_url: string | null
  order_index: number
}

export default async function DesignTestimonials({ references, legacy }: {
  references: Reference[]
  legacy?: { quote: string | null; author: string | null }
}) {
  const db = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)
  const requests = references.flatMap(({column, ids}) => {
    const batches = []
    for (let start = 0; start < ids.length; start += 100) {
      batches.push(db.from('testimonials')
        .select('id,name,role,quote,avatar_url,order_index')
        .eq('active', true).in(column, ids.slice(start, start + 100))
        .order('order_index'))
    }
    return batches
  })
  const results = await Promise.all(requests)
  const reviews = new Map<string, Review>()
  for (const result of results) {
    if (result.error) {
      const missingLinkColumn = ['42703', 'PGRST204'].includes(result.error.code)
        && /\b(client_id|design_id|campaign_id)\b/.test(result.error.message)
      if (missingLinkColumn) {
        console.warn('Case-study testimonials need the database update: supabase/migrations/2026-11-case-study-testimonials.sql')
      } else {
        console.error('Could not load case-study testimonials:', result.error.message)
      }
    }
    for (const review of result.data || []) reviews.set(review.id, review)
  }
  const list = [...reviews.values()].sort((a,b) => a.order_index - b.order_index || a.id.localeCompare(b.id))
  if (legacy?.quote && !list.some(review => review.quote.trim() === legacy.quote!.trim())) {
    list.push({id:'legacy',name:legacy.author || 'Client feedback',role:null,quote:legacy.quote,avatar_url:null,order_index:0})
  }
  if (!list.length) return null
  return <section className="mt-16" aria-labelledby="case-testimonials">
    <h2 id="case-testimonials" className="type-h2">What people say</h2>
    <ul className="mt-6 grid gap-5 md:grid-cols-2">
      {list.map(review => <li key={review.id}>
        <figure className="h-full border border-ink-100 bg-paper-raised p-6">
          <blockquote className="text-lg leading-relaxed" dir="auto">&ldquo;{review.quote}&rdquo;</blockquote>
          <figcaption className="mt-6 flex items-center gap-3">
            {review.avatar_url && <SiteImage src={review.avatar_url} alt="" className="h-12 w-12 shrink-0 object-cover" sizes="48px" />}
            <div><p className="font-medium" dir="auto">{review.name}</p>{review.role && <p className="mt-1 text-sm text-ink-500" dir="auto">{review.role}</p>}</div>
          </figcaption>
        </figure>
      </li>)}
    </ul>
  </section>
}
