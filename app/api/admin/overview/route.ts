import { NextResponse } from 'next/server'
import { requireAdminSession } from '@/lib/requireAdminSession'
import { getOverview } from '@/lib/overview'

export async function GET() {
  const denied = await requireAdminSession()
  if (denied) return denied
  return NextResponse.json(await getOverview(), { headers: { 'Cache-Control': 'no-store' } })
}
