import { adminApi } from '@/lib/adminApi'

/**
 * Records an admin action to the activity_log table via the secured admin
 * API (which requires your login session — this is only ever called from
 * admin pages). Fire-and-forget by design: a logging failure should never
 * block or surface an error for the action it's describing.
 */
export function logActivity(params: {
  action: string
  entityType: string
  entityLabel?: string | null
  count?: number
}) {
  adminApi
    .insert('activity_log', {
      action: params.action,
      entity_type: params.entityType,
      entity_label: params.entityLabel ?? null,
      count: params.count ?? 1,
    })
    .catch((err) => console.error('Error logging activity:', err))
}
