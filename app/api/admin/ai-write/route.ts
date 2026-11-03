import { NextRequest, NextResponse } from 'next/server'
import { requireAdminSession } from '@/lib/requireAdminSession'
import { complete, provider } from '@/lib/ai'
import { siteConfig } from '@/site.config'

// AI writing help in the blog editor: titles, the Google description, an outline from bullet points,
// social posts, and alt text for images (the model looks at each image). Admin only.
export const maxDuration = 60
const VOICE = `You write for ${siteConfig.name}, a ${siteConfig.jobTitle} who shares practical lessons about AI, computer science, design and building things. Voice: warm, clear, direct, no hype, no clich\u00e9s, no em dashes.`
const text = (h: string) => h.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 12000)
const json = (raw: string) => JSON.parse(raw.replace(/^```(?:json)?\s*|\s*```$/g, '').trim())

export async function POST(request: NextRequest) {
  const denied = await requireAdminSession()
  if (denied) return denied
  if (!provider()) return NextResponse.json({ error: 'Add GEMINI_API_KEY (free) to use the AI helper.' }, { status: 503 })
  const b = await request.json().catch(() => ({}))
  const title = String(b.title || '').slice(0, 300), body = text(String(b.content || ''))
  try {
    switch (b.action) {
      case 'titles': {
        if (!body && !title) return NextResponse.json({ error: 'Write something first.' }, { status: 400 })
        const r = await complete(`${VOICE} Suggest 5 blog post titles: specific, under 65 characters, the kind people would search for or click. Reply with ONLY a JSON array of strings.`, [{ role: 'user', content: `Current title: ${title}\n\nPost: ${body}` }], 600)
        return NextResponse.json({ titles: (json(r) as string[]).slice(0, 5) })
      }
      case 'description': {
        if (!body) return NextResponse.json({ error: 'Write the post first.' }, { status: 400 })
        const r = await complete(`${VOICE} Write the Google search description for this post: one or two sentences, 120 to 155 characters, saying what the reader will learn, with the main keyword near the start. Reply with ONLY the description.`, [{ role: 'user', content: `Title: ${title}\n\n${body}` }], 300)
        return NextResponse.json({ description: r.replace(/^["']|["']$/g, '').slice(0, 160) })
      }
      case 'outline': {
        const bullets = String(b.bullets || '').slice(0, 4000)
        if (!bullets.trim()) return NextResponse.json({ error: 'Add a few bullet points first.' }, { status: 400 })
        const r = await complete(`${VOICE} Turn these notes into a blog post outline in HTML: an opening paragraph, then 3 to 6 <h2> sections each with a short <p> of what to cover (and a <ul> where useful), then a closing paragraph. Only <h2>, <p>, <ul>, <li>, <strong>. Reply with ONLY the HTML.`, [{ role: 'user', content: `Title: ${title}\n\nNotes:\n${bullets}` }], 2000)
        return NextResponse.json({ html: r.replace(/^```(?:html)?\s*|\s*```$/g, '').trim() })
      }
      case 'social': {
        if (!body) return NextResponse.json({ error: 'Write the post first.' }, { status: 400 })
        const url = `${siteConfig.url}/blog/${String(b.slug || '').replace(/[^a-z0-9-]/gi, '')}`
        const r = await complete(`${VOICE} Write social posts promoting this blog post. LinkedIn: 3 to 5 short paragraphs, a hook first line, a takeaway, a question at the end, 3 hashtags, include the link. Instagram: a caption with a hook, 2 to 4 short lines, a call to "link in bio", 8 to 12 relevant hashtags. X: under 270 characters including the link, 1 or 2 hashtags. Reply with ONLY JSON: {"linkedin": "...", "instagram": "...", "x": "..."}`, [{ role: 'user', content: `Link: ${url}\nTitle: ${title}\n\n${body}` }], 1500)
        const out = json(r); return NextResponse.json({ linkedin: String(out.linkedin || ''), instagram: String(out.instagram || ''), x: String(out.x || '') })
      }
      case 'alttext': {
        const html = String(b.content || '')
        const srcs = [...html.matchAll(/<img\b[^>]*>/gi)].map((m) => m[0]).filter((tag) => !/\salt="[^"]+"/i.test(tag)).map((tag) => tag.match(/\ssrc="([^"]+)"/i)?.[1]).filter(Boolean) as string[]
        const out: Record<string, string> = {}
        for (const src of [...new Set(srcs)].slice(0, 6)) {
          // Only your own images (site files and Supabase storage), never arbitrary addresses.
          const own = src.startsWith('/') && !src.startsWith('//')
          if (!own && !/^https:\/\/[a-z0-9-]+\.supabase\.co\//i.test(src)) continue
          // Site images are fetched from this server itself (works locally, in previews and live).
          const res = await fetch(own ? new URL(src, request.nextUrl.origin).toString() : src, { signal: AbortSignal.timeout(10000) }).catch(() => null)
          const mime = res?.headers.get('content-type')?.split(';')[0] || ''
          if (!res?.ok || !/^image\/(png|jpe?g|webp|gif)$/.test(mime)) continue
          const buf = Buffer.from(await res.arrayBuffer()); if (buf.length > 4_000_000) continue
          const alt = await complete('Write alt text for this image as it appears in a blog post: what it shows and why it matters, under 125 characters, no "image of". Reply with ONLY the alt text.', [{ role: 'user', content: `Post title: ${title}` }], 200, { mime, data: buf.toString('base64') })
          out[src] = alt.replace(/^["']|["']$/g, '').slice(0, 140)
        }
        return NextResponse.json({ alts: out, missing: srcs.length })
      }
      default: return NextResponse.json({ error: 'Unknown action.' }, { status: 400 })
    }
  } catch (err) {
    console.error('AI helper failed:', err instanceof Error ? err.message : err)
    return NextResponse.json({ error: 'The AI didn\u2019t answer this time. Please try again.' }, { status: 502 })
  }
}
