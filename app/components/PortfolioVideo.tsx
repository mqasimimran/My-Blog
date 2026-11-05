import { youtubeClip } from '@/lib/portfolioVideo'

export default function PortfolioVideo({ src, title }: { src: string; title: string }) {
  const clip = youtubeClip(src)
  if (!clip) return null
  return (
    <div className={clip.short ? 'mx-auto w-full max-w-[min(24rem,36vh)]' : 'mx-auto w-full max-w-[min(64rem,115vh)]'}>
      <iframe
        title={title}
        src={`https://www.youtube-nocookie.com/embed/${clip.id}`}
        className={`block w-full bg-black ${clip.short ? 'aspect-[9/16]' : 'aspect-video'}`}
        loading="lazy" allow="encrypted-media; picture-in-picture; fullscreen" allowFullScreen
        referrerPolicy="strict-origin-when-cross-origin"
      />
      <a href={clip.url} target="_blank" rel="noopener noreferrer" className="mt-2 inline-block text-sm underline">Watch on YouTube</a>
    </div>
  )
}
