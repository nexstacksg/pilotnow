import type { NextConfig } from 'next';

function resolveApiRewriteUrl() {
  const candidates = [
    process.env.PILOTNOW_WEB_API_URL,
    process.env.PILOTNOW_API_URL,
    process.env.NEXT_PUBLIC_API_URL,
    'http://localhost:4000',
  ];

  const absoluteUrl = candidates.find((candidate) => candidate && /^https?:\/\//.test(candidate));
  return (absoluteUrl ?? 'http://localhost:4000').replace(/\/+$/, '');
}

const apiUrl = resolveApiRewriteUrl();

const nextConfig: NextConfig = {
  reactStrictMode: true,
  async rewrites() {
    return [{ source: '/api/:path*', destination: `${apiUrl}/:path*` }];
  },
};

export default nextConfig;
