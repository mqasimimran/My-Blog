import { supabaseAdmin } from '@/lib/supabaseAdmin'
import { siteConfig } from '@/site.config'

// Every table worth keeping. Used by Admin -> backup download and the Monday email. Tables that don't
// exist yet (before an SQL update) are skipped. Login records and rate-limit logs are left out.
export const BACKUP_TABLES = [
  'articles', 'projects', 'designs', 'services', 'service_packages', 'testimonials', 'products',
  'journey_entries', 'certifications', 'experiences', 'education', 'projects_resume', 'roadmap_items',
  'design_campaigns', 'client_logos', 'site_settings', 'messages', 'newsletter_subscribers', 'orders',
  'discount_codes', 'invoices', 'proposals', 'time_entries', 'client_projects', 'courses', 'course_lessons',
  'feedback_boards', 'feedback_comments', 'post_comments', 'newsletter_campaigns', 'site_searches',
]

export async function buildBackup() {
  const out: Record<string, unknown> = { exported_at: new Date().toISOString(), site: siteConfig.url }
  for (const table of BACKUP_TABLES) {
    const { data, error } = await supabaseAdmin.from(table).select('*').limit(10000)
    if (!error) out[table] = data
  }
  return out
}
