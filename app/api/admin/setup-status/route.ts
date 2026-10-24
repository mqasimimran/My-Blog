import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { supabaseAdmin } from '@/lib/supabaseAdmin'
import { requireAdminSession } from '@/lib/requireAdminSession'
import { siteConfig } from '@/site.config'

// Setup wizard checklist: is everything this site needs actually in place? Admin only. Read-only.
type Check = { group: string; label: string; ok: boolean; level: 'required' | 'recommended' | 'optional'; fix: string }

export async function GET() {
  const denied = await requireAdminSession()
  if (denied) return denied
  const env = process.env
  const checks: Check[] = []
  const add = (group: string, label: string, ok: boolean, level: Check['level'], fix: string) => checks.push({ group, label, ok, level, fix })

  add('Environment', 'Supabase address and public key', !!env.NEXT_PUBLIC_SUPABASE_URL && !!env.NEXT_PUBLIC_SUPABASE_ANON_KEY, 'required', 'Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY (Supabase -> Project Settings -> API).')
  add('Environment', 'Supabase server (secret) key', !!env.SUPABASE_SERVICE_ROLE_KEY && env.SUPABASE_SERVICE_ROLE_KEY !== env.NEXT_PUBLIC_SUPABASE_ANON_KEY, 'required', 'Add SUPABASE_SERVICE_ROLE_KEY: the secret key, not the public one.')
  add('Environment', 'Login secret (NEXTAUTH_SECRET)', (env.NEXTAUTH_SECRET || '').length >= 32, 'required', 'Set NEXTAUTH_SECRET to a random value of 32+ characters (run: openssl rand -base64 32).')
  add('Environment', 'Site address for logins (NEXTAUTH_URL)', !!env.NEXTAUTH_URL, 'required', `Set NEXTAUTH_URL to your site address, e.g. ${siteConfig.url}.`)
  add('Admin login', 'Password stored as a hash', !!env.ADMIN_PASSWORD_HASH && !env.ADMIN_PASSWORD, 'required', 'Run node scripts/admin-setup.mjs hash, put the result in ADMIN_PASSWORD_HASH and remove ADMIN_PASSWORD.')
  add('Admin login', 'Two-factor login', !!env.ADMIN_TOTP_SECRET, 'recommended', 'Run node scripts/admin-setup.mjs totp and add ADMIN_TOTP_SECRET.')
  add('Email', 'Sending email (Resend)', !!env.RESEND_API_KEY, 'recommended', 'Add RESEND_API_KEY so order, contact and newsletter emails are sent.')
  add('Email', 'Where your notifications go', !!env.NOTIFY_TO_EMAIL, 'recommended', 'Add NOTIFY_TO_EMAIL: the address that receives new orders and messages.')
  add('Extras', 'Card payments (Lemon Squeezy)', !!(env.LEMONSQUEEZY_API_KEY && env.LEMONSQUEEZY_STORE_ID && env.LEMONSQUEEZY_WEBHOOK_SECRET), 'optional', 'Add LEMONSQUEEZY_API_KEY, LEMONSQUEEZY_STORE_ID and LEMONSQUEEZY_WEBHOOK_SECRET, then add a variant ID to each digital product.')
  add('Extras', 'AI assistant key', !!(env.GEMINI_API_KEY || env.ANTHROPIC_API_KEY), 'optional', 'Add GEMINI_API_KEY (free at aistudio.google.com/apikey) to switch on the "Ask about me" chat.')

  // Database: core tables plus the newest columns (missing ones mean an SQL update hasn't been run).
  const probe = async (table: string, columns = '*') => !(await supabaseAdmin.from(table).select(columns).limit(1)).error
  const core = ['articles', 'projects', 'products', 'orders', 'services', 'testimonials', 'site_settings', 'messages']
  const missing = (await Promise.all(core.map(async (t) => ((await probe(t)) ? null : t)))).filter(Boolean)
  add('Database', 'Core tables', missing.length === 0, 'required', `Run supabase/setup.sql in the Supabase SQL editor. Missing: ${missing.join(', ')}.`)
  const latest = (await probe('projects', 'play_url')) && (await probe('private_settings')) && (await probe('discount_codes')) && (await probe('products', 'bundle_items'))
  add('Database', 'Latest features (games, testimonials, discounts, bundles)', latest, 'required', 'Run the newest supabase/update-*.sql files (or supabase/setup.sql) in the Supabase SQL editor.')

  // Security, tested the way a visitor would: with the public key only.
  let lockedDown = false
  if (env.NEXT_PUBLIC_SUPABASE_URL && env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    const pub = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.NEXT_PUBLIC_SUPABASE_ANON_KEY)
    const orders = await pub.from('orders').select('id').limit(1)
    const secret = await pub.from('private_settings').select('id').limit(1)
    lockedDown = (orders.error !== null || (orders.data?.length ?? 0) === 0) && secret.error !== null
  }
  add('Database', 'Locked down (visitors can\u2019t read orders or private settings)', lockedDown, 'required', 'Run supabase/security-lockdown.sql (it is included in setup.sql).')

  const { data: buckets } = await supabaseAdmin.storage.listBuckets()
  const names = (buckets || []).map((b) => b.name)
  add('Storage', 'Image buckets (blog-images, resume-images)', ['blog-images', 'resume-images'].every((n) => names.includes(n)), 'required', 'Create public buckets named blog-images and resume-images (Supabase -> Storage).')

  return NextResponse.json({ checks, site: { name: siteConfig.name, url: siteConfig.url } }, { headers: { 'Cache-Control': 'no-store' } })
}
