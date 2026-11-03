import { supabaseAdmin } from '@/lib/supabaseAdmin'

export type Pack = { id: string; company: string; role_applied: string | null; contact_name: string | null; note: string | null; project_ids: string[]; include_cv: boolean
  public_token: string; views: number; first_viewed_at: string | null; last_viewed_at: string | null; created_at: string }

export async function getPack(token: string) {
  if (!/^[a-f0-9]{16,64}$/.test(token)) return null
  const { data } = await supabaseAdmin.from('recruiter_packs').select('*').eq('public_token', token).maybeSingle()
  return data as Pack | null
}
export async function logEvent(packId: string, event: 'view' | 'cv' | 'project' | 'contact', detail?: string) {
  await supabaseAdmin.from('recruiter_events').insert([{ pack_id: packId, event, detail: detail?.slice(0, 200) || null }])
}
