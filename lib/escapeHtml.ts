// Visitor-supplied text (names, messages, transaction IDs) is interpolated
// into the HTML emails sent to you and to customers. Without escaping, a
// visitor could inject their own links or markup into an email that
// appears to come from your site (e.g. a fake "click to verify payment"
// button). Always wrap untrusted values in escapeHtml() inside templates.
export function escapeHtml(value: unknown): string {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

export const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

// Collapse CR/LF so a value can safely be used in a subject line.
export function oneLine(value: unknown, max = 200): string {
  return String(value ?? '').replace(/[\r\n]+/g, ' ').trim().slice(0, max)
}
