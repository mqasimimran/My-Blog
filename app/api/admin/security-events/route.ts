import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabaseAdmin'
import { requireAdminSession } from '@/lib/requireAdminSession'

// Feeds the /admin/security page. Lives at its own path (not under
// [table]) because security_audit_log is deliberately NOT in the generic
// admin allowlist — nothing can write to it except server code.
export async function GET() {
  const denied = await requireAdminSession()
  if (denied) return denied
  const { data, error } = await supabaseAdmin
    .from('security_audit_log')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(300)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ data })
}
