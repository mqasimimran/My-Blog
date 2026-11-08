import { supabaseAdmin } from '@/lib/supabaseAdmin'
import { siteConfig } from '@/site.config'

// The admin JSON export covers portfolio and business data. Disaster recovery also archives Storage.
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
    const rows: unknown[] = []
    for (;;) {
      let query = supabaseAdmin.from(table).select('*')
      query = table === 'site_searches' ? query.order('term').order('day') : query.order('id')
      const { data, error } = await query.range(rows.length, rows.length + 499)
      if (error) throw new Error('Backup failed while reading '+table+': '+error.code)
      if (!data.length) break
      rows.push(...data)
    }
    out[table] = rows
  }
  return out
}
