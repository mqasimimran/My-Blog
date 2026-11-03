import { NextRequest, NextResponse } from 'next/server'
import { getPack, logEvent } from '@/lib/recruiter'
import { siteConfig } from '@/site.config'

// Clicks from a recruiter pack (CV, a project, a contact link): recorded, then forwarded.
// Only known destinations are allowed, so this can't be used to redirect anywhere else.
export async function GET(request: NextRequest, { params }: { params: Promise<{ token: string }> }) {
  const pack = await getPack((await params).token)
  const to = request.nextUrl.searchParams.get('to') || ''
  if (!pack) return NextResponse.redirect(new URL('/', request.url))
  const allowed: Record<string, string> = { cv: '/api/cv', email: `mailto:${siteConfig.email}`, linkedin: siteConfig.social.linkedin, github: siteConfig.social.github }
  let dest = allowed[to], kind: 'cv' | 'project' | 'contact' = to === 'cv' ? 'cv' : 'contact'
  if (to.startsWith('project:') && /^[a-z0-9-]{1,120}$/.test(to.slice(8))) { dest = `/projects/${to.slice(8)}`; kind = 'project' }
  if (!dest) return NextResponse.redirect(new URL('/', request.url))
  if (request.nextUrl.searchParams.get('preview') !== '1') await logEvent(pack.id, kind, to)
  return NextResponse.redirect(dest.startsWith('/') ? new URL(dest, request.url) : dest, 302)
}
