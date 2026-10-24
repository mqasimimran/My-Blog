import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabaseAdmin'
import { complete, provider } from '@/lib/ai'
import { getClientIp, isRateLimited, recordEvent } from '@/lib/rateLimit'

// "Explain it to me" on project pages: rewrites a published case study for a chosen reader.
// Answers are cached for 6 hours and limited per visitor, to save your AI quota.
const MODES = {
  recruiter: 'a recruiter or hiring manager: focus on the impact, the skills shown, and what it says about the person as a hire. No jargon.',
  engineer: 'a software engineer: focus on the technical approach, architecture, trade-offs and tools.',
  simple: 'someone with no technical background: explain what it is and why it matters in plain, friendly language.',
} as const
type Mode = keyof typeof MODES
const cache = new Map<string, { at: number; text: string }>()

export async function GET() {
  return NextResponse.json({ enabled: provider() !== null }, { headers: { 'Cache-Control': 'no-store' } })
}

export async function POST(request: NextRequest) {
  if (!provider()) return NextResponse.json({ error: 'Not available.' }, { status: 503 })
  const b = await request.json().catch(() => ({}))
  const slug = typeof b.slug === 'string' ? b.slug.slice(0, 120) : ''
  const mode = (Object.keys(MODES).includes(b.mode) ? b.mode : 'simple') as Mode
  const locale = b.locale === 'ur' ? 'ur' : 'en'
  const key = `${slug}:${mode}:${locale}`
  const hit = cache.get(key)
  if (hit && Date.now() - hit.at < 6 * 3600 * 1000) return NextResponse.json({ text: hit.text })

  const ip = getClientIp(request)
  if (await isRateLimited({ identifier: ip, action: 'explain', max: 20, windowMinutes: 60 })) return NextResponse.json({ error: 'Please try again in a little while.' }, { status: 429 })
  const { data: p } = await supabaseAdmin.from('projects').select('title, category, description, tech_stack, status, problem, approach, outcome, stats').eq('slug', slug).eq('published', true).maybeSingle()
  if (!p) return NextResponse.json({ error: 'Project not found.' }, { status: 404 })

  const system = `You rewrite a portfolio case study for ${MODES[mode]}
Use ONLY the facts given. Never invent numbers, results, users or tools. If something isn't stated, leave it out.
Write 2 short paragraphs (about 120 words in total), in the third person about the person who built it.
${locale === 'ur' ? 'Write in natural Urdu (Urdu script). Keep tool and product names in English.' : 'Write in clear English.'} Plain text only: no headings, lists or markdown.`
  const facts = Object.entries(p).filter(([, v]) => v).map(([k, v]) => `${k}: ${String(v).replace(/\n/g, '; ')}`).join('\n')
  try {
    const text = (await complete(system, [{ role: 'user', content: facts }], 700)).trim()
    if (!text) throw new Error('empty')
    await recordEvent(ip, 'explain')
    cache.set(key, { at: Date.now(), text })
    return NextResponse.json({ text })
  } catch (err) {
    console.error('Explain failed:', err instanceof Error ? err.message : err)
    return NextResponse.json({ error: 'Couldn\u2019t explain this right now. Please try again.' }, { status: 502 })
  }
}
