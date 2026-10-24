import { PDFDocument, PDFFont, PDFPage, StandardFonts, rgb } from 'pdf-lib'
import { siteConfig } from '@/site.config'
import { formatDate, invoiceTotals, money } from '@/lib/invoice'
import type { Proposal } from '@/lib/proposal'

// The proposal as a PDF; once accepted it includes the client's signature block.
const EXTRA = new Set(Array.from('\u2018\u2019\u201c\u201d\u2013\u2014\u2022\u2026\u20ac'))
const clean = (s: unknown) => String(s ?? '').normalize('NFKC').replace(/[ \t]+/g, ' ').split('').filter((c) => c === '\n' || c.charCodeAt(0) <= 255 || EXTRA.has(c)).join('').trim()
const hex = (h: string) => { const n = parseInt((/^#?([0-9a-f]{6})$/i.exec(h) || [, '111110'])[1]!, 16); return rgb(((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255) }

export async function renderProposalPdf(p: Proposal): Promise<Uint8Array> {
  const pdf = await PDFDocument.create()
  pdf.setTitle(`Proposal ${p.number}: ${clean(p.title)}`); pdf.setAuthor(siteConfig.name)
  const regular = await pdf.embedFont(StandardFonts.Helvetica), bold = await pdf.embedFont(StandardFonts.HelveticaBold)
  const INK = rgb(0.07, 0.07, 0.06), MUTED = rgb(0.4, 0.4, 0.38), LINE = rgb(0.84, 0.83, 0.8), ACCENT = hex(siteConfig.brand.accent)
  const W = 595.28, H = 841.89, M = 54
  let page: PDFPage = pdf.addPage([W, H]); let y = H - M
  const ensure = (need: number) => { if (y - need < M + 20) { page = pdf.addPage([W, H]); y = H - M } }
  const text = (s: unknown, x: number, yy: number, size = 10, font: PDFFont = regular, color = INK) => page.drawText(clean(s), { x, y: yy, size, font, color })
  const right = (s: unknown, xr: number, yy: number, size = 10, font: PDFFont = regular, color = INK) => { const t = clean(s); page.drawText(t, { x: xr - font.widthOfTextAtSize(t, size), y: yy, size, font, color }) }
  const wrap = (s: string, font: PDFFont, size: number, width: number) => clean(s).split('\n').flatMap((para) => {
    const out: string[] = []; let line = ''
    for (const w of para.split(' ')) { const t = line ? `${line} ${w}` : w; if (font.widthOfTextAtSize(t, size) > width && line) { out.push(line); line = w } else line = t }
    out.push(line); return out
  })
  const para = (s: string, size = 10, color = INK, indent = 0) => { for (const l of wrap(s, regular, size, W - 2 * M - indent)) { ensure(14); text(l, M + indent, y, size, regular, color); y -= size * 1.45 } }
  const heading = (s: string) => { ensure(36); y -= 10; text(s.toUpperCase(), M, y, 8.5, bold, ACCENT); y -= 16 }

  text(siteConfig.name, M, y - 20, 20, bold); right('PROPOSAL', W - M, y - 20, 20, bold, ACCENT); y -= 38
  text(siteConfig.email, M, y, 9.5, regular, MUTED); right(p.number, W - M, y, 11, bold); y -= 14
  text(siteConfig.url.replace(/^https?:\/\//, ''), M, y, 9.5, regular, MUTED); if (p.valid_until) right(`Valid until ${formatDate(p.valid_until)}`, W - M, y, 9.5, regular, MUTED); y -= 30
  text('PREPARED FOR', M, y, 8.5, bold, ACCENT); y -= 15; text(p.client_name, M, y, 11, bold); y -= 13
  if (p.client_email) { text(p.client_email, M, y, 9.5, regular, MUTED); y -= 13 }
  y -= 14
  for (const l of wrap(p.title, bold, 16, W - 2 * M)) { ensure(22); text(l, M, y, 16, bold); y -= 21 }
  if (p.summary) { y -= 4; para(p.summary, 10.5, MUTED) }
  if (p.scope) { heading("What's included"); for (const item of p.scope.split('\n').map((s) => s.trim()).filter(Boolean)) { ensure(14); text('\u2022', M + 2, y, 10); para(item.replace(/^[-*\u2022]\s*/, ''), 10, INK, 14) } }
  if (p.timeline) { heading('Timeline'); para(p.timeline) }

  heading('Investment')
  const t = invoiceTotals(p), cQty = W - M - 200, cUnit = W - M - 100, cAmt = W - M
  for (const it of p.items || []) {
    const lines = wrap(it.description || '', regular, 10, cQty - M - 60); ensure(lines.length * 13 + 8); const top = y
    lines.forEach((l, i) => text(l, M, top - i * 13, 10)); right(String(Number(it.quantity) || 0), cQty, top, 10); right(money(Number(it.unit_price) || 0, p.currency), cUnit, top, 10)
    right(money((Number(it.quantity) || 0) * (Number(it.unit_price) || 0), p.currency), cAmt, top, 10); y = top - lines.length * 13 - 6
    page.drawLine({ start: { x: M, y: y + 2 }, end: { x: W - M, y: y + 2 }, thickness: 0.4, color: LINE }); y -= 8
  }
  const row = (l: string, v: string, strong = false) => { ensure(18); right(l, cUnit, y, strong ? 11 : 10, strong ? bold : regular, strong ? INK : MUTED); right(v, cAmt, y, strong ? 11 : 10, strong ? bold : regular); y -= strong ? 18 : 15 }
  row('Subtotal', money(t.subtotal, p.currency)); if (t.discount) row('Discount', `-${money(t.discount, p.currency)}`); if (t.tax) row(`Tax (${Number(p.tax_percent)}%)`, money(t.tax, p.currency)); row('Total', money(t.total, p.currency), true)

  if (p.terms) { heading('Terms'); para(p.terms, 9.5, MUTED) }
  heading('Acceptance')
  if (p.status === 'accepted' && p.signed_name && p.accepted_at) {
    ensure(60); text('Accepted and signed electronically by', M, y, 9.5, regular, MUTED); y -= 18
    text(p.signed_name, M, y, 16, bold); y -= 16
    text(`on ${new Date(p.accepted_at).toUTCString()}`, M, y, 9.5, regular, MUTED); y -= 14
    text('The client typed their full name and agreed to the terms above on the proposal page.', M, y, 8.5, regular, MUTED)
  } else para(`To accept, open the proposal online: ${siteConfig.url.replace(/^https?:\/\//, '')}/proposal/${p.public_token}`, 9.5, MUTED)
  return pdf.save()
}
