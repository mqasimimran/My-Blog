// Latest videos from a YouTube channel via its public RSS feed: no API key, no quota.
export type Video = { id: string; title: string; published: string }

const decode = (s: string) =>
  s.replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;/g, "'")

export function parseYouTubeFeed(xml: string, limit = 3): Video[] {
  const videos: Video[] = []
  for (const entry of xml.split('<entry>').slice(1)) {
    const id = entry.match(/<yt:videoId>([^<]+)<\/yt:videoId>/)?.[1]
    const title = entry.match(/<title>([^<]*)<\/title>/)?.[1]
    const published = entry.match(/<published>([^<]+)<\/published>/)?.[1]
    if (id && title) videos.push({ id, title: decode(title), published: published || '' })
    if (videos.length >= limit) break
  }
  return videos
}

export async function getLatestVideos(channelId: string, limit = 3): Promise<Video[]> {
  if (!/^UC[\w-]{22}$/.test(channelId)) return []
  try {
    const res = await fetch(`https://www.youtube.com/feeds/videos.xml?channel_id=${channelId}`, { next: { revalidate: 3600 } })
    if (!res.ok) return []
    return parseYouTubeFeed(await res.text(), limit)
  } catch {
    return []
  }
}
