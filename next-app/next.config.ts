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
  },
  
  // External packages for Server Components (moved from experimental in Next.js 16)
  serverExternalPackages: ['@prisma/client', '@prisma/adapter-d1'],};

export default nextConfig;