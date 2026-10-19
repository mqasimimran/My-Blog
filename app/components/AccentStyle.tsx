import { accentCss } from '@/lib/accent'

// Applies the accent colour chosen in /admin/settings to the whole site. Cached and refreshed every
// minute, so saving a new colour shows up across the site within a minute. Without a saved colour,
// the default from app/globals.css is used.
export default async function AccentStyle() {
  try {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    if (!url || !key) return null
    const res = await fetch(`${url}/rest/v1/site_settings?select=accent_color&id=eq.1`, {
      headers: { apikey: key, Authorization: `Bearer ${key}` },
      next: { revalidate: 60 },
    })
    if (!res.ok) return null
    const rows: { accent_color: string | null }[] = await res.json()
    const css = rows[0]?.accent_color ? accentCss(rows[0].accent_color) : null
    return css ? <style dangerouslySetInnerHTML={{ __html: css }} /> : null
  } catch {
    return null
  }
}
