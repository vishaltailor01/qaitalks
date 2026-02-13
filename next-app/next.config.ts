import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,
  
  // Disable Turbopack for production builds (Cloudflare adapter requires webpack)
  ...(process.env.NODE_ENV === 'production' ? {} : {
    turbopack: {
      root: process.cwd(),
    },
  }),
  
  // Cloudflare requires unoptimized images (use Cloudflare Images separately if needed)
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'avatars.githubusercontent.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
        pathname: '/**',
      },
    ],
  },
  
  // External packages for Server Components (moved from experimental in Next.js 16)
  serverExternalPackages: ['@prisma/client', '@prisma/adapter-d1'],

  async headers() {
    const isProd = process.env.NODE_ENV === 'production';
    const csp = [
      "default-src 'self'",
      "base-uri 'self'",
      "object-src 'none'",
      "img-src 'self' data: blob: https://avatars.githubusercontent.com https://lh3.googleusercontent.com",
      // Allow Google Fonts stylesheets
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      // Allow inline/eval in dev for HMR
      isProd ? "script-src 'self'" : "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
      // Allow SSE/fetch to same-origin
      "connect-src 'self'",
      // Allow Google Fonts
      "font-src 'self' data: https://fonts.gstatic.com",
      "frame-ancestors 'self'",
      "upgrade-insecure-requests",
    ].filter(Boolean).join('; ');

    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'Content-Security-Policy', value: csp },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
          // Only effective over HTTPS; fine for production deployments
          { key: 'Strict-Transport-Security', value: 'max-age=31536000; includeSubDomains' },
        ],
      },
    ];
  },
};

export default nextConfig;