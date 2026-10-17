import 'server-only'

export type MailResult = { ok: boolean; error?: string }

/** Sends one email through Resend. Never throws — callers decide what a failure means. */
export async function sendEmail(opts: { from: string; to: string[]; subject: string; html: string; replyTo?: string }): Promise<MailResult> {
  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) return { ok: false, error: 'RESEND_API_KEY is not set' }
  // RESEND_API_BASE exists only so automated tests can use a fake mail server.
  const base = process.env.RESEND_API_BASE || 'https://api.resend.com'
  try {
    const res = await fetch(`${base}/emails`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ from: opts.from, to: opts.to, subject: opts.subject, html: opts.html, ...(opts.replyTo ? { reply_to: opts.replyTo } : {}) }),
    })
    if (!res.ok) return { ok: false, error: await res.text() }
    return { ok: true }
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : 'Unknown email error' }
  }
}
