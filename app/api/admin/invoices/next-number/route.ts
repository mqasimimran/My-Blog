import { NextResponse } from 'next/server'
import { nextNumber } from '@/lib/invoiceServer'
import { requireAdminSession } from '@/lib/requireAdminSession'

// The next invoice number for this year: INV-2026-001, INV-2026-002, ...
export async function GET() {
  const denied = await requireAdminSession()
  if (denied) return denied
  return NextResponse.json({ number: await nextNumber('INV') }, { headers: { 'Cache-Control': 'no-store' } })
}
