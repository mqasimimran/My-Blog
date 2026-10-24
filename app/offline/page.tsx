import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Offline', robots: { index: false } }

// Shown by the service worker (public/sw.js) when there's no internet connection.
export default function OfflinePage() {
  return (
    <main className="container-page flex min-h-[70dvh] flex-col justify-center pb-24 pt-12">
      <p className="type-meta">Offline · آف لائن</p>
      <h1 className="type-display mt-4 text-ink-900">You&rsquo;re offline</h1>
      <p className="type-lead mt-6 max-w-[48ch]">There&rsquo;s no internet connection right now. Check your connection and try again.</p>
      <p lang="ur" dir="rtl" className="type-lead mt-4 max-w-[48ch]">{'\u0627\u0633 \u0648\u0642\u062a \u0627\u0646\u0679\u0631\u0646\u06cc\u0679 \u06a9\u0646\u06cc\u06a9\u0634\u0646 \u0646\u06c1\u06cc\u06ba\u06d4 \u06a9\u0646\u06cc\u06a9\u0634\u0646 \u0686\u06cc\u06a9 \u06a9\u0631 \u06a9\u06d2 \u062f\u0648\u0628\u0627\u0631\u06c1 \u06a9\u0648\u0634\u0634 \u06a9\u0631\u06cc\u06ba\u06d4'}</p>
    </main>
  )
}
