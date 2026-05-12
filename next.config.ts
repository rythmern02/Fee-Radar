import type { NextConfig } from "next";

/**
 * next.config.ts — Static security headers for Fee-Radar.
 *
 * NOTE: Content-Security-Policy is intentionally NOT defined here. It is set
 * per-request by middleware.ts so that script-src can use a fresh nonce on
 * every response (eliminates the prior `'unsafe-inline'` allowance). All other
 * security headers are static and live here.
 */
const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Strict-Transport-Security', value: 'max-age=31536000; includeSubDomains' },
        ],
      },
    ];
  },
};

export default nextConfig;
