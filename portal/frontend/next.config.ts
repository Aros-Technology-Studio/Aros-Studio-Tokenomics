import type { NextConfig } from 'next';
import path from 'path';

/** Internal URL of portal Nest edge (server-side rewrite target). */
const edgeUrl = (
  process.env.PORTAL_EDGE_URL ??
  process.env.NEXT_PUBLIC_PORTAL_API_URL ??
  'http://127.0.0.1:3100'
).replace(/\/$/, '');

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  output: 'standalone',
  outputFileTracingRoot: path.join(__dirname),
  // Home / tunnel: browser calls same origin /v1/* → edge BFF
  async rewrites() {
    return [
      {
        source: '/v1/:path*',
        destination: `${edgeUrl}/v1/:path*`,
      },
    ];
  },
};

export default nextConfig;
