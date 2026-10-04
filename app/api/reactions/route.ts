import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabaseAdmin'
import { getClientIp, isRateLimited, recordEvent } from '@/lib/rateLimit'

// "Loved this" counter. The old client code did
//   supabase.from('articles').update({ reaction_count: count + 1 })
// with the public key — which both let the browser choose any number and
// required anonymous UPDATE access to the whole articles table (every
// column, including content). Now the increment happens here, server-side,
// and nothing else about the article is touchable from the browser.
export async function POST(request: NextRequest) {
  let body: any
  try { body = await request.json() } catch { return NextResponse.json({ error: 'Invalid request' }, { status: 400 }) }

  const slug = String(body?.slug || '')
  if (!slug || slug.length > 200) return NextResponse.json({ error: 'Missing slug' }, { status: 400 })

  const ip = getClientIp(request)
  const action = `react:${slug}`
  if (await isRateLimited({ identifier: ip, action, max: 1, windowMinutes: 60 * 24 })) {
    return NextResponse.json({ error: 'Already reacted' }, { status: 429 })
  }

  const { data: article } = await supabaseAdmin
    .from('articles')
    .select('id, reaction_count')
    .eq('slug', slug)
    .eq('published', true)
    .maybeSingle()
  if (!article) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const next = (article.reaction_count || 0) + 1
  const { error } = await supabaseAdmin.from('articles').update({ reaction_count: next }).eq('id', article.id)
  if (error) return NextResponse.json({ error: 'Failed' }, { status: 500 })

  await recordEvent(ip, action)
  return NextResponse.json({ count: next })
}
