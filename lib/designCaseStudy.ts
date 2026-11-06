import { cache } from 'react'
import { createClient } from '@supabase/supabase-js'

const UUID = /^[0-9a-f]{8}(?:-[0-9a-f]{4}){3}-[0-9a-f]{12}$/i
export const getDesignClient = cache(async (slug: string) => {
  const db = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)
  const {data, error} = await db.from('client_logos')
    .select('id,name,slug,image_url,dark_image_url,link_url,role,period,summary,testimonial_quote,testimonial_author,share_image_url')
    .eq(UUID.test(slug) ? 'id' : 'slug',slug).eq('show_on_design',true).maybeSingle()
  if (error) throw new Error('Could not load client case study')
  return data
})

export const getDesignCampaign = cache(async (slug: string, id: string) => {
  if (!UUID.test(id)) return null
  const client = await getDesignClient(slug)
  if (!client) return null
  const db = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)
  const {data: campaign, error} = await db.from('design_campaigns').select('*').eq('id',id).eq('client_id',client.id).eq('published',true).maybeSingle()
  if (error) throw new Error('Could not load campaign')
  if (!campaign) return null
  const {data: designs, error: designError} = await db.from('designs').select('id,title,category,images').eq('campaign_id',id).eq('client_id',client.id).eq('published',true).order('created_at',{ascending:false})
  if (designError) throw new Error('Could not load campaign designs')
  return {client,campaign,designs: designs || []}
})
