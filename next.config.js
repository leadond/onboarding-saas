/** @type {import('next').NextConfig} */
const isDev = process.env.NODE_ENV === 'development'

const nextConfig = {
  // Compress output (disabled in development for faster builds)
  compress: !isDev,
  
  // Remove console logs in production
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production' ? {
      exclude: ['error']
    } : false,
  },
  
  // Security headers (development-aware)
  async headers() {
    const securityHeaders = [
      {
        key: 'X-Frame-Options',
        value: 'DENY'
      },
      {
        key: 'X-Content-Type-Options',
        value: 'nosniff'
      },
      {
        key: 'Referrer-Policy',
        value: 'strict-origin-when-cross-origin'
      },
      {
        key: 'Permissions-Policy',
        value: 'camera=(), microphone=(), geolocation=()'
      }
    ]

    // Add HTTPS enforcement only in production
    if (!isDev) {
      securityHeaders.push({
        key: 'Strict-Transport-Security',
        value: 'max-age=31536000; includeSubDomains; preload'
      })
    }

    return [
      {
        source: '/(.*)',
        headers: securityHeaders
      }
    ]
  },
  
  // Webpack configuration for debugging
  webpack: (config, { dev, isServer }) => {
    if (!dev && !isServer) {
      // Enable source maps for debugging React errors
      config.devtool = 'source-map';
    }
    
    return config;
  },
  
  // Enable source maps in production for debugging
  productionBrowserSourceMaps: true,
  
  // External packages for server components (updated API)
  serverExternalPackages: ['@supabase/supabase-js']
}

module.exports = nextConfig