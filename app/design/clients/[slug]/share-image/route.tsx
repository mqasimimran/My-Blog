import { getDesignClient } from '@/lib/designCaseStudy'
import { ogCard } from '@/lib/ogCard'

export async function GET(_request: Request, {params}: {params: Promise<{slug: string}>}) {
  const client = await getDesignClient((await params).slug)
  if (!client) return new Response('Not found',{status:404})
  return ogCard({kicker:'Design case study', title:client.name, foot:client.role || 'Design portfolio'})
}
