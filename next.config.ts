import type { NextConfig } from 'next';
import createMDX from '@next/mdx';

const nextConfig: NextConfig = {
  pageExtensions: ['js', 'jsx', 'md', 'mdx', 'ts', 'tsx'],
  images: {
    remotePatterns: [
      {
        // Matches any Supabase project's storage URLs, e.g.
        // https://<project-ref>.supabase.co/storage/v1/object/public/...
        protocol: 'https',
        hostname: '*.supabase.co',
        pathname: '/storage/v1/object/public/**',
      },
    ],
  },
  async headers() {
    const noCache = [
      // Admin pages and admin/auth API responses must never be stored by
      // browsers, proxies or the CDN, and shouldn't be indexed.
      { key: 'Cache-Control', value: 'no-store, max-age=0' },
      { key: 'X-Robots-Tag', value: 'noindex, nofollow' },
    ]
    return [
      {
        source: '/:path*',
        headers: [
          // Prevents this site from being embedded in an <iframe> elsewhere
          // (clickjacking protection)
          { key: 'X-Frame-Options', value: 'DENY' },
          // Stops browsers from guessing content types in ways that can
          // enable certain XSS attacks
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          // Limits how much referrer info leaks to other sites when someone
          // clicks a link off this site
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          // Disables browser features this site has no legitimate use for
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=(), payment=(), usb=()' },
          // Forces HTTPS for a year, including subdomains, once a browser
          // has seen the site over HTTPS (stops downgrade attacks)
          { key: 'Strict-Transport-Security', value: 'max-age=31536000; includeSubDomains' },
          // A deliberately SAFE subset of Content-Security-Policy: blocks
          // plugin content, <base>-tag hijacking, forms posting to other
          // sites, and any framing. A full script-src policy isn't
          // practical here because AdSense and Next's own inline scripts
          // would force 'unsafe-inline', which defeats the point.
          { key: 'Content-Security-Policy', value: "object-src 'none'; base-uri 'self'; form-action 'self'; frame-ancestors 'none'" },
        ],
      },
      { source: '/admin/:path*', headers: noCache },
      { source: '/api/admin/:path*', headers: noCache },
      { source: '/api/auth/:path*', headers: noCache },
    ]
  },
};

const withMDX = createMDX({
  // Add markdown plugins here, as desired
});

export default withMDX(nextConfig);