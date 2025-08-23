/*
 * Copyright (c) 2024 Marvelously Made LLC DBA Dev App Hero. All rights reserved.
 * 
 * PROPRIETARY AND CONFIDENTIAL
 * 
 * This software contains proprietary and confidential information.
 * Unauthorized copying, distribution, or use is strictly prohibited.
 * 
 * For licensing information, contact: legal@devapphero.com
 */

import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { ThemeProvider } from '@/components/theme-provider'
import { AuthProvider } from '@/components/auth/auth-provider'
import { Toaster } from '@/components/ui/toaster'
import { ErrorBoundary } from '@/components/error-boundary'
import { GoogleAnalytics } from '@/components/analytics'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Onboard Hero - AI-Powered Client Onboarding Platform | Reduce Churn by 86%',
  description:
    'Transform client onboarding with AI automation. Eliminate manual bottlenecks, reduce 86% customer abandonment, and achieve 3x faster conversion rates. Start your free trial today.',
  keywords: [
    'client onboarding software',
    'AI-powered onboarding',
    'customer onboarding platform',
    'SaaS onboarding automation',
    'reduce customer churn',
    'onboarding workflow',
    'client success platform',
    'automated onboarding process',
    'enterprise onboarding solution',
    'customer experience automation'
  ],
  authors: [{ name: 'Onboard Hero Team' }],
  creator: 'Onboard Hero',
  publisher: 'Dev App Hero',
  metadataBase: new URL('http://localhost:3000'),
  alternates: {
    canonical: process.env.NEXT_PUBLIC_APP_URL || 'https://onboard.devapphero.com'
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: process.env.NEXT_PUBLIC_APP_URL || 'https://onboard.devapphero.com',
    siteName: 'Onboard Hero',
    title: 'Onboard Hero - AI-Powered Client Onboarding Platform',
    description:
      'Transform client onboarding with AI automation. Eliminate manual bottlenecks, reduce 86% customer abandonment, and achieve 3x faster conversion rates.',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Onboard Hero - AI-Powered Client Onboarding Platform'
      }
    ]
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Onboard Hero - AI-Powered Client Onboarding Platform',
    description:
      'Transform client onboarding with AI automation. Reduce customer churn by 86% and achieve 3x faster conversion rates.',
    images: ['/twitter-image.png'],
    creator: '@onboardhero',
    site: '@onboardhero'
  },

  icons: {
    icon: '/favicon.ico'
  },
  applicationName: 'Onboard Hero',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Onboard Hero',
    startupImage: [
      {
        url: '/splash_screens/iphone5_splash.png',
        media: '(device-width: 320px) and (device-height: 568px) and (-webkit-device-pixel-ratio: 2)',
      },
    ],
  },
  formatDetection: {
    telephone: false,
  },
}

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#000000' },
  ],
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              // Block wallet provider detection
              if (typeof window !== 'undefined') {
                // Remove ethereum provider if it exists
                delete window.ethereum;
                delete window.web3;
                
                // Prevent MetaMask injection
                Object.defineProperty(window, 'ethereum', {
                  get: () => undefined,
                  set: () => {},
                  configurable: false
                });
                
                Object.defineProperty(window, 'web3', {
                  get: () => undefined,
                  set: () => {},
                  configurable: false
                });
              }
            `,
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@graph": [
                {
                  "@type": "Organization",
                  "@id": "https://onboard.devapphero.com/#organization",
                  "name": "Onboard Hero",
                  "alternateName": "Dev App Hero",
                  "url": "https://onboard.devapphero.com",
                  "logo": {
                    "@type": "ImageObject",
                    "url": "https://onboard.devapphero.com/logo.png",
                    "width": 512,
                    "height": 512
                  },
                  "description": "AI-powered client onboarding platform that reduces customer churn by 86% and achieves 3x faster conversion rates.",
                  "foundingDate": "2024",
                  "sameAs": [
                    "https://twitter.com/onboardhero",
                    "https://linkedin.com/company/onboard-hero"
                  ]
                },
                {
                  "@type": "WebSite",
                  "@id": "https://onboard.devapphero.com/#website",
                  "url": "https://onboard.devapphero.com",
                  "name": "Onboard Hero",
                  "description": "AI-Powered Client Onboarding Platform",
                  "publisher": {
                    "@id": "https://onboard.devapphero.com/#organization"
                  },
                  "potentialAction": {
                    "@type": "SearchAction",
                    "target": "https://onboard.devapphero.com/search?q={search_term_string}",
                    "query-input": "required name=search_term_string"
                  }
                },
                {
                  "@type": "SoftwareApplication",
                  "name": "Onboard Hero",
                  "applicationCategory": "BusinessApplication",
                  "operatingSystem": "Web Browser",
                  "description": "AI-powered client onboarding platform that automates workflows, reduces customer abandonment by 86%, and increases conversion rates by 3x.",
                  "url": "https://onboard.devapphero.com",
                  "author": {
                    "@id": "https://onboard.devapphero.com/#organization"
                  },
                  "offers": {
                    "@type": "Offer",
                    "price": "0",
                    "priceCurrency": "USD",
                    "description": "Free trial available"
                  },
                  "featureList": [
                    "AI-powered automation",
                    "Client onboarding workflows",
                    "Progress tracking",
                    "Integration management",
                    "Analytics and reporting",
                    "Team collaboration"
                  ]
                }
              ]
            })
          }}
        />
      </head>
      <body className={inter.className}>
        <GoogleAnalytics />
        <ErrorBoundary>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <AuthProvider>
              {children}
              <Toaster />
            </AuthProvider>
          </ThemeProvider>
        </ErrorBoundary>
      </body>
    </html>
  )
}
