import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabaseAdmin'
import { requireAdminSession } from '@/lib/requireAdminSession'

// Dashboard stat cards. Lives at its own path (not under [table]) so the
// generic CRUD route's allowlist stays a plain list of tables.
export async function GET() {
  const unauthorized = await requireAdminSession()
  if (unauthorized) return unauthorized

  const [messages, subscribers, testimonials, topPost] = await Promise.all([
    supabaseAdmin.from('messages').select('*', { count: 'exact', head: true }).eq('is_read', false),
    supabaseAdmin.from('newsletter_subscribers').select('*', { count: 'exact', head: true }),
    supabaseAdmin.from('testimonials').select('*', { count: 'exact', head: true }).eq('active', true),
    supabaseAdmin
      .from('articles')
      .select('title, slug, reaction_count')
      .order('reaction_count', { ascending: false })
      .limit(1)
      .maybeSingle(),
  ])

  return NextResponse.json({
    unreadMessages: messages.count || 0,
    subscribers: subscribers.count || 0,
    activeTestimonials: testimonials.count || 0,
    mostLovedPost: topPost.data && topPost.data.reaction_count > 0 ? topPost.data : null,
  })
}
