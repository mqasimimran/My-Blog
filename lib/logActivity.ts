import { supabase } from '@/lib/supabase'

/**
 * Records an admin action to the activity_log table. Fire-and-forget by
 * design — a logging failure should never block or surface an error for
 * the actual action (publishing, deleting, etc.) it's describing.
 */
export function logActivity(params: {
  action: string
  entityType: string
  entityLabel?: string | null
  count?: number
}) {
  supabase
    .from('activity_log')
    .insert([{
      action: params.action,
      entity_type: params.entityType,
      entity_label: params.entityLabel ?? null,
      count: params.count ?? 1,
    }])
    .then(({ error }) => {
      if (error) console.error('Error logging activity:', error)
    })
}
