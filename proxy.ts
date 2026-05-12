import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * proxy.ts — Per-request CSP nonce.
 *
 * (Renamed from middleware.ts: Next.js 16 deprecated the "middleware" name
 *  in favor of "proxy". Same runtime behavior, no functional change.)
 *
 * VULN MED follow-up: Replaces the static script-src `'unsafe-inline'` policy
 * with a per-request nonce + `'strict-dynamic'`. Next.js auto-applies the nonce
 * to its hydration scripts by reading the `x-nonce` request header.
 *
 * style-src still uses `'unsafe-inline'` — Next.js does not yet support nonces
 * for inline <style> elements (tracked upstream). This is a documented
 * limitation, not a regression.
 */
export function proxy(request: NextRequest) {
  const nonce = Buffer.from(crypto.randomUUID()).toString('base64');
  const isDev = process.env.NODE_ENV !== 'production';

  const csp = [
    "default-src 'self'",
    `script-src 'self' 'nonce-${nonce}' 'strict-dynamic'${isDev ? " 'unsafe-eval'" : ''}`,
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' blob: data:",
    "font-src 'self'",
    "connect-src 'self' https://mempool.space https://public-node.rsk.co https://api.coingecko.com",
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "object-src 'none'",
  ].join('; ');

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-nonce', nonce);
  requestHeaders.set('Content-Security-Policy', csp);

  const response = NextResponse.next({ request: { headers: requestHeaders } });
  response.headers.set('Content-Security-Policy', csp);
  return response;
}

export const config = {
  matcher: [
    {
      source: '/((?!api|_next/static|_next/image|favicon.ico).*)',
      missing: [
        { type: 'header', key: 'next-router-prefetch' },
        { type: 'header', key: 'purpose', value: 'prefetch' },
      ],
    },
  ],
};
