const securityHeaders = [
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'X-DNS-Prefetch-Control', value: 'on' },
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
  { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
  // Safe baseline CSP — restricts framing/object/base-uri without touching
  // script/style sources (so it won't break Next's inline runtime).
  {
    key: 'Content-Security-Policy',
    value: "frame-ancestors 'none'; object-src 'none'; base-uri 'self'",
  },
]

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Keep heavy Node-only parsers out of the bundle (they use fs/Buffer and
  // ship their own dynamic requires).
  experimental: {
    serverComponentsExternalPackages: ['pdf-parse', 'mammoth'],
  },
  async headers() {
    return [{ source: '/:path*', headers: securityHeaders }]
  },
}

export default nextConfig
