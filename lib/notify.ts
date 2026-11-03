import { sendEmail } from '@/lib/mail'
import { siteConfig } from '@/site.config'

// Alerts for you (the site owner): WhatsApp via CallMeBot (free, for personal alerts) and/or email.
// WhatsApp: message the CallMeBot bot once to get a key, then set WHATSAPP_PHONE (e.g. +923001234567)
// and CALLMEBOT_APIKEY. Alerts never block or break the request that triggered them.
export async function whatsappMe(text: string) {
  const phone = process.env.WHATSAPP_PHONE, key = process.env.CALLMEBOT_APIKEY
  if (!phone || !key) return false
  const base = process.env.CALLMEBOT_API_BASE || 'https://api.callmebot.com'
  try {
    const res = await fetch(`${base}/whatsapp.php?phone=${encodeURIComponent(phone)}&text=${encodeURIComponent(text.slice(0, 900))}&apikey=${encodeURIComponent(key)}`, { signal: AbortSignal.timeout(8000) })
    return res.ok
  } catch { return false }
}

export async function emailMe(subject: string, html: string) {
  const to = process.env.NOTIFY_TO_EMAIL
  if (!to || !process.env.RESEND_API_KEY) return false
  return (await sendEmail({ from: siteConfig.mail.contactFormFrom, to: [to], subject, html })).ok
}
