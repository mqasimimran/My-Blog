import { supabaseAdmin } from '@/lib/supabaseAdmin'
import { invoiceTotals, type Invoice } from '@/lib/invoice'

// What needs you right now, and this month's numbers. Shared by the admin overview and the Monday email.
// Each count falls back to 0 if its table doesn't exist yet.
async function count(table: string, apply: (q: any) => any = (q) => q) {
  try { const { count: n, error } = await apply(supabaseAdmin.from(table).select('id', { count: 'exact', head: true })); return error ? 0 : n || 0 } catch { return 0 }
}
async function rows<T>(table: string, cols: string, apply: (q: any) => any = (q) => q): Promise<T[]> {
  try { const { data, error } = await apply(supabaseAdmin.from(table).select(cols)); return error ? [] : (data as T[]) || [] } catch { return [] }
}

export async function getOverview() {
  const now = new Date(), today = now.toISOString().slice(0, 10)
  const monthStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1)).toISOString()
  const [newLeads, followUps, unread, ordersToVerify, commentsPending, feedbackOpen, proposalsWaiting, subscribers, newSubscribers, invoices, paidOrders] = await Promise.all([
    count('messages', (q) => q.eq('stage', 'new')),
    count('messages', (q) => q.lte('follow_up', today).not('stage', 'in', '(won,lost)')),
    count('messages', (q) => q.eq('is_read', false)),
    count('orders', (q) => q.eq('status', 'pending_verification')),
    count('post_comments', (q) => q.eq('status', 'pending')),
    count('feedback_comments', (q) => q.eq('from_owner', false).eq('resolved', false)),
    count('proposals', (q) => q.eq('status', 'sent')),
    count('newsletter_subscribers'),
    count('newsletter_subscribers', (q) => q.gte('created_at', monthStart)),
    rows<Invoice>('invoices', '*', (q) => q.in('status', ['sent', 'paid'])),
    rows<{ product_price: number }>('orders', 'product_price', (q) => q.eq('status', 'paid').gte('created_at', monthStart)),
  ])
  const income = { USD: paidOrders.reduce((s, o) => s + (Number(o.product_price) || 0), 0), PKR: 0 }
  const unpaid = { USD: 0, PKR: 0, count: 0, overdue: 0 }
  for (const inv of invoices) {
    const t = invoiceTotals(inv).total
    if (inv.status === 'paid') { if ((inv.paid_at || '') >= monthStart) income[inv.currency] += t }
    else { unpaid[inv.currency] += t; unpaid.count++; if (inv.due_date && inv.due_date < today) unpaid.overdue++ }
  }
  const r2 = (n: number) => Math.round(n * 100) / 100
  return {
    needs: { newLeads, followUps, unread, ordersToVerify, commentsPending, feedbackOpen, proposalsWaiting, overdueInvoices: unpaid.overdue },
    month: { income: { USD: r2(income.USD), PKR: r2(income.PKR) }, unpaid: { USD: r2(unpaid.USD), PKR: r2(unpaid.PKR), count: unpaid.count }, subscribers, newSubscribers },
  }
}
