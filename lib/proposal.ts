// Proposals: types and the default terms (an editable starting point, not legal advice).
import type { InvoiceItem } from '@/lib/invoice'
export type Proposal = {
  id: string; number: string; client_name: string; client_email: string | null; title: string; summary: string | null; scope: string | null
  timeline: string | null; currency: 'USD' | 'PKR'; items: InvoiceItem[]; discount: number; tax_percent: number; terms: string | null
  valid_until: string | null; status: 'draft' | 'sent' | 'accepted' | 'declined'; public_token: string; sent_at: string | null
  accepted_at: string | null; signed_name: string | null; decline_reason: string | null; invoice_id: string | null; lead_id: string | null; created_at: string
}

export const DEFAULT_TERMS = `1. Scope. The work covers what is listed under "What's included". Anything else is quoted separately before it starts.
2. Payment. An invoice is issued when this proposal is accepted and is due within 14 days, unless we agree otherwise in writing.
3. Revisions. Up to two rounds of revisions are included. Further changes are billed at an agreed rate.
4. Timeline. Dates depend on receiving feedback and materials on time. Delays on either side move the timeline.
5. Ownership. Once paid in full, you own the final deliverables. I may show the work in my portfolio unless you ask me not to.
6. Cancellation. Either of us can cancel in writing. Work completed up to that point is paid for.`
