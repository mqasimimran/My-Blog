import type { SupabaseClient } from '@supabase/supabase-js'

export type WorkRow = { id: string; title?: string; name?: string; slug?: string | null; published?: boolean; show_on_design?: boolean; client?: WorkRow | null }
export type WorkType = 'project' | 'design' | 'client' | 'campaign'
export type Work = { key: string; title: string; href: string; label: string }

export function describeWork(type: WorkType, row?: WorkRow | null): Work | null {
  if (!row || (type === 'client' ? !row.show_on_design : !row.published)) return null
  if (type === 'project' && !row.slug) return null
  if (type === 'campaign') {
    const client = describeWork('client', row.client)
    if (!client) return null
    return {key: 'campaign:' + row.id, title: client.title + ' — ' + row.title, href: client.href + '/campaigns/' + row.id, label: 'Read case study'}
  }
  const slug = encodeURIComponent(row.slug || row.id)
  return { key: type + ':' + row.id, title: row.title || row.name || '', label: type === 'project' ? 'View project' : type === 'design' ? 'View design' : 'Read case study',
    href: type === 'project' ? '/projects/' + slug : type === 'design' ? '/design?item=' + encodeURIComponent(row.id) : '/design/clients/' + slug }
}

export function workColumns(key: string) {
  const [type, id] = key.split(':')
  return { campaign_id: type === 'campaign' ? id : null, project_id: type === 'project' ? id : null, design_id: type === 'design' ? id : null, client_id: type === 'client' ? id : null }
}

const validKey = /^(project|design|client|campaign):[a-f\d]{8}(?:-[a-f\d]{4}){3}-[a-f\d]{12}$/i
export async function loadWorks(db: SupabaseClient, key?: string): Promise<Work[]> {
  if (key !== undefined && !validKey.test(key)) return []
  const rows = await Promise.all((['project','design','client','campaign'] as const).map(async type => {
    if (key && !key.startsWith(type + ':')) return []
    const table = { project: 'projects', design: 'designs', client: 'client_logos', campaign: 'design_campaigns' }[type]
    let query = db.from(table).select(type === 'campaign' ? 'id,title,published,client:client_logos(id,name,slug,show_on_design)' : type === 'client' ? 'id,name,slug,show_on_design' : type === 'project' ? 'id,title,slug,published' : 'id,title,published')
      .eq(type === 'client' ? 'show_on_design' : 'published', true)
    if (key) query = query.eq('id',key.split(':')[1])
    const { data, error } = await query.order(type === 'client' ? 'name' : 'title')
    if (error) throw error
    return (data as unknown as WorkRow[]).map(row => describeWork(type,row)).filter((w): w is Work => !!w)
  }))
  return rows.flat()
}
