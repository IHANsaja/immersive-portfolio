import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  // Transpile Three.js packages to prevent multiple instance issues in Next.js production builds
  transpilePackages: ['three', '@react-three/fiber', '@react-three/drei', 'three-stdlib'],

  // Webpack config to force a single Three.js instance (for production)
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      three: path.resolve(__dirname, 'node_modules/three'),
    };
    return config;
  },

  // Turbopack config to force a single Three.js instance (for dev server)
  turbopack: {
    resolveAlias: {
      three: 'three',
    },
  },

  // Image optimization
  images: {
    formats: ['image/webp', 'image/avif'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 60,
  },
  
  // Compiler options for performance
  compiler: {
    removeConsole: process.env.NODE_ENV === "production" ? { exclude: ["error"] } : false,
  },
  
  // Compression
  compress: true,
  
  // Headers for better SEO and security
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin',
          },
        ],
      },
      {
        source: '/sitemap.xml',
        headers: [
          {
            key: 'Content-Type',
            value: 'application/xml',
          },
        ],
      },
    ];
  },
  
  // Redirects for SEO
  async redirects() {
    return [
      {
        source: '/home',
        destination: '/',
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
