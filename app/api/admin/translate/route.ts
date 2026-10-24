import { NextRequest, NextResponse } from 'next/server'
import { requireAdminSession } from '@/lib/requireAdminSession'
import { complete, provider } from '@/lib/ai'

// "Draft Urdu with AI" in the blog editor: translates a post into Urdu as a first draft for you to
// review. HTML formatting is kept. Admin only.
export async function POST(request: NextRequest) {
  const denied = await requireAdminSession()
  if (denied) return denied
  if (!provider()) return NextResponse.json({ error: 'Add GEMINI_API_KEY (free) to use AI drafts.' }, { status: 503 })
  const b = await request.json().catch(() => ({}))
  const title = typeof b.title === 'string' ? b.title.slice(0, 300) : ''
  const excerpt = typeof b.excerpt === 'string' ? b.excerpt.slice(0, 1000) : ''
  const content = typeof b.content === 'string' ? b.content.slice(0, 60000) : ''
  if (!title || !content) return NextResponse.json({ error: 'Write the English title and text first.' }, { status: 400 })
  const system = `You translate blog posts from English into natural, fluent Urdu (Pakistan), written in Urdu script.
Rules: keep all HTML tags and attributes exactly as they are and translate only the visible text. Keep code, URLs,
product names and technical terms that are normally written in English (e.g. Next.js, Python, API) in English.
Reply with ONLY a JSON object: {"title": "...", "excerpt": "...", "content": "..."} and nothing else.`
  try {
    const raw = await complete(system, [{ role: 'user', content: JSON.stringify({ title, excerpt, content }) }], 8000)
    const json = JSON.parse(raw.replace(/^```(?:json)?\s*|\s*```$/g, '').trim())
    if (typeof json.title !== 'string' || typeof json.content !== 'string') throw new Error('Unexpected reply')
    return NextResponse.json({ title: json.title, excerpt: typeof json.excerpt === 'string' ? json.excerpt : '', content: json.content })
  } catch (err) {
    console.error('Urdu draft failed:', err instanceof Error ? err.message : err)
    return NextResponse.json({ error: 'The AI draft didn\u2019t work this time. Try again, or write the Urdu by hand.' }, { status: 502 })
  }
}
