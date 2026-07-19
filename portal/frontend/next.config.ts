import type { NextConfig } from 'next';
import path from 'path';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // Edge institutional portal — no source maps of secrets in browser
  poweredByHeader: false,
  // Production container: minimal image via Next standalone output
  output: 'standalone',
  // Keep standalone root at this package (not monorepo root)
  outputFileTracingRoot: path.join(__dirname),
};

export default nextConfig;
