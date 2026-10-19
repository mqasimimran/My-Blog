import { Play } from '@phosphor-icons/react/dist/ssr'
import SectionHeader from '@/app/components/ui/SectionHeader'
import { ButtonLink } from '@/app/components/ui/Button'
import { getLatestVideos } from '@/lib/youtube'
import { siteConfig } from '@/site.config'

// Your latest YouTube videos on the homepage, refreshed every hour. Set the channel in
// site.config.ts -> videos.youtubeChannelId. With no channel (or no videos), the section is hidden.
export default async function LatestVideos() {
  const videos = await getLatestVideos(siteConfig.videos.youtubeChannelId, 3)
  if (videos.length === 0) return null

  return (
    <section className="border-t border-ink-100">
      <div className="container-page section-y">
        <SectionHeader
          title="Latest videos"
          meta="(From YouTube)"
          action={<ButtonLink href={siteConfig.social.youtube} external variant="text">See the channel</ButtonLink>}
        />
        <div className="mt-14 grid grid-cols-1 gap-6 md:grid-cols-3">
          {videos.map((v) => (
            <a
              key={v.id}
              href={`https://www.youtube.com/watch?v=${v.id}`}
              target="_blank"
              rel="noopener noreferrer"
              data-cursor="Watch"
              className="group flex flex-col border border-ink-100 bg-paper-raised transition-colors duration-300 hover:border-ink-900"
            >
              <div className="relative aspect-video overflow-hidden border-b border-ink-100 bg-ink-900">
                <img src={`https://i.ytimg.com/vi/${v.id}/hqdefault.jpg`} alt={v.title} loading="lazy" className="absolute inset-0 h-full w-full object-cover transition-transform duration-[900ms] ease-[var(--ease-smooth)] group-hover:scale-[1.03]" />
                <span className="absolute inset-0 grid place-items-center" aria-hidden>
                  <span className="grid h-14 w-14 place-items-center rounded-full bg-paper/90 text-ink-900 transition-transform duration-500 group-hover:scale-110">
                    <Play size={22} weight="fill" />
                  </span>
                </span>
              </div>
              <div className="p-5">
                {v.published && <p className="type-meta">{new Date(v.published).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>}
                <h3 className="mt-2 text-lg font-medium leading-snug tracking-tight text-ink-900 transition-colors duration-300 group-hover:text-accent-600">{v.title}</h3>
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  )
}
