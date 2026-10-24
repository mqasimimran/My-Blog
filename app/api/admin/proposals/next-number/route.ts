import { NextResponse } from 'next/server'
import { requireAdminSession } from '@/lib/requireAdminSession'
import { nextNumber } from '@/lib/invoiceServer'

export async function GET() {
  const denied = await requireAdminSession()
  if (denied) return denied
  return NextResponse.json({ number: await nextNumber('proposals', 'PRO') }, { headers: { 'Cache-Control': 'no-store' } })
}
