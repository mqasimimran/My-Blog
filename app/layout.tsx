import './globals.css'
import Navbar from './Navbar'
import Script from 'next/script'

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        {/* Google AdSense Verification Script */}
        <Script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-XXXXXXXXXXXXXXXX"
          crossOrigin="anonymous"
          strategy="afterInteractive"
        />
      </head>
      <body className="bg-gray-50 text-gray-900 font-sans antialiased" suppressHydrationWarning>
        
        <Navbar />

        <main className="min-h-screen">
          {children}
        </main>

        <footer className="p-8 bg-gray-900 text-white text-center text-sm">
          <p>Muhammad Qasim Imran. All rights reserved.</p>
        </footer>
        
      </body>
    </html>
  )
}