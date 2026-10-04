import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin as supabase } from '@/lib/supabaseAdmin'


export async function GET(request: NextRequest) {
  const email = request.nextUrl.searchParams.get('email')
  const token = request.nextUrl.searchParams.get('token')

  if (!email || !token) {
    return new NextResponse('Missing or invalid unsubscribe link.', { status: 400 })
  }

  // Requiring the token (not just the email) means someone can't
  // unsubscribe another person just by knowing or guessing their email —
  // the token only ever appears in the email actually sent to them.
  const { data, error } = await supabase
    .from('newsletter_subscribers')
    .delete()
    .eq('email', email)
    .eq('unsubscribe_token', token)
    .select()

  if (error || !data || data.length === 0) {
    return new NextResponse('Invalid or expired unsubscribe link.', { status: 400 })
  }

  // A plain, self-contained confirmation page — no need to round-trip
  // through the rest of the site's layout for this.
  return new NextResponse(
    `<!DOCTYPE html>
    <html><head><meta charset="UTF-8"><title>Unsubscribed</title></head>
    <body style="font-family: sans-serif; max-width: 400px; margin: 100px auto; text-align: center; color: #374151;">
      <h1 style="font-weight: 300;">You're unsubscribed</h1>
      <p style="color: #6b7280;">${email} won't receive any more post notifications. Sorry to see you go.</p>
    </body></html>`,
    { headers: { 'Content-Type': 'text/html' } }
  )
}
