'use client'

export function LogoDebug() {
  const logoUrl = process.env.NEXT_PUBLIC_APP_LOGO_URL
  const appName = process.env.NEXT_PUBLIC_APP_NAME
  const tagline = process.env.NEXT_PUBLIC_APP_TAGLINE

  return (
    <div className="fixed bottom-4 right-4 bg-black/80 text-white p-4 rounded-lg text-xs max-w-sm z-50">
      <h3 className="font-bold mb-2">🔍 Logo Debug Info</h3>
      <div className="space-y-1">
        <div>Logo URL: {logoUrl || '❌ NOT SET'}</div>
        <div>App Name: {appName || '❌ NOT SET'}</div>
        <div>Tagline: {tagline || '❌ NOT SET'}</div>
        <div>Environment: {process.env.NODE_ENV}</div>
      </div>
    </div>
  )
}