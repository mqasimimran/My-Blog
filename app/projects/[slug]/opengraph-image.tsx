import { createClient } from '@supabase/supabase-js'
import { siteConfig } from '@/site.config'
import { ogCard, OG_SIZE } from '@/lib/ogCard'

export const alt = 'Project'
export const size = OG_SIZE
export const contentType = 'image/png'

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)

// Next.js 16 made `params` a Promise. Reading it synchronously (the old way) silently produced
// `undefined`, so every share card fell back to the generic site title instead of its own.
export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const { data: project } = await supabase.from('projects').select('title, category, tech_stack').eq('slug', slug).single()

  return ogCard({
    kicker: project?.category || 'Project',
    title: project?.title || siteConfig.name,
    foot: project?.tech_stack || 'Case study',
  })
}
