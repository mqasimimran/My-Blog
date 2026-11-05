/** Only the video ID is interpolated into player and thumbnail URLs. */
export function youtubeClip(value?: string | null) {
  if (!value || !/^(?:https?:\/\/)?(?:[\w-]+\.)*(?:youtu\.be|youtube\.com|youtube-nocookie\.com)\//i.test(value)) return null
  let url: URL
  try { url = new URL(/^https?:\/\//i.test(value) ? value : 'https://' + value) } catch { return null }
  if (url.port || url.username || url.password) return null
  const host = url.hostname.toLowerCase().replace(/^www\./, '')
  const path = url.pathname.replace(/\/$/, '')
  let id: string | null = null
  if (host === 'youtu.be') id = path.slice(1)
  else if (['youtube.com', 'm.youtube.com', 'youtube-nocookie.com'].includes(host)) {
    id = path === '/watch' ? url.searchParams.get('v') : /^\/(?:shorts|embed|live)\/([^/]+)$/.exec(path)?.[1] || null
  }
  if (!id || !/^[\w-]{11}$/.test(id)) return null
  const short = path.startsWith('/shorts/')
  return { id, short, url: short ? `https://www.youtube.com/shorts/${id}` : `https://www.youtube.com/watch?v=${id}` }
}

export function mediaCover(src?: string | null) {
  const clip = youtubeClip(src)
  return clip ? `https://i.ytimg.com/vi/${clip.id}/hqdefault.jpg` : src
}

export function parseVideoLinks(text: string) {
  const clips = new Map<string, string>()
  for (const line of text.split(/\r?\n/).map((s) => s.trim()).filter(Boolean)) {
    const clip = youtubeClip(line)
    if (!clip) return null
    clips.set(clip.id, clip.url)
  }
  return [...clips.values()]
}
