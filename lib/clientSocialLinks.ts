const platforms: Record<string, string> = {
  'instagram.com': 'Instagram',
  'facebook.com': 'Facebook',
  'linkedin.com': 'LinkedIn',
  'youtube.com': 'YouTube',
  'tiktok.com': 'TikTok',
  'x.com': 'X',
  'twitter.com': 'X',
  'threads.net': 'Threads',
  'threads.com': 'Threads',
}

export function socialProfile(value: string) {
  const text = value.trim()
  if (!text || /[\s\\]/.test(text)) return null
  const handle = /^@([a-z\d._]{1,30})$/i.exec(text)
  const address = handle ? 'https://www.instagram.com/' + handle[1] + '/' : text
  try {
    const url = new URL(/^[a-z][\w+.-]*:/i.test(address) ? address : 'https://' + address)
    if (!['http:', 'https:'].includes(url.protocol) || !url.hostname.includes('.') || url.username || url.password) return null
    const host = url.hostname.replace(/^www\./, '')
    return { href: url.href, label: platforms[host] || host }
  } catch { return null }
}

export function parseSocialLinks(text: string) {
  const links = new Set<string>()
  for (const line of text.split(/\r?\n/).filter(line => line.trim())) {
    const profile = socialProfile(line)
    if (!profile) return null
    links.add(profile.href)
  }
  return [...links]
}
