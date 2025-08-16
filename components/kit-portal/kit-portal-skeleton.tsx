'use client'

import { cn } from '@/lib/utils/cn'

export function KitPortalSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn('min-h-screen bg-gray-50', className)}>
      {/* Header Skeleton */}
      <div className="border-b border-gray-200 bg-white">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                {/* Logo skeleton */}
                <div className="h-10 w-10 animate-pulse rounded-lg bg-gray-200" />
                <div>
                  {/* Title skeleton */}
                  <div className="mb-2 h-6 w-48 animate-pulse rounded bg-gray-200" />
                  {/* Description skeleton */}
                  <div className="h-4 w-64 animate-pulse rounded bg-gray-200" />
                </div>
              </div>

              {/* Step counter skeleton */}
              <div className="h-4 w-20 animate-pulse rounded bg-gray-200" />
            </div>

            {/* Progress Bar Skeleton */}
            <div className="mt-6">
              <div className="w-full">
                {/* Progress bar */}
                <div className="mb-4 h-2 animate-pulse rounded-full bg-gray-200" />

                {/* Step indicators */}
                <div className="flex justify-between">
                  {Array.from({ length: 4 }).map((_, index) => (
                    <div key={index} className="flex flex-col items-center">
                      {/* Step circle */}
                      <div className="h-8 w-8 animate-pulse rounded-full bg-gray-200" />
                      {/* Step title */}
                      <div className="mt-2 h-3 w-16 animate-pulse rounded bg-gray-200" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Skeleton */}
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="rounded-lg border border-gray-200 bg-white shadow-sm">
          <div className="p-6 sm:p-8">
            {/* Step title skeleton */}
            <div className="mb-4 h-8 w-56 animate-pulse rounded bg-gray-200" />

            {/* Step description skeleton */}
            <div className="mb-2 h-4 w-full animate-pulse rounded bg-gray-200" />
            <div className="mb-6 h-4 w-3/4 animate-pulse rounded bg-gray-200" />

            {/* Form content skeleton */}
            <div className="space-y-6">
              {/* Form field 1 */}
              <div>
                <div className="mb-2 h-4 w-32 animate-pulse rounded bg-gray-200" />
                <div className="h-10 w-full animate-pulse rounded bg-gray-200" />
              </div>

              {/* Form field 2 */}
              <div>
                <div className="mb-2 h-4 w-40 animate-pulse rounded bg-gray-200" />
                <div className="h-10 w-full animate-pulse rounded bg-gray-200" />
              </div>

              {/* Form field 3 */}
              <div>
                <div className="mb-2 h-4 w-36 animate-pulse rounded bg-gray-200" />
                <div className="h-24 w-full animate-pulse rounded bg-gray-200" />
              </div>

              {/* Buttons skeleton */}
              <div className="flex space-x-3 pt-4">
                <div className="h-10 w-24 animate-pulse rounded bg-gray-200" />
                <div className="h-10 w-32 animate-pulse rounded bg-gray-200" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Skeleton */}
      <div className="fixed bottom-0 left-0 right-0 border-t border-gray-200 bg-white p-4">
        <div className="mx-auto flex max-w-4xl items-center justify-between">
          {/* Back button skeleton */}
          <div className="flex-1">
            <div className="h-10 w-20 animate-pulse rounded bg-gray-200" />
          </div>

          {/* Progress dots skeleton (desktop) */}
          <div className="hidden flex-1 items-center justify-center space-x-2 md:flex">
            {Array.from({ length: 4 }).map((_, index) => (
              <div
                key={index}
                className="h-3 w-3 animate-pulse rounded-full bg-gray-200"
              />
            ))}
          </div>

          {/* Mobile progress text skeleton */}
          <div className="flex-1 text-center md:hidden">
            <div className="mx-auto h-4 w-16 animate-pulse rounded bg-gray-200" />
          </div>

          {/* Skip button skeleton */}
          <div className="flex flex-1 justify-end">
            <div className="h-10 w-16 animate-pulse rounded bg-gray-200" />
          </div>
        </div>
      </div>

      {/* Mobile spacing */}
      <div className="h-20 sm:hidden" />
    </div>
  )
}

// Simpler version for use in other contexts
export function SimpleKitPortalSkeleton() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-b-2 border-blue-600" />
        <div className="mx-auto mb-2 h-4 w-32 animate-pulse rounded bg-gray-200" />
        <div className="mx-auto h-3 w-48 animate-pulse rounded bg-gray-200" />
      </div>
    </div>
  )
}
