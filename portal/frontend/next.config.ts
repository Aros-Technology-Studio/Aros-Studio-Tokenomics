import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // Edge institutional portal — no source maps of secrets in browser
  poweredByHeader: false,
};

export default nextConfig;
