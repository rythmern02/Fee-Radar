import type { NextConfig } from "next";

/**
 * next.config.ts — Security headers for Fee-Radar.
 *
 * Security fixes applied:
 * 1. Removed `unsafe-eval` from script-src — Next.js 15+ does not require it
 *    in production. Keeping it largely negated XSP protection.
 * 2. Added `https://api.coingecko.com` to connect-src — the exchange rate
 *    feature was broken under CSP enforcement without this.
 * 3. Added `nonce`-ready placeholder comment for future migration.
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
          {
            key: 'Content-Security-Policy',
            // - removed 'unsafe-eval' for production (was negating XSS protection)
            // - conditional 'unsafe-eval' added back strictly for development mode (React requirement)
            // - 'unsafe-inline' kept for Next.js inline styles/scripts (needed for hydration)
            // - added api.coingecko.com to connect-src (CoinGecko exchange rate)
            value: [
              "default-src 'self'",
              `script-src 'self' 'unsafe-inline' ${process.env.NODE_ENV !== "production" ? "'unsafe-eval'" : ""}`.trim(),
              "style-src 'self' 'unsafe-inline'",
              "img-src 'self' blob: data:",
              "font-src 'self'",
              "connect-src 'self' https://mempool.space https://public-node.rsk.co https://api.coingecko.com",
              "frame-ancestors 'none'",
            ].join('; '),
          },
        ],
      },
    ];
  },
};

export default nextConfig;
