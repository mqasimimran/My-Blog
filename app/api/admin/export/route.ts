import { NextResponse } from 'next/server'
import { requireAdminSession } from '@/lib/requireAdminSession'
import { buildBackup } from '@/lib/backup'

// Everything on the site as one JSON file: a backup, or a way to move hosts. Admin only.
// Security logs and login records are left out on purpose; they are not content.
export async function GET() {
  const denied = await requireAdminSession()
  if (denied) return denied

  const out = await buildBackup()
  const day = new Date().toISOString().slice(0, 10)
  return new NextResponse(JSON.stringify(out, null, 2), {
    headers: {
      'Content-Type': 'application/json',
      'Content-Disposition': `attachment; filename="site-backup-${day}.json"`,
      'Cache-Control': 'no-store',
    },
  })
}
