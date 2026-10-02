import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

// A small public API exposing this site's own content stats — no auth
// required, read-only, nothing sensitive. Cached at the edge for 5 minutes
// so this can't be used to hammer the database.
export const revalidate = 300

export async function GET() {
  const [projects, articles, designs, services, testimonials, reactions] = await Promise.all([
    supabase.from('projects').select('*', { count: 'exact', head: true }),
    supabase.from('articles').select('*', { count: 'exact', head: true }).eq('published', true),
    supabase.from('designs').select('*', { count: 'exact', head: true }),
    supabase.from('services').select('*', { count: 'exact', head: true }).eq('active', true),
    supabase.from('testimonials').select('*', { count: 'exact', head: true }).eq('active', true),
    supabase.from('articles').select('reaction_count'),
  ])

  const totalReactions = (reactions.data || []).reduce((sum, a) => sum + (a.reaction_count || 0), 0)

  return NextResponse.json({
    site: 'Muhammad Qasim Imran — Portfolio',
    generated_at: new Date().toISOString(),
    stats: {
      projects: projects.count || 0,
      published_blog_posts: articles.count || 0,
      design_pieces: designs.count || 0,
      active_services: services.count || 0,
      testimonials: testimonials.count || 0,
      total_blog_reactions: totalReactions,
    },
    links: {
      website: 'https://my-blog-beta-red.vercel.app',
      github: 'https://github.com/mqasimimran',
      linkedin: 'https://linkedin.com/in/muhammadqasimimran',
    },
  }, {
    headers: {
      'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=60',
    },
  })
}
