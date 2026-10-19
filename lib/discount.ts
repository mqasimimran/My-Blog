// One place that turns a discount code into money, used by the checkout preview and the order itself.
export type DiscountKind = 'percent' | 'amount'

export function computeDiscount(price: number, kind: DiscountKind, value: number) {
  const raw = kind === 'percent' ? (price * value) / 100 : value
  const amount = Math.round(Math.min(Math.max(raw, 0), price) * 100) / 100
  return { amount, total: Math.round((price - amount) * 100) / 100 }
}

export const discountLabel = (kind: DiscountKind, value: number) => (kind === 'percent' ? `${value}% off` : `$${value} off`)
