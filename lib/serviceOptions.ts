// Options customers pick on a service page, and the price estimate they produce. The same functions
// run in the browser (live estimate) and on the server (the saved request is re-priced there, so a
// tampered browser can't change the numbers).
export type Choice = { label: string; price?: number; percent?: number }
export type ServiceOption =
  | { id: string; type: 'addon'; label: string; price: number; note?: string }
  | { id: string; type: 'quantity'; label: string; unitPrice: number; min: number; max: number; default: number; unit?: string }
  | { id: string; type: 'choice'; label: string; choices: Choice[] }
  | { id: string; type: 'question'; label: string; required?: boolean }
export type Selection = Record<string, boolean | number | string>
export type LineItem = { description: string; quantity: number; unit_price: number }

/** "$1,200", "Rs 50,000", "From 300" -> 1200 / 50000 / 300 (first number in the text). */
export const parsePrice = (text: string | null | undefined) => Number(String(text || '').replace(/,/g, '').match(/\d+(\.\d+)?/)?.[0] || 0)

export function estimate(basePrice: number, baseLabel: string, options: ServiceOption[], sel: Selection): { items: LineItem[]; total: number; answers: string[] } {
  const items: LineItem[] = basePrice > 0 ? [{ description: baseLabel, quantity: 1, unit_price: basePrice }] : []
  const answers: string[] = []
  let percent = 0
  for (const o of options) {
    const v = sel[o.id]
    if (o.type === 'addon' && v === true && o.price > 0) items.push({ description: o.label, quantity: 1, unit_price: o.price })
    if (o.type === 'quantity') {
      const n = Math.min(o.max, Math.max(o.min, Math.round(Number(v ?? o.default) || 0)))
      const extra = n - o.default
      if (extra > 0 && o.unitPrice > 0) items.push({ description: `${o.label}: ${extra} extra${o.unit ? ' ' + o.unit : ''}`, quantity: extra, unit_price: o.unitPrice })
    }
    if (o.type === 'choice') {
      const c = o.choices[Number(v ?? 0)] || o.choices[0]
      if (c?.price) items.push({ description: `${o.label}: ${c.label}`, quantity: 1, unit_price: c.price })
      if (c?.percent) percent += c.percent
    }
    if (o.type === 'question' && typeof v === 'string' && v.trim()) answers.push(`${o.label}: ${v.trim().slice(0, 500)}`)
  }
  const sub = items.reduce((s, i) => s + i.quantity * i.unit_price, 0)
  if (percent) items.push({ description: `Adjustments (${percent > 0 ? '+' : ''}${percent}%)`, quantity: 1, unit_price: Math.round(sub * percent) / 100 })
  return { items, total: Math.round(items.reduce((s, i) => s + i.quantity * i.unit_price, 0) * 100) / 100, answers }
}

/** Keeps only well-formed options (used when saving from admin and when reading from the database). */
export function cleanOptions(raw: unknown): ServiceOption[] {
  if (!Array.isArray(raw)) return []
  return raw.slice(0, 30).flatMap((o: Record<string, unknown> | null): ServiceOption[] => {
    const id = String(o?.id || '').slice(0, 40), label = String(o?.label || '').trim().slice(0, 120)
    if (!o || !id || !label) return []
    if (o.type === 'addon') return [{ id, type: 'addon', label, price: Math.max(0, Number(o.price) || 0), ...(o.note ? { note: String(o.note).slice(0, 160) } : {}) }]
    if (o.type === 'quantity') { const min = Math.max(0, Math.round(Number(o.min) || 0)), max = Math.max(min, Math.round(Number(o.max) || min)); return [{ id, type: 'quantity', label, unitPrice: Math.max(0, Number(o.unitPrice) || 0), min, max, default: Math.min(max, Math.max(min, Math.round(Number(o.default) || min))), ...(o.unit ? { unit: String(o.unit).slice(0, 30) } : {}) }] }
    if (o.type === 'choice') { const choices = (Array.isArray(o.choices) ? o.choices : []).slice(0, 10).map((c: Partial<Choice> | null) => ({ label: String(c?.label || '').slice(0, 80), ...(Number(c?.price) ? { price: Number(c?.price) } : {}), ...(Number(c?.percent) ? { percent: Number(c?.percent) } : {}) })).filter((c: Choice) => c.label); return choices.length ? [{ id, type: 'choice', label, choices }] : [] }
    if (o.type === 'question') return [{ id, type: 'question', label, required: !!o.required }]
    return []
  })
}
