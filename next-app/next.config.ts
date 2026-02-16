

const nextConfig: NextConfig = {
  reactCompiler: true,

  // Disable Turbopack for production builds (Cloudflare adapter requires webpack)
  ...(process.env.NODE_ENV === 'production' ? {} : {
    turbopack: {
      root: "./",
    },
  }),

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

  serverExternalPackages: ['@prisma/client', '@prisma/adapter-d1'],

  async headers() {
    const isProd = process.env.NODE_ENV === 'production';
    const csp = [
      "default-src 'self'",
      "base-uri 'self'",
      "object-src 'none'",
      "img-src 'self' data: blob: https://avatars.githubusercontent.com https://lh3.googleusercontent.com",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      isProd ? "script-src 'self'" : "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
      "connect-src 'self'",
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
          { key: 'Strict-Transport-Security', value: 'max-age=31536000; includeSubDomains' },
        ],
      },
    ];
  },
};

module.exports = nextConfig;

export default nextConfig;