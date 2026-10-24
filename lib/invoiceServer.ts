import { supabaseAdmin } from '@/lib/supabaseAdmin'
import { siteConfig } from '@/site.config'
import type { Invoice } from '@/lib/invoice'

export async function getInvoiceById(id: string) {
  const { data } = await supabaseAdmin.from('invoices').select('*').eq('id', id).maybeSingle()
  return data as Invoice | null
}
export async function getInvoiceByToken(token: string) {
  if (!/^[a-f0-9]{16,64}$/.test(token)) return null
  const { data } = await supabaseAdmin.from('invoices').select('*').eq('public_token', token).neq('status', 'cancelled').maybeSingle()
  return data as Invoice | null
}

/** The ways to pay, from Admin -> Site settings (only the ones filled in). */
export async function getPaymentLines(currency: 'USD' | 'PKR'): Promise<{ method: string; lines: string[] }[]> {
  const { data: s } = await supabaseAdmin.from('site_settings').select('*').eq('id', 1).maybeSingle()
  if (!s) return []
  const out: { method: string; lines: string[] }[] = []
  const has = (id: string) => siteConfig.payments.manualMethods.some((m) => m.id === id)
  if (has('bank_transfer') && s.bank_account_number) out.push({ method: 'Bank transfer', lines: [s.bank_name, s.bank_account_title && `Account title: ${s.bank_account_title}`, `Account number: ${s.bank_account_number}`, s.bank_iban && `IBAN: ${s.bank_iban}`].filter(Boolean) })
  if (has('jazzcash') && s.jazzcash_number) out.push({ method: 'JazzCash', lines: [`${s.jazzcash_number}${s.jazzcash_account_name ? ` (${s.jazzcash_account_name})` : ''}`] })
  if (has('easypaisa') && s.easypaisa_number) out.push({ method: 'EasyPaisa', lines: [`${s.easypaisa_number}${s.easypaisa_account_name ? ` (${s.easypaisa_account_name})` : ''}`] })
  if (has('payoneer') && s.payoneer_email) out.push({ method: 'Payoneer', lines: [`Pay a Payoneer user: ${s.payoneer_email}`] })
  // Local wallets only make sense for rupee invoices; put international options first for dollar invoices.
  return currency === 'USD' ? [...out.filter((o) => o.method === 'Payoneer' || o.method === 'Bank transfer'), ...out.filter((o) => o.method !== 'Payoneer' && o.method !== 'Bank transfer')] : out
}

/** The next number in a yearly series, e.g. nextNumber('invoices', 'INV') -> INV-2026-004. */
export async function nextNumber(table: 'invoices' | 'proposals', code: 'INV' | 'PRO') {
  const prefix = `${code}-${new Date().getFullYear()}-`
  const { data } = await supabaseAdmin.from(table).select('number').like('number', `${prefix}%`)
  const max = (data || []).reduce((m, r) => Math.max(m, parseInt(String(r.number).slice(prefix.length), 10) || 0), 0)
  return `${prefix}${String(max + 1).padStart(3, '0')}`
}

export async function getProposalByToken(token: string) {
  if (!/^[a-f0-9]{16,64}$/.test(token)) return null
  const { data } = await supabaseAdmin.from('proposals').select('*').eq('public_token', token).neq('status', 'draft').maybeSingle()
  return data as import('@/lib/proposal').Proposal | null
}
