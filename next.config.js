/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable SWC minification for better performance and obfuscation
  swcMinify: true,
  
  // Compress output
  compress: true,
  
  // Remove console logs in production
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production' ? {
      exclude: ['error']
    } : false,
  },
  
  // Security headers
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
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
      }
    ]
  },
  
  // Webpack configuration for additional obfuscation
  webpack: (config, { dev, isServer }) => {
    if (!dev && !isServer) {
      // Additional minification and obfuscation
      config.optimization.minimize = true;
      
      // Remove source maps in production
      config.devtool = false;
    }
    
    return config;
  },
  
  // Disable source maps in production
  productionBrowserSourceMaps: false,
  
  // Enable experimental features for better security
  experimental: {
    serverComponentsExternalPackages: ['@supabase/supabase-js']
  }
}

module.exports = nextConfig