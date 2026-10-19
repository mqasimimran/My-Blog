import { siteConfig } from '@/site.config'
import { ogCard, OG_SIZE } from '@/lib/ogCard'

export const alt = `${siteConfig.name} - ${siteConfig.jobTitle}`
export const size = OG_SIZE
export const contentType = 'image/png'

export default async function Image() {
  return ogCard({ kicker: siteConfig.jobTitle, title: siteConfig.name, byline: siteConfig.skillsLine, foot: siteConfig.location })
}
