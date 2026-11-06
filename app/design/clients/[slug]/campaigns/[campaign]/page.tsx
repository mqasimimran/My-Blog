import DesignTestimonials from '@/app/components/DesignTestimonials'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getDesignCampaign } from '@/lib/designCaseStudy'
import { pageMeta } from '@/lib/seo'
import ClientGallery from '../../ClientGallery'

type Params = {params: Promise<{slug: string; campaign: string}>}
export async function generateMetadata({params}: Params) {
  const {slug, campaign: id} = await params
  const result = await getDesignCampaign(slug,id)
  if (!result) return {title: 'Campaign not found', robots:{index:false}}
  const path = `/design/clients/${encodeURIComponent(slug)}/campaigns/${id}`
  return pageMeta({title: result.campaign.title, description: result.campaign.summary, path, image: result.campaign.share_image_url || path+'/share-image'})
}
export default async function CampaignPage({params}: Params) {
  const {slug, campaign: id} = await params
  const result = await getDesignCampaign(slug,id)
  if (!result) notFound()
  const {client,campaign,designs} = result
  return <main className="container-page pb-24 pt-12 md:pt-20">
    <Link href={'/design/clients/'+encodeURIComponent(slug)} className="text-sm underline">All work for {client.name}</Link>
    <h1 className="type-display mt-6">{campaign.title}</h1>
    <p className="mt-4 text-ink-500">{client.name}{campaign.role ? ' · '+campaign.role : ''}</p>
    <div className="my-10 max-w-3xl space-y-5">{campaign.summary.split(/\n\s*\n/).filter(Boolean).map((paragraph: string, i: number) => {
      const heading = /^## ([^\n]+)\n([\s\S]+)$/.exec(paragraph)
      return heading ? <section key={i}><h2 className="mb-3 text-2xl font-medium">{heading[1]}</h2><p className="text-lg leading-relaxed whitespace-pre-line">{heading[2]}</p></section>
        : <p key={i} className="text-lg leading-relaxed whitespace-pre-line">{paragraph}</p>
    })}</div>
    <DesignTestimonials references={[
      {column:'campaign_id',ids:[campaign.id]},
      {column:'design_id',ids:designs.map(design => design.id)},
    ]} />
    <ClientGallery designs={designs} />
  </main>
}
