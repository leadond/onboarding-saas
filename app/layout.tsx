import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { ThemeProvider } from '@/components/theme-provider'
import { Toaster } from '@/components/ui/toaster'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Onboard Hero - Professional Client Onboarding',
  description:
    'Create professional client onboarding experiences with ease using Onboard Hero',
  keywords: ['onboarding', 'client onboarding', 'saas', 'business automation'],
  authors: [{ name: 'Onboard Hero' }],
  creator: 'Onboard Hero',
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
  ),
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
    siteName: 'Onboard Hero',
    title: 'Onboard Hero - Professional Client Onboarding',
    description:
      'Create professional client onboarding experiences with ease using Onboard Hero',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Onboard Hero - Professional Client Onboarding'
      }
    ]
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Onboard Hero - Professional Client Onboarding',
    description:
      'Create professional client onboarding experiences with ease using Onboard Hero',
    images: ['/og-image.jpg'],
    creator: '@onboardhero'
  },
  manifest: '/manifest.json',
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon-16x16.png',
    apple: '/apple-touch-icon.png',
    other: [
      {
        rel: 'apple-touch-icon-precomposed',
        url: '/apple-touch-icon-precomposed.png',
      },
    ],
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
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  )
}
