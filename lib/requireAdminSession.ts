import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/authOptions"
import { NextResponse } from "next/server"

/**
 * Verifies the request has a valid, logged-in admin session.
 * Returns null if the session is valid — the caller proceeds normally.
 * Returns a 401 NextResponse if it isn't — the caller should
 * `return` this immediately without touching the database.
 *
 * Usage in any API route:
 *   const unauthorized = await requireAdminSession()
 *   if (unauthorized) return unauthorized
 */
export async function requireAdminSession() {
  const session = await getServerSession(authOptions)
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  return null
}
