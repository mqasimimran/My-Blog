import { NextResponse } from 'next/server'
import { PDFDocument, PDFFont, PDFPage, StandardFonts, rgb } from 'pdf-lib'
import { createClient } from '@supabase/supabase-js'
import { siteConfig } from '@/site.config'

// The "Download CV" PDF, built live from the resume data in the admin (Resume Manager), so the site
// and the PDF never drift apart. Cached for 5 minutes.
export const revalidate = 300

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)

// The built-in PDF fonts only cover Western characters. Anything else is dropped instead of crashing.
const EXTRA = new Set(Array.from('\u2018\u2019\u201c\u201d\u2013\u2014\u2022\u2026\u20ac\u2122'))
const clean = (s: unknown) =>
  String(s ?? '')
    .normalize('NFKC')
    .replace(/[\u2010-\u2012]/g, '-')
    .replace(/\s+/g, ' ')
    .split('')
    .filter((ch) => ch.charCodeAt(0) <= 255 || EXTRA.has(ch))
    .join('')
    .trim()

const hex = (h: string) => {
  const m = /^#?([0-9a-f]{6})$/i.exec(h)
  const n = m ? parseInt(m[1], 16) : 0x111110
  return rgb(((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255)
}

export async function GET() {
  const [exp, proj, edu, certs] = await Promise.all([
    supabase.from('experiences').select('*').order('order_index', { ascending: true }),
    supabase.from('projects_resume').select('*').order('order_index', { ascending: true }),
    supabase.from('education').select('*').order('order_index', { ascending: true }),
    supabase.from('certifications').select('*').order('order_index', { ascending: true }),
  ])

  const pdf = await PDFDocument.create()
  pdf.setTitle(`${siteConfig.name} - CV`)
  pdf.setAuthor(siteConfig.name)
  const regular = await pdf.embedFont(StandardFonts.Helvetica)
  const bold = await pdf.embedFont(StandardFonts.HelveticaBold)
  const INK = rgb(0.07, 0.07, 0.06), MUTED = rgb(0.4, 0.4, 0.38), LINE = rgb(0.84, 0.83, 0.8), ACCENT = hex(siteConfig.brand.accent)

  const W = 595.28, H = 841.89, M = 54
  let page: PDFPage = pdf.addPage([W, H])
  let y = H - M

  const ensure = (needed: number) => {
    if (y - needed < M) {
      page = pdf.addPage([W, H])
      y = H - M
    }
  }
  const wrap = (text: string, font: PDFFont, size: number, width: number) => {
    const lines: string[] = []
    let line = ''
    for (const word of text.split(' ')) {
      const test = line ? `${line} ${word}` : word
      if (font.widthOfTextAtSize(test, size) > width && line) {
        lines.push(line)
        line = word
      } else line = test
    }
    if (line) lines.push(line)
    return lines
  }
  const para = (raw: unknown, opts: { font?: PDFFont; size?: number; color?: ReturnType<typeof rgb>; gap?: number } = {}) => {
    const text = clean(raw)
    if (!text) return
    const font = opts.font ?? regular, size = opts.size ?? 10, lh = size * 1.45
    for (const line of wrap(text, font, size, W - 2 * M)) {
      ensure(lh)
      page.drawText(line, { x: M, y: y - size, size, font, color: opts.color ?? INK })
      y -= lh
    }
    y -= opts.gap ?? 0
  }
  // A title on the left with a date on the right, on one line.
  const row = (left: unknown, right: unknown) => {
    const l = clean(left), r = clean(right), size = 11
    ensure(size * 1.6)
    const rw = r ? regular.widthOfTextAtSize(r, 9) : 0
    const lines = wrap(l, bold, size, W - 2 * M - rw - 16)
    page.drawText(lines[0] || '', { x: M, y: y - size, size, font: bold, color: INK })
    if (r) page.drawText(r, { x: W - M - rw, y: y - size + 1, size: 9, font: regular, color: MUTED })
    y -= size * 1.5
    for (const extra of lines.slice(1)) {
      ensure(size * 1.5)
      page.drawText(extra, { x: M, y: y - size, size, font: bold, color: INK })
      y -= size * 1.5
    }
  }
  const section = (title: string) => {
    ensure(48)
    y -= 14
    page.drawText(title.toUpperCase(), { x: M, y: y - 9, size: 9, font: bold, color: ACCENT })
    y -= 16
    page.drawLine({ start: { x: M, y }, end: { x: W - M, y }, thickness: 0.6, color: LINE })
    y -= 12
  }

  // Header
  page.drawText(clean(siteConfig.name), { x: M, y: y - 26, size: 26, font: bold, color: INK })
  y -= 36
  para(siteConfig.jobTitle, { size: 12, color: MUTED, gap: 4 })
  const host = (u: string) => u.replace(/^https?:\/\//, '').replace(/^www\./, '').replace(/\/$/, '')
  para([siteConfig.email, siteConfig.resume.phone, siteConfig.location].filter(Boolean).join('  \u00b7  '), { size: 9.5, color: MUTED })
  para([host(siteConfig.url), host(siteConfig.social.linkedin), host(siteConfig.social.github)].filter(Boolean).join('  \u00b7  '), { size: 9.5, color: MUTED, gap: 2 })

  if (exp.data?.length) {
    section('Experience')
    for (const e of exp.data) {
      row([e.role, e.company].filter(Boolean).join(', '), e.period)
      para(e.description, { color: MUTED, gap: 8 })
    }
  }
  if (proj.data?.length) {
    section('Projects')
    for (const p of proj.data) {
      row(p.title, p.tech)
      para(p.description, { color: MUTED, gap: 8 })
    }
  }
  if (edu.data?.length) {
    section('Education')
    for (const e of edu.data) {
      row(e.degree, e.period)
      para(e.institution, { size: 10, color: INK })
      para(e.description, { color: MUTED, gap: 8 })
    }
  }
  if (certs.data?.length) {
    section('Licenses and certifications')
    for (const c of certs.data) {
      row(c.title, c.date)
      para(c.issuer, { color: MUTED, gap: 4 })
    }
  }

  // A small note on the last page: where the always-current version lives.
  const note = clean(`Always up to date at ${host(siteConfig.url)}/resume`)
  page.drawText(note, { x: M, y: M - 22, size: 8, font: regular, color: MUTED })

  const bytes = await pdf.save()
  const file = `${siteConfig.name.replace(/\s+/g, '_')}_Resume.pdf`
  return new NextResponse(Buffer.from(bytes), {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `inline; filename="${file}"`,
      'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
    },
  })
}
