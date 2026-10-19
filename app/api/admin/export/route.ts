import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabaseAdmin'
import { requireAdminSession } from '@/lib/requireAdminSession'
import { siteConfig } from '@/site.config'

// Everything on the site as one JSON file: a backup, or a way to move hosts. Admin only.
// Security logs and login records are left out on purpose; they are not content.
const TABLES = [
  'articles', 'projects', 'designs', 'services', 'service_packages', 'testimonials', 'products',
  'journey_entries', 'certifications', 'experiences', 'education', 'projects_resume', 'roadmap_items',
  'client_logos', 'site_settings', 'messages', 'newsletter_subscribers', 'orders',
]

export async function GET() {
  const denied = await requireAdminSession()
  if (denied) return denied

  const out: Record<string, unknown> = { exported_at: new Date().toISOString(), site: siteConfig.url }
  for (const table of TABLES) {
    const { data, error } = await supabaseAdmin.from(table).select('*').limit(10000)
    out[table] = error ? { error: error.message } : data
  }
  const day = new Date().toISOString().slice(0, 10)
  return new NextResponse(JSON.stringify(out, null, 2), {
    headers: {
      'Content-Type': 'application/json',
      'Content-Disposition': `attachment; filename="site-backup-${day}.json"`,
      'Cache-Control': 'no-store',
    },
  })
}
