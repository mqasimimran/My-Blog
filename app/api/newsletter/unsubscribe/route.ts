import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export async function GET(request: NextRequest) {
  const email = request.nextUrl.searchParams.get('email')

  if (!email) {
    return new NextResponse('Missing email.', { status: 400 })
  }

  await supabase.from('newsletter_subscribers').delete().eq('email', email)

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
