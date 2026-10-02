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
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
        ],
      },
    ]
  },
};

const withMDX = createMDX({
  // Add markdown plugins here, as desired
});

export default withMDX(nextConfig);