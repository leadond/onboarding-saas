'use client'

import { useState } from 'react'
import { Menu, X, ChevronDown } from 'lucide-react'
import type { Kit } from '@/types'
import { cn } from '@/lib/utils/cn'

interface KitHeaderProps {
  kit: Kit & {
    user?: {
      full_name?: string
      company_name?: string
    }
  }
  completionPercentage: number
  currentStepIndex: number
  totalSteps: number
  onMenuToggle?: () => void
  showMobileMenu?: boolean
  className?: string
}

export function KitHeader({
  kit,
  completionPercentage,
  currentStepIndex,
  totalSteps,
  onMenuToggle,
  showMobileMenu,
  className,
}: KitHeaderProps) {
  const [showCompanyInfo, setShowCompanyInfo] = useState(false)

  const companyName =
    kit.user?.company_name || kit.user?.full_name || 'Professional Services'

  // Use kit's brand color or default
  const brandColor = kit.brand_color || '#3B82F6'

  return (
    <header
      className={cn(
        'sticky top-0 z-50 border-b border-gray-200 bg-white',
        className
      )}
      style={{
        borderBottomColor: `${brandColor}20`,
        backgroundImage: `linear-gradient(to right, ${brandColor}05, transparent)`,
      }}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between py-4">
          {/* Left side - Logo and Kit Info */}
          <div className="flex items-center space-x-4">
            {/* Mobile menu button */}
            <button
              onClick={onMenuToggle}
              className="rounded-md p-2 text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-900 lg:hidden"
              aria-label={showMobileMenu ? 'Close menu' : 'Open menu'}
            >
              {showMobileMenu ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </button>

            {/* Logo */}
            {kit.logo_url && (
              <div className="flex-shrink-0">
                <img
                  src={kit.logo_url}
                  alt={`${companyName} Logo`}
                  className="h-10 w-10 rounded-lg object-cover shadow-sm ring-2 ring-white"
                />
              </div>
            )}

            {/* Kit and Company Info */}
            <div className="min-w-0">
              <div className="flex items-center space-x-2">
                <h1 className="truncate text-xl font-bold text-gray-900 sm:text-2xl">
                  {kit.name}
                </h1>
                <button
                  onClick={() => setShowCompanyInfo(!showCompanyInfo)}
                  className="hidden items-center text-sm text-gray-600 transition-colors hover:text-gray-900 sm:flex"
                >
                  <ChevronDown
                    className={cn(
                      'h-4 w-4 transition-transform',
                      showCompanyInfo && 'rotate-180'
                    )}
                  />
                </button>
              </div>

              {/* Company Name - Always visible on mobile, toggleable on desktop */}
              <div
                className={cn(
                  'mt-1 sm:mt-0',
                  'block sm:hidden', // Always show on mobile
                  showCompanyInfo && 'sm:block' // Show on desktop when toggled
                )}
              >
                <p className="flex items-center text-sm text-gray-600">
                  by{' '}
                  <span
                    className="ml-1 font-medium"
                    style={{ color: brandColor }}
                  >
                    {companyName}
                  </span>
                </p>
                {kit.description && showCompanyInfo && (
                  <p className="mt-1 hidden text-sm text-gray-500 sm:block">
                    {kit.description}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Right side - Progress Info */}
          <div className="flex items-center space-x-4">
            {/* Progress Badge */}
            <div className="hidden items-center space-x-3 sm:flex">
              <div className="flex items-center space-x-2">
                <div className="flex items-center space-x-1">
                  <div
                    className="h-2 w-16 overflow-hidden rounded-full bg-gray-200"
                    role="progressbar"
                    aria-valuenow={completionPercentage}
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-label={`${completionPercentage}% complete`}
                  >
                    <div
                      className="h-full rounded-full transition-all duration-300 ease-out"
                      style={{
                        width: `${completionPercentage}%`,
                        backgroundColor: brandColor,
                      }}
                    />
                  </div>
                  <span className="text-sm font-medium text-gray-900">
                    {completionPercentage}%
                  </span>
                </div>
              </div>

              <div className="text-right">
                <div className="text-sm font-medium text-gray-900">
                  Step {currentStepIndex + 1} of {totalSteps}
                </div>
                <div className="text-xs text-gray-500">
                  {totalSteps - currentStepIndex - 1} remaining
                </div>
              </div>
            </div>

            {/* Mobile Progress */}
            <div className="sm:hidden">
              <div className="text-right">
                <div className="text-sm font-medium text-gray-900">
                  {currentStepIndex + 1}/{totalSteps}
                </div>
                <div
                  className="text-xs font-medium"
                  style={{ color: brandColor }}
                >
                  {completionPercentage}%
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Progress Bar */}
        <div className="pb-4 sm:hidden">
          <div
            className="h-1 overflow-hidden rounded-full bg-gray-200"
            role="progressbar"
            aria-valuenow={completionPercentage}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label={`${completionPercentage}% complete`}
          >
            <div
              className="h-full transition-all duration-300 ease-out"
              style={{
                width: `${completionPercentage}%`,
                backgroundColor: brandColor,
              }}
            />
          </div>
        </div>

        {/* Extended Company Info (Desktop) */}
        {showCompanyInfo && kit.description && (
          <div className="mt-4 hidden border-t border-gray-100 pb-4 pt-2 sm:block">
            <p className="max-w-2xl text-sm text-gray-600">{kit.description}</p>
          </div>
        )}
      </div>
    </header>
  )
}
