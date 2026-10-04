import 'server-only'
import { createClient } from '@supabase/supabase-js'

// This uses the SERVICE ROLE key, which bypasses Row Level Security
// entirely. It must only ever be imported from server-side code — API
// routes, Server Components, Server Actions. The `server-only` import
// above makes Next.js throw a build error if any client component
// ('use client') ever tries to import this file, as a hard guardrail
// against accidentally shipping this key to the browser.
//
// SUPABASE_SERVICE_ROLE_KEY is a new env var — it is NOT the same as
// NEXT_PUBLIC_SUPABASE_ANON_KEY. Find it in your Supabase project under
// Settings → API → service_role key. Never prefix it with NEXT_PUBLIC_.
if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
  throw new Error('Missing SUPABASE_SERVICE_ROLE_KEY — set it in your environment (never NEXT_PUBLIC_).')
}

export const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: { autoRefreshToken: false, persistSession: false },
  }
)
