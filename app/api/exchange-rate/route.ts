import { NextResponse } from 'next/server'

// A small, cached wrapper around a free, keyless exchange rate API
// (open.er-api.com — no signup, updates daily). Cached for an hour so
// checkout page loads don't hammer the external API, and falls back to a
// hardcoded approximate rate if the external service is ever unreachable,
// so checkout never breaks over this.
const FALLBACK_USD_TO_PKR = 280 // update occasionally if this drifts a lot

export const revalidate = 3600 // 1 hour

export async function GET() {
  try {
    const res = await fetch('https://open.er-api.com/v6/latest/USD', {
      next: { revalidate: 3600 },
    })

    if (!res.ok) throw new Error('Exchange rate API returned a non-OK status')

    const data = await res.json()
    const rate = data?.rates?.PKR

    if (typeof rate !== 'number' || rate <= 0) throw new Error('Invalid rate in response')

    return NextResponse.json({ usdToPkr: rate, source: 'live' })
  } catch (error) {
    console.warn('Exchange rate fetch failed, using fallback:', error)
    return NextResponse.json({ usdToPkr: FALLBACK_USD_TO_PKR, source: 'fallback' })
  }
}
