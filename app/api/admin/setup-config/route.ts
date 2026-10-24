import { NextRequest, NextResponse } from 'next/server'
import { readFile } from 'node:fs/promises'
import { join } from 'node:path'
import { requireAdminSession } from '@/lib/requireAdminSession'
import { writeConfig, type SetupValues } from '@/lib/configWriter'

// Setup wizard: turns the form's answers into a ready-to-use site.config.ts (download). Admin only.
const URL_OK = (s: string) => s === '' || /^https?:\/\/\S+$/.test(s)

export async function POST(request: NextRequest) {
  const denied = await requireAdminSession()
  if (denied) return denied

  let b: Partial<SetupValues>
  try { b = await request.json() } catch { return NextResponse.json({ error: 'Invalid form.' }, { status: 400 }) }
  const str = (v: unknown, max: number) => (typeof v === 'string' ? v.trim().slice(0, max) : '')
  const v: SetupValues = {
    name: str(b.name, 80), firstName: str(b.firstName, 40), initials: str(b.initials, 3), shortName: str(b.shortName, 20),
    jobTitle: str(b.jobTitle, 100), location: str(b.location, 80), skillsLine: str(b.skillsLine, 140), description: str(b.description, 300),
    url: str(b.url, 200), email: str(b.email, 200), whatsapp: str(b.whatsapp, 20).replace(/\D/g, ''),
    youtube: str(b.youtube, 200), linkedin: str(b.linkedin, 200), github: str(b.github, 200), instagramPersonal: str(b.instagramPersonal, 200), instagramDev: str(b.instagramDev, 200),
    tagline: str(b.tagline, 200),
    roles: (Array.isArray(b.roles) ? b.roles : []).map((r) => str(r, 40)).filter(Boolean).slice(0, 8),
    bio: (Array.isArray(b.bio) ? b.bio : []).map((p) => str(p, 1200)).filter(Boolean).slice(0, 4),
    contactIntro: str(b.contactIntro, 400), accent: str(b.accent, 7), phone: str(b.phone, 30),
    youtubeChannelId: str(b.youtubeChannelId, 30), adminUsername: str(b.adminUsername, 40), adminEmail: str(b.adminEmail, 200),
  }
  const problems: string[] = []
  if (!v.name) problems.push('your name')
  if (!v.firstName) problems.push('your first name')
  if (!v.jobTitle) problems.push('your job title')
  if (!/^https?:\/\/[^\s/]+\.[^\s/]+/.test(v.url)) problems.push('the site address (starting with https://)')
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.email)) problems.push('a valid email')
  if (!/^#[0-9a-fA-F]{6}$/.test(v.accent)) problems.push('an accent colour like #b0233f')
  if (!v.roles.length) problems.push('at least one role')
  if (![v.youtube, v.linkedin, v.github, v.instagramPersonal, v.instagramDev].every(URL_OK)) problems.push('links that start with https://')
  if (v.youtubeChannelId && !/^UC[\w-]{22}$/.test(v.youtubeChannelId)) problems.push('a YouTube channel ID that starts with UC (or leave it empty)')
  if (!v.adminUsername) problems.push('an admin username')
  if (problems.length) return NextResponse.json({ error: `Please check: ${problems.join(', ')}.` }, { status: 400 })

  let source: string
  try {
    source = await readFile(join(process.cwd(), 'site.config.ts'), 'utf8')
  } catch {
    return NextResponse.json({ error: "This server can't read site.config.ts. Run the site on your computer (npm run dev) and use the wizard there." }, { status: 500 })
  }
  try {
    const out = writeConfig(source, v)
    return new NextResponse(out, { headers: { 'Content-Type': 'text/plain; charset=utf-8', 'Content-Disposition': 'attachment; filename="site.config.ts"', 'Cache-Control': 'no-store' } })
  } catch (err) {
    return NextResponse.json({ error: `site.config.ts has been changed in a way the wizard doesn't recognise (${err instanceof Error ? err.message : 'unknown'}). Edit it by hand instead.` }, { status: 500 })
  }
}
