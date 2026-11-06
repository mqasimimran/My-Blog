export const DESIGN_NEEDS = [
  { id: 'event', label: 'Promote an event' },
  { id: 'recruitment', label: 'Recruit members' },
  { id: 'campaign', label: 'Launch a campaign' },
  { id: 'brand', label: 'Build a brand' },
  { id: 'social', label: 'Create social content' },
  { id: 'product', label: 'Design a digital product' },
] as const

export type Campaign = {
  id: string
  client_id: string
  title: string
  summary: string
  role: string | null
  share_image_url: string | null
  published: boolean
}
