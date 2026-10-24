import { PDFDocument, PDFFont, PDFPage, StandardFonts, rgb } from 'pdf-lib'
import { siteConfig } from '@/site.config'
import { formatDate, invoiceTotals, money, type Invoice } from '@/lib/invoice'

// A clean A4 invoice. Built-in PDF fonts cover Western characters; anything else is dropped rather
// than breaking the PDF (same approach as the CV).
const EXTRA = new Set(Array.from('\u2018\u2019\u201c\u201d\u2013\u2014\u2022\u2026\u20ac'))
const clean = (s: unknown) => String(s ?? '').normalize('NFKC').replace(/\s+/g, ' ').split('').filter((c) => c.charCodeAt(0) <= 255 || EXTRA.has(c)).join('').trim()
const hex = (h: string) => { const n = parseInt((/^#?([0-9a-f]{6})$/i.exec(h) || [, '111110'])[1]!, 16); return rgb(((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255) }

export async function renderInvoicePdf(inv: Invoice, payments: { method: string; lines: string[] }[]): Promise<Uint8Array> {
  const pdf = await PDFDocument.create()
  pdf.setTitle(`Invoice ${inv.number}`)
  pdf.setAuthor(siteConfig.name)
  const regular = await pdf.embedFont(StandardFonts.Helvetica)
  const bold = await pdf.embedFont(StandardFonts.HelveticaBold)
  const INK = rgb(0.07, 0.07, 0.06), MUTED = rgb(0.4, 0.4, 0.38), LINE = rgb(0.84, 0.83, 0.8), ACCENT = hex(siteConfig.brand.accent)
  const W = 595.28, H = 841.89, M = 54
  let page: PDFPage = pdf.addPage([W, H])
  let y = H - M
  const ensure = (need: number) => { if (y - need < M + 20) { page = pdf.addPage([W, H]); y = H - M } }
  const text = (s: unknown, x: number, yy: number, size = 10, font: PDFFont = regular, color = INK) => page.drawText(clean(s), { x, y: yy, size, font, color })
  const right = (s: unknown, xr: number, yy: number, size = 10, font: PDFFont = regular, color = INK) => { const t = clean(s); page.drawText(t, { x: xr - font.widthOfTextAtSize(t, size), y: yy, size, font, color }) }
  const wrap = (s: string, font: PDFFont, size: number, width: number) => {
    const out: string[] = []; let line = ''
    for (const w of clean(s).split(' ')) { const t = line ? `${line} ${w}` : w; if (font.widthOfTextAtSize(t, size) > width && line) { out.push(line); line = w } else line = t }
    if (line) out.push(line); return out
  }
  const totals = invoiceTotals(inv)

  // Header: who it's from, and the invoice details
  text(siteConfig.name, M, y - 20, 20, bold); text('INVOICE', W - M - bold.widthOfTextAtSize('INVOICE', 20), y - 20, 20, bold, ACCENT)
  y -= 38
  text(siteConfig.jobTitle, M, y, 10, regular, MUTED); right(inv.number, W - M, y, 11, bold)
  y -= 14
  text(siteConfig.email, M, y, 9.5, regular, MUTED); right(`Issued ${formatDate(inv.issue_date)}`, W - M, y, 9.5, regular, MUTED)
  y -= 13
  text(siteConfig.url.replace(/^https?:\/\//, ''), M, y, 9.5, regular, MUTED); if (inv.due_date) right(`Due ${formatDate(inv.due_date)}`, W - M, y, 9.5, bold)
  y -= 30

  // Bill to
  text('BILL TO', M, y, 8.5, bold, ACCENT); y -= 15
  text(inv.client_name, M, y, 11, bold); y -= 14
  for (const line of [inv.client_email, ...(inv.client_address || '').split(/\n/)].filter(Boolean)) { text(line, M, y, 9.5, regular, MUTED); y -= 13 }
  y -= 16

  // Items
  const cQty = W - M - 200, cUnit = W - M - 100, cAmt = W - M
  page.drawLine({ start: { x: M, y }, end: { x: W - M, y }, thickness: 0.8, color: INK }); y -= 15
  text('DESCRIPTION', M, y, 8.5, bold, MUTED); right('QTY', cQty, y, 8.5, bold, MUTED); right('UNIT PRICE', cUnit, y, 8.5, bold, MUTED); right('AMOUNT', cAmt, y, 8.5, bold, MUTED)
  y -= 10; page.drawLine({ start: { x: M, y }, end: { x: W - M, y }, thickness: 0.5, color: LINE }); y -= 16
  for (const it of inv.items || []) {
    const lines = wrap(it.description || '', regular, 10, cQty - M - 60)
    ensure(lines.length * 13 + 12)
    const top = y
    lines.forEach((l, i) => text(l, M, top - i * 13, 10))
    right(String(Number(it.quantity) || 0), cQty, top, 10); right(money(Number(it.unit_price) || 0, inv.currency), cUnit, top, 10)
    right(money((Number(it.quantity) || 0) * (Number(it.unit_price) || 0), inv.currency), cAmt, top, 10)
    y = top - lines.length * 13 - 8
    page.drawLine({ start: { x: M, y: y + 3 }, end: { x: W - M, y: y + 3 }, thickness: 0.4, color: LINE }); y -= 10
  }

  // Totals
  ensure(90)
  const row = (label: string, value: string, strong = false) => { right(label, cUnit, y, strong ? 11 : 10, strong ? bold : regular, strong ? INK : MUTED); right(value, cAmt, y, strong ? 11 : 10, strong ? bold : regular); y -= strong ? 18 : 15 }
  row('Subtotal', money(totals.subtotal, inv.currency))
  if (totals.discount) row('Discount', `-${money(totals.discount, inv.currency)}`)
  if (totals.tax) row(`Tax (${Number(inv.tax_percent)}%)`, money(totals.tax, inv.currency))
  page.drawLine({ start: { x: cUnit - 80, y: y + 8 }, end: { x: W - M, y: y + 8 }, thickness: 0.8, color: INK }); y -= 4
  row('Total due', money(totals.total, inv.currency), true)
  if (inv.status === 'paid') { right(`PAID${inv.paid_at ? ' ' + formatDate(inv.paid_at.slice(0, 10)) : ''}`, cAmt, y, 11, bold, rgb(0.12, 0.5, 0.3)); y -= 18 }
  y -= 14

  // How to pay + notes
  if (payments.length && inv.status !== 'paid') {
    ensure(40 + payments.length * 28)
    text('HOW TO PAY', M, y, 8.5, bold, ACCENT); y -= 15
    text(`Please include ${inv.number} as the payment reference.`, M, y, 9.5, regular, MUTED); y -= 16
    for (const p of payments) { ensure(30); text(p.method, M, y, 10, bold); y -= 13; for (const l of p.lines) { text(l, M + 10, y, 9.5, regular, MUTED); y -= 12 } y -= 6 }
    y -= 8
  }
  if (inv.notes) {
    ensure(40); text('NOTES', M, y, 8.5, bold, ACCENT); y -= 15
    for (const l of wrap(inv.notes, regular, 9.5, W - 2 * M)) { ensure(14); text(l, M, y, 9.5, regular, MUTED); y -= 13 }
  }
  text(`View this invoice online: ${siteConfig.url.replace(/^https?:\/\//, '')}/invoice/${inv.public_token}`, M, M - 22, 8, regular, MUTED)
  return pdf.save()
}
