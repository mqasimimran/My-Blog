import { NextResponse, type NextRequest } from 'next/server'

// Urdu pages have their own addresses (/ur, /ur/blog, ...) so Google can find and show them.
// /ur/... is served by the same pages in Urdu (no duplicate files). Visitors who chose Urdu are sent
// from English addresses to the Urdu ones; search engines never carry that cookie, so they always see
// each language at its own address.
const SKIP = /^\/(admin|api|invoice|proposal|client|feedback|offline|opengraph-image|icon|apple-icon|icons|manifest|sitemap|robots|feed)(\/|\.|$)/

export function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl
  if (pathname === '/ur' || pathname.startsWith('/ur/')) {
    const rest = pathname.slice(3) || '/'
    if (SKIP.test(rest)) { const u = request.nextUrl.clone(); u.pathname = rest; return NextResponse.redirect(u) }
    const url = request.nextUrl.clone(); url.pathname = rest
    const headers = new Headers(request.headers); headers.set('x-locale', 'ur'); headers.set('x-pathname', rest)
    const res = NextResponse.rewrite(url, { request: { headers } })
    if (request.cookies.get('lang')?.value !== 'ur') res.cookies.set('lang', 'ur', { path: '/', maxAge: 31536000, sameSite: 'lax' })
    return res
  }
  if (SKIP.test(pathname)) return NextResponse.next()
  if (request.cookies.get('lang')?.value === 'ur' && request.method === 'GET') {
    const url = request.nextUrl.clone(); url.pathname = pathname === '/' ? '/ur' : `/ur${pathname}`; url.search = search
    return NextResponse.redirect(url, 307)
  }
  const headers = new Headers(request.headers); headers.set('x-locale', 'en'); headers.set('x-pathname', pathname)
  return NextResponse.next({ request: { headers } })
}

// Pages only: not Next's own files, images, fonts or other static files.
export const config = { matcher: ['/((?!_next/|.*\\.(?:png|jpe?g|gif|svg|webp|avif|ico|txt|xml|js|css|map|woff2?|ttf|pdf|mp4|webm|json)$).*)'] }
