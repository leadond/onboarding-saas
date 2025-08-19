/** @type {import('next').NextConfig} */
const nextConfig = {
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: process.env.NODE_ENV === 'development' 
              ? "script-src 'self' 'unsafe-eval' 'unsafe-inline'; object-src 'none';"
              : "script-src 'self'; object-src 'none';"
          }
        ]
      }
    ]
  }
}

module.exports = nextConfig