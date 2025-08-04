import type { NextConfig } from "next";

// Bundle analyzer
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
});

// PWA configuration
const withPWA = require('next-pwa')({
  dest: 'public',
  disable: process.env.NODE_ENV === 'development',
  register: true,
  skipWaiting: true,
  runtimeCaching: [
    {
      urlPattern: /^https?:\/\/.*\.(?:png|jpg|jpeg|svg|gif|webp|avif|ico)$/,
      handler: 'StaleWhileRevalidate',
      options: {
        cacheName: 'images',
        expiration: {
          maxEntries: 100,
          maxAgeSeconds: 60 * 60 * 24 * 30, // 30 giorni
        },
      },
    },
    {
      urlPattern: /^https?:\/\/.*\.(?:woff2?|eot|ttf|otf)$/,
      handler: 'CacheFirst',
      options: {
        cacheName: 'fonts',
        expiration: {
          maxEntries: 20,
          maxAgeSeconds: 60 * 60 * 24 * 365, // 1 anno
        },
      },
    },
    {
      urlPattern: /^https?:\/\/.*\.(?:js|css)$/,
      handler: 'StaleWhileRevalidate',
      options: {
        cacheName: 'static-resources',
        expiration: {
          maxEntries: 100,
          maxAgeSeconds: 60 * 60 * 24 * 30,
        },
      },
    },
    {
      urlPattern: /^https?:\/\/.*\/api\//,
      handler: 'NetworkFirst',
      options: {
        cacheName: 'api-calls',
        networkTimeoutSeconds: 10,
        expiration: {
          maxEntries: 50,
          maxAgeSeconds: 60 * 60 * 24,
        },
      },
    },
    {
      urlPattern: /^\/$/,
      handler: 'NetworkFirst',
      options: {
        cacheName: 'start-url',
      },
    },
    {
      urlPattern: /^https?:\/\//,
      handler: 'NetworkFirst',
      options: {
        cacheName: 'offlineCache',
        expiration: {
          maxEntries: 200,
        },
      },
    },
    {
      urlPattern: /.*/,
      handler: 'NetworkFirst',
      options: {
        cacheName: 'fallback',
        expiration: {
          maxEntries: 50,
        },
      },
    },
  ],
  fallbacks: {
    document: '/offline.html',
    image: '/icons/icon-192x192.png',
  },
});

const nextConfig: NextConfig = {
  // Performance optimizations
  compress: true,
  
  // Production-ready build configuration
  eslint: {
    dirs: ['src'], // Only lint src directory
    ignoreDuringBuilds: true, // Ignore ESLint errors during production builds
  },
  
  typescript: {
    ignoreBuildErrors: true, // Ignore TypeScript errors during production builds
  },

  // Image optimization
  images: {
    formats: ['image/webp', 'image/avif'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 60 * 60 * 24 * 30, // 30 days
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'your-strapi-domain.com', // Sostituisci con il dominio Strapi di produzione
        pathname: '/uploads/**',
      },
      {
        protocol: 'https',
        hostname: '*.strapi.app',
        pathname: '/uploads/**',
      },
    ],
  },

  // Bundle optimization
  experimental: {
    optimizePackageImports: [
      '@radix-ui/react-icons',
      'lucide-react',
      'framer-motion',
    ],
    optimizeServerReact: true,
  },

  // Security headers for production
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          // CORS - Production configuration
          {
            key: 'Access-Control-Allow-Origin',
            value: 'https://jokerman79.com',
          },
          {
            key: 'Access-Control-Allow-Methods', 
            value: 'GET, POST, OPTIONS',
          },
          {
            key: 'Access-Control-Allow-Headers',
            value: 'Content-Type, Authorization',
          },
          // Content Security Policy
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.googletagmanager.com https://www.google-analytics.com",
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
              "font-src 'self' https://fonts.gstatic.com",
              "img-src 'self' data: https: blob:",
              "media-src 'self' https:",
              "connect-src 'self' https://your-strapi-domain.com https://*.strapi.app wss: https://www.google-analytics.com",
              "frame-src 'self' https:",
              "object-src 'none'",
              "base-uri 'self'",
              "form-action 'self'",
              "frame-ancestors 'none'",
              "upgrade-insecure-requests"
            ].join('; '),
          },
          // Security headers
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=(), payment=()',
          },
          // HSTS for HTTPS enforcement
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=31536000; includeSubDomains; preload',
          },
        ],
      },
    ];
  },

  // Production API proxy configuration
  async rewrites() {
    return [
      {
        source: '/api/evolution/:path*',
        destination: 'https://sportbetit.evo-games.com/api/:path*',
      },
      // Production Strapi GraphQL proxy
      {
        source: '/api/strapi/graphql',
        destination: 'https://your-strapi-domain.com/graphql', // Sostituisci con l'URL Strapi di produzione
      },
      {
        source: '/api/strapi/:path*',
        destination: 'https://your-strapi-domain.com/api/:path*', // Sostituisci con l'URL Strapi di produzione
      },
    ];
  },

  // Production configuration
  poweredByHeader: false,
  generateEtags: true, // Enable ETags for better caching
  
  // Output configuration for production deployment
  output: 'standalone', // Optimized for Docker deployment
};

export default withBundleAnalyzer(withPWA(nextConfig));
