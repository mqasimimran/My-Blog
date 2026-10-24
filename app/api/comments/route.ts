import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabaseAdmin'
import { getClientIp, isRateLimited, recordEvent } from '@/lib/rateLimit'
import { escapeHtml } from '@/lib/escapeHtml'
import { sendEmail } from '@/lib/mail'
import { siteConfig } from '@/site.config'

// Blog comments without GitHub. Only approved comments are returned (never emails). New comments wait
// for approval in Admin -> Blog Comments.
export async function GET(request: NextRequest) {
  const slug = request.nextUrl.searchParams.get('slug') || ''
  const { data } = await supabaseAdmin.from('post_comments').select('id, parent_id, name, body, from_owner, created_at').eq('article_slug', slug).eq('status', 'approved').order('created_at')
  return NextResponse.json({ comments: data || [] }, { headers: { 'Cache-Control': 'no-store' } })
}

export async function POST(request: NextRequest) {
  const ip = getClientIp(request)
  if (await isRateLimited({ identifier: ip, action: 'post_comment', max: 5, windowMinutes: 10 })) return NextResponse.json({ error: 'You\u2019ve commented a lot just now. Please wait a few minutes.' }, { status: 429 })
  const b = await request.json().catch(() => ({}))
  if (b.website) return NextResponse.json({ ok: true, pending: true })   // spam trap
  const slug = typeof b.slug === 'string' ? b.slug.slice(0, 200) : ''
  const name = typeof b.name === 'string' ? b.name.trim().replace(/\s+/g, ' ').slice(0, 60) : ''
  const email = typeof b.email === 'string' ? b.email.trim().slice(0, 200) : ''
  const body = typeof b.body === 'string' ? b.body.trim().slice(0, 3000) : ''
  if (!name || body.length < 2) return NextResponse.json({ error: 'Add your name and a comment.' }, { status: 400 })
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return NextResponse.json({ error: 'That email doesn\u2019t look right.' }, { status: 400 })
  if ((body.match(/https?:\/\//g) || []).length > 2) return NextResponse.json({ error: 'Please include at most two links.' }, { status: 400 })
  const { data: article } = await supabaseAdmin.from('articles').select('slug, title').eq('slug', slug).eq('published', true).maybeSingle()
  if (!article) return NextResponse.json({ error: 'Post not found.' }, { status: 404 })
  let parent_id: string | null = null
  if (typeof b.parentId === 'string' && b.parentId) {
    const { data: p } = await supabaseAdmin.from('post_comments').select('id, parent_id').eq('id', b.parentId).eq('article_slug', slug).eq('status', 'approved').maybeSingle()
    if (!p) return NextResponse.json({ error: 'The comment you\u2019re replying to wasn\u2019t found.' }, { status: 400 })
    parent_id = p.parent_id || p.id   // replies stay one level deep
  }
  await recordEvent(ip, 'post_comment')
  const { error } = await supabaseAdmin.from('post_comments').insert([{ article_slug: slug, parent_id, name, email: email || null, body }])
  if (error) return NextResponse.json({ error: 'Could not save your comment.' }, { status: 500 })
  if (process.env.RESEND_API_KEY && process.env.NOTIFY_TO_EMAIL) await sendEmail({ from: siteConfig.mail.contactFormFrom, to: [process.env.NOTIFY_TO_EMAIL], subject: `New comment on "${article.title}"`,
    html: `<p><strong>${escapeHtml(name)}</strong> commented on <strong>${escapeHtml(article.title)}</strong>:</p><blockquote>${escapeHtml(body)}</blockquote><p><a href="${siteConfig.url}/admin/comments">Approve or delete it</a></p>` })
  return NextResponse.json({ ok: true, pending: true })
}
