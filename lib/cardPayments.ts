import { createHmac, timingSafeEqual } from 'node:crypto'

// Card payments through Lemon Squeezy (merchant of record: it handles card processing and sales tax).
// Everything provider-specific is in this one file, so switching provider later means replacing it.
//   LEMONSQUEEZY_API_KEY         Settings -> API
//   LEMONSQUEEZY_STORE_ID        Settings -> Stores (the number)
//   LEMONSQUEEZY_WEBHOOK_SECRET  the signing secret you choose when adding the webhook
const API = process.env.LEMONSQUEEZY_API_URL || 'https://api.lemonsqueezy.com'
export const CARD_PROVIDER = 'lemonsqueezy'

export const cardEnabled = () =>
  Boolean(process.env.LEMONSQUEEZY_API_KEY && process.env.LEMONSQUEEZY_STORE_ID && process.env.LEMONSQUEEZY_WEBHOOK_SECRET)

/** Creates a hosted checkout at our price (so discount codes apply) and returns its URL. */
export async function createCardCheckout(o: {
  variantId: string; priceCents: number; orderId: string; orderNumber: string; email: string; name: string; redirectUrl: string
}): Promise<string> {
  const res = await fetch(`${API}/v1/checkouts`, {
    method: 'POST',
    headers: { Accept: 'application/vnd.api+json', 'Content-Type': 'application/vnd.api+json', Authorization: `Bearer ${process.env.LEMONSQUEEZY_API_KEY}` },
    body: JSON.stringify({
      data: {
        type: 'checkouts',
        attributes: {
          custom_price: o.priceCents,
          product_options: { redirect_url: o.redirectUrl },
          checkout_data: { email: o.email, name: o.name, custom: { order_id: o.orderId, order_number: o.orderNumber } },
        },
        relationships: {
          store: { data: { type: 'stores', id: String(process.env.LEMONSQUEEZY_STORE_ID) } },
          variant: { data: { type: 'variants', id: String(o.variantId) } },
        },
      },
    }),
  })
  if (!res.ok) throw new Error(`Lemon Squeezy ${res.status}: ${(await res.text()).slice(0, 300)}`)
  const url = (await res.json())?.data?.attributes?.url
  if (typeof url !== 'string' || !url.startsWith('https://')) throw new Error('Lemon Squeezy returned no checkout URL')
  return url
}

/** True only if the webhook was signed with our secret (HMAC-SHA256 of the raw body, in X-Signature). */
export function verifyCardWebhook(rawBody: string, signature: string | null): boolean {
  const secret = process.env.LEMONSQUEEZY_WEBHOOK_SECRET
  if (!secret || !signature) return false
  const expected = Buffer.from(createHmac('sha256', secret).update(rawBody).digest('hex'), 'utf8')
  const given = Buffer.from(signature, 'utf8')
  return expected.length === given.length && timingSafeEqual(expected, given)
}

export type CardEvent = { kind: 'paid' | 'refunded' | 'ignore'; orderId?: string; providerOrderId?: string; reference?: string }

export function readCardWebhook(body: any): CardEvent {
  const event = body?.meta?.event_name
  const orderId = body?.meta?.custom_data?.order_id
  const attrs = body?.data?.attributes || {}
  const base = { orderId: typeof orderId === 'string' ? orderId : undefined, providerOrderId: body?.data?.id ? String(body.data.id) : undefined, reference: attrs.identifier || attrs.order_number?.toString() }
  if (event === 'order_created' && attrs.status === 'paid') return { kind: 'paid', ...base }
  if (event === 'order_refunded') return { kind: 'refunded', ...base }
  return { kind: 'ignore', ...base }
}
