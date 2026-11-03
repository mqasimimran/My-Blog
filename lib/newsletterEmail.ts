import { siteConfig } from '@/site.config'
import { escapeHtml } from '@/lib/escapeHtml'

// The branded wrapper around a newsletter: your name at the top, the message, and a footer with the
// subscriber's own unsubscribe link (required by law in many countries, and by email providers).
export function newsletterHtml(subject: string, bodyHtml: string, unsubscribeUrl: string) {
  const site = siteConfig.url.replace(/^https?:\/\//, '')
  return `<!doctype html><html><body style="margin:0;background:#efeeea;font-family:-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;color:#111110">
  <div style="max-width:600px;margin:0 auto;padding:32px 20px">
    <p style="margin:0 0 24px;font-size:13px;letter-spacing:.08em;text-transform:uppercase;color:#5f5e59">${escapeHtml(siteConfig.name)}</p>
    <div style="background:#f7f6f3;border:1px solid #d6d4cd;padding:28px 24px;font-size:16px;line-height:1.6">
      <h1 style="margin:0 0 16px;font-size:24px;line-height:1.25">${escapeHtml(subject)}</h1>
      ${bodyHtml}
    </div>
    <p style="margin:24px 0 0;font-size:12px;line-height:1.6;color:#5f5e59">You're getting this because you subscribed at <a href="${siteConfig.url}" style="color:#5f5e59">${site}</a>.
      <a href="${unsubscribeUrl}" style="color:#5f5e59">Unsubscribe</a></p>
  </div></body></html>`
}
export const unsubscribeLink = (email: string, token: string) => `${siteConfig.url}/api/newsletter/unsubscribe?email=${encodeURIComponent(email)}&token=${encodeURIComponent(token)}`
