import { createHash } from 'node:crypto'
import { supabaseAdmin } from '@/lib/supabaseAdmin'
import { emailMe } from '@/lib/notify'
import { escapeHtml } from '@/lib/escapeHtml'
import { siteConfig } from '@/site.config'

// Records an error a visitor hit, grouped by message and page. You're emailed at most once an hour per
// error. Common harmless noise (browser extensions, ResizeObserver, cross-site "Script error.") is ignored.
const NOISE = /ResizeObserver loop|chrome-extension:|moz-extension:|safari-extension:|^Script error\.?$|Non-Error promise rejection|AbortError|Load failed|NetworkError when attempting|Failed to fetch/i

export async function recordError(e: { source: 'browser' | 'server'; message: string; url?: string; detail?: string }) {
  const message = (e.message || '').trim().slice(0, 500)
  if (!message || NOISE.test(message) || NOISE.test(e.detail || '')) return
  const path = (e.url || '').replace(/^https?:\/\/[^/]+/, '').split('?')[0].slice(0, 200)
  const hash = createHash('sha1').update(`${e.source}|${message}|${path}`).digest('hex')
  try {
    const { data: existing } = await supabaseAdmin.from('error_reports').select('count, notified_at').eq('hash', hash).maybeSingle()
    const now = new Date()
    const notify = !existing?.notified_at || now.getTime() - new Date(existing.notified_at).getTime() > 3600_000
    if (existing) await supabaseAdmin.from('error_reports').update({ count: existing.count + 1, last_seen: now.toISOString(), ...(notify ? { notified_at: now.toISOString() } : {}) }).eq('hash', hash)
    else await supabaseAdmin.from('error_reports').insert([{ hash, message, source: e.source, url: path, detail: (e.detail || '').slice(0, 2000), notified_at: now.toISOString() }])
    if (notify) await emailMe(`Site error (${e.source}): ${message.slice(0, 80)}`, `<p>A visitor hit an error on <strong>${escapeHtml(path || 'your site')}</strong>:</p><pre style="white-space:pre-wrap">${escapeHtml(message)}\n\n${escapeHtml((e.detail || '').slice(0, 1500))}</pre><p><a href="${siteConfig.url}/admin/errors">See all errors</a></p>`)
  } catch { /* never let error reporting cause another error */ }
}
