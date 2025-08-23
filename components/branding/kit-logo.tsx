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

import Image from 'next/image'
import { Building2 } from 'lucide-react'

interface KitLogoProps {
  logoUrl?: string | null
  companyName?: string
  className?: string
  size?: 'sm' | 'md' | 'lg'
  fallbackIcon?: React.ReactNode
}

/**
 * Kit Logo Component - Editable by super admins for client branding
 * This is separate from the app logo which is only changeable by global admin
 */
export function KitLogo({ 
  logoUrl, 
  companyName = 'Company',
  className = '',
  size = 'md',
  fallbackIcon
}: KitLogoProps) {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-12 h-12'
  }

  // If we have a logo URL, display it
  if (logoUrl) {
    return (
      <div className={`${sizeClasses[size]} relative overflow-hidden rounded-lg shadow-sm ring-2 ring-white ${className}`}>
        <Image
          src={logoUrl}
          alt={`${companyName} Logo`}
          fill
          className="object-cover"
        />
      </div>
    )
  }

  // Fallback to icon or default building icon
  return (
    <div className={`${sizeClasses[size]} bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg flex items-center justify-center shadow-sm ring-2 ring-white ${className}`}>
      {fallbackIcon || <Building2 className="w-1/2 h-1/2 text-gray-600" />}
    </div>
  )
}