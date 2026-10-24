// Invoice maths and formatting, shared by the admin editor, the PDF and the client's invoice page.
export type InvoiceItem = { description: string; quantity: number; unit_price: number }
export type Invoice = {
  id: string; number: string; client_name: string; client_email: string | null; client_address: string | null
  currency: 'USD' | 'PKR'; items: InvoiceItem[]; discount: number; tax_percent: number; notes: string | null
  status: 'draft' | 'sent' | 'paid' | 'cancelled'; issue_date: string; due_date: string | null; public_token: string
  sent_at: string | null; paid_at: string | null; created_at: string
}

const round2 = (n: number) => Math.round(n * 100) / 100

export function invoiceTotals(inv: Pick<Invoice, 'items' | 'discount' | 'tax_percent'>) {
  const subtotal = round2((inv.items || []).reduce((sum, i) => sum + (Number(i.quantity) || 0) * (Number(i.unit_price) || 0), 0))
  const discount = round2(Math.min(Math.max(Number(inv.discount) || 0, 0), subtotal))
  const tax = round2(((subtotal - discount) * (Number(inv.tax_percent) || 0)) / 100)
  return { subtotal, discount, tax, total: round2(subtotal - discount + tax) }
}

export function money(amount: number, currency: 'USD' | 'PKR') {
  return currency === 'PKR'
    ? `Rs ${Math.round(amount).toLocaleString('en-US')}`
    : `$${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

export const formatDate = (d: string | null) => (d ? new Date(d + (d.length === 10 ? 'T00:00:00' : '')).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : '')
