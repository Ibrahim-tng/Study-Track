import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  eslint: {
    dirs: ['app', 'components', 'hooks', 'lib', 'utils', 'context', 'types'],
  },
  distDir: '.next',
  // Performance: enable compression and image optimization
  compress: true,
  headers: async () => [
    {
      source: '/:path*',
      headers: [
        // Prevent MIME type sniffing
        {
          key: 'X-Content-Type-Options',
          value: 'nosniff',
        },
        // Block clickjacking
        {
          key: 'X-Frame-Options',
          value: 'DENY',
        },
        // Legacy XSS protection
        {
          key: 'X-XSS-Protection',
          value: '1; mode=block',
        },
        // Enforce HTTPS for 1 year (important for production)
        {
          key: 'Strict-Transport-Security',
          value: 'max-age=31536000; includeSubDomains; preload',
        },
        // Control referrer information sent to other origins
        {
          key: 'Referrer-Policy',
          value: 'strict-origin-when-cross-origin',
        },
        // Limit browser API access (reduce attack surface)
        {
          key: 'Permissions-Policy',
          value: 'camera=(), microphone=(), geolocation=(), interest-cohort=()',
        },
        // Content Security Policy (hardened for production)
        {
          key: 'Content-Security-Policy',
          value: [
            "default-src 'self'",
            "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://apis.google.com https://*.vercel-scripts.com",
            "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
            "font-src 'self' https://fonts.gstatic.com",
            "img-src 'self' data: https:",
            "connect-src 'self' https://*.googleapis.com https://*.google.com https://firestore.googleapis.com https://identitytoolkit.googleapis.com https://securetoken.googleapis.com https://generativelanguage.googleapis.com https://firebase.googleapis.com https://firebaseinstallations.googleapis.com https://*.firebaseio.com wss://*.firebaseio.com https://*.vercel-scripts.com https://*.vercel-insights.com",
            "frame-src 'none'",
            "object-src 'none'",
            "base-uri 'self'",
            "form-action 'self'",
          ].join('; '),
        },
      ],
    },
  ],
};

export default nextConfig;
