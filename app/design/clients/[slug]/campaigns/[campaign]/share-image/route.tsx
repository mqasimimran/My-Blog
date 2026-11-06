import { getDesignCampaign } from '@/lib/designCaseStudy'
import { ogCard } from '@/lib/ogCard'

export async function GET(_request: Request, {params}: {params: Promise<{slug: string; campaign: string}>}) {
  const {slug,campaign} = await params
  const result = await getDesignCampaign(slug,campaign)
  if (!result) return new Response('Not found',{status:404})
  return ogCard({kicker:'Design case study', title:result.campaign.title, foot:result.client.name, byline:result.campaign.role || undefined})
}
