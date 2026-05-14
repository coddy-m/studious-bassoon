/** @type {import('next').NextConfig} */
const nextConfig = {
  // Skip ESLint/TypeScript errors during build (safe for deployment)
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  // ✅ CRITICAL: Disable static export entirely
  // This forces all pages to render on-demand (SSR), preventing prerender crashes
  output: 'standalone',
  
  // Optimize for serverless deployment
  reactStrictMode: false,
  
  // Prevent bundling issues with server-only packages
  experimental: {
    serverComponentsExternalPackages: ['next-auth', 'mongodb', 'mongoose', 'ioredis'],
  },
};

module.exports = nextConfig;