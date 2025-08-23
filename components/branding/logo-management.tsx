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

'use client'

import { useState } from 'react'
import { Upload, Save, AlertTriangle, Info } from 'lucide-react'
import { AppLogo } from './app-logo'
import { KitLogo } from './kit-logo'

interface LogoManagementProps {
  userRole: string
  kitId?: string
  currentKitLogo?: string | null
  onKitLogoUpdate?: (logoUrl: string) => Promise<void>
}

/**
 * Logo Management Component - Enforces role-based access control
 * - Global Admin: Can change app logo (requires environment variable update)
 * - Super Admin: Can change kit logos for their clients
 * - Other roles: View only
 */
export function LogoManagement({ 
  userRole, 
  kitId, 
  currentKitLogo, 
  onKitLogoUpdate 
}: LogoManagementProps) {
  const [kitLogoUrl, setKitLogoUrl] = useState(currentKitLogo || '')
  const [isUpdating, setIsUpdating] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error' | 'info', text: string } | null>(null)

  const isGlobalAdmin = userRole === 'global_admin'
  const isSuperAdmin = ['super_admin', 'global_admin'].includes(userRole)
  const canEditKitLogo = isSuperAdmin && kitId && onKitLogoUpdate

  const handleKitLogoUpdate = async () => {
    if (!canEditKitLogo || !onKitLogoUpdate) return

    setIsUpdating(true)
    setMessage(null)

    try {
      await onKitLogoUpdate(kitLogoUrl)
      setMessage({ type: 'success', text: 'Kit logo updated successfully!' })
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to update kit logo. Please try again.' })
    } finally {
      setIsUpdating(false)
    }
  }

  return (
    <div className="space-y-8">
      {/* App Logo Section */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-blue-100 rounded-lg">
            <Info className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">App Logo</h3>
            <p className="text-sm text-gray-600">Your main application branding</p>
          </div>
        </div>

        <div className="flex items-center gap-6 mb-4">
          <AppLogo size="lg" />
          <div className="flex-1">
            <h4 className="font-medium text-gray-900">Current App Logo</h4>
            <p className="text-sm text-gray-600">This logo appears in the main navigation and login page</p>
          </div>
        </div>

        {isGlobalAdmin ? (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <Info className="w-5 h-5 text-blue-600 mt-0.5" />
              <div>
                <h4 className="font-medium text-blue-900">Global Admin Access</h4>
                <p className="text-sm text-blue-700 mt-1">
                  To change the app logo, update these environment variables:
                </p>
                <ul className="text-sm text-blue-700 mt-2 space-y-1">
                  <li><code className="bg-blue-100 px-2 py-1 rounded">NEXT_PUBLIC_APP_LOGO_URL</code> - URL to your logo image</li>
                  <li><code className="bg-blue-100 px-2 py-1 rounded">NEXT_PUBLIC_APP_NAME</code> - Your app name</li>
                  <li><code className="bg-blue-100 px-2 py-1 rounded">NEXT_PUBLIC_APP_TAGLINE</code> - Your app tagline</li>
                </ul>
                <p className="text-sm text-blue-700 mt-2">
                  After updating, restart your application to see changes.
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-5 h-5 text-gray-600" />
              <p className="text-sm text-gray-600">
                Only the app owner (Global Admin) can change the main app logo.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Kit Logo Section */}
      {kitId && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-green-100 rounded-lg">
              <Upload className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Kit Logo</h3>
              <p className="text-sm text-gray-600">Client-specific branding for this kit</p>
            </div>
          </div>

          <div className="flex items-center gap-6 mb-4">
            <KitLogo logoUrl={currentKitLogo} size="lg" />
            <div className="flex-1">
              <h4 className="font-medium text-gray-900">Current Kit Logo</h4>
              <p className="text-sm text-gray-600">This logo appears in the kit portal header</p>
            </div>
          </div>

          {canEditKitLogo ? (
            <div className="space-y-4">
              <div>
                <label htmlFor="kit-logo-url" className="block text-sm font-medium text-gray-700 mb-2">
                  Logo URL
                </label>
                <input
                  id="kit-logo-url"
                  type="url"
                  value={kitLogoUrl}
                  onChange={(e) => setKitLogoUrl(e.target.value)}
                  placeholder="https://example.com/logo.png"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Enter a public URL to your logo image (PNG, JPG, or SVG recommended)
                </p>
              </div>

              <button
                onClick={handleKitLogoUpdate}
                disabled={isUpdating || kitLogoUrl === currentKitLogo}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <Save className="w-4 h-4" />
                {isUpdating ? 'Updating...' : 'Update Kit Logo'}
              </button>

              {message && (
                <div className={`p-3 rounded-md ${
                  message.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' :
                  message.type === 'error' ? 'bg-red-50 text-red-700 border border-red-200' :
                  'bg-blue-50 text-blue-700 border border-blue-200'
                }`}>
                  {message.text}
                </div>
              )}
            </div>
          ) : (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <div className="flex items-center gap-3">
                <AlertTriangle className="w-5 h-5 text-gray-600" />
                <p className="text-sm text-gray-600">
                  {isSuperAdmin 
                    ? 'Kit logo editing is only available in kit settings.'
                    : 'Only Super Admins can change kit logos.'
                  }
                </p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}