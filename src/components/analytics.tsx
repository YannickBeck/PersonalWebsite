'use client';

import Script from 'next/script';

/**
 * Datensparsames Analytics (Cloudflare Web Analytics, cookiefrei).
 * Aktiv nur mit NEXT_PUBLIC_CF_BEACON_TOKEN — sonst No-Op.
 */
export function Analytics() {
  const token = process.env.NEXT_PUBLIC_CF_BEACON_TOKEN;
  if (!token) {
    return null;
  }
  return (
    <Script
      defer
      src="https://static.cloudflareinsights.com/beacon.min.js"
      data-cf-beacon={`{"token": "${token}"}`}
      strategy="afterInteractive"
    />
  );
}
