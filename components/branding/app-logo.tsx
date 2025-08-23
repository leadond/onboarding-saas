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

import { LogoIcon } from '@/components/icons';
import Image from 'next/image';

import logo from '../../public/my-company-logo.png';

interface AppLogoProps {
  className?: string;
  showText?: boolean;
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl';
  variant?: 'icon' | 'text' | 'full';
  layout?: 'horizontal' | 'vertical';
}

/**
 * App Logo Component - Only changeable by global admin (app owner)
 * This is separate from kit logos which can be changed by super admins
 */
export function AppLogo({
  className = '',
  showText = true,
  size = 'md',
  variant = 'full',
  layout = 'horizontal'
}: AppLogoProps) {
  // Removed mounting check to prevent hydration mismatch
  // App logo configuration - only changeable by global admin
  const APP_LOGO_CONFIG = {
    // Set to null to use the default LogoIcon, or provide a path to your custom logo
    appName: process.env.NEXT_PUBLIC_APP_NAME || 'Onboard Hero',
    tagline: process.env.NEXT_PUBLIC_APP_TAGLINE || 'AI-Powered Automation'
  };

  const sizeClasses = {
    sm: {
      icon: 'w-8 h-8',
      text: 'text-lg',
      tagline: 'text-xs'
    },
    md: {
      icon: 'w-12 h-12',
      text: 'text-xl',
      tagline: 'text-sm'
    },
    lg: {
      icon: 'w-16 h-16',
      text: 'text-2xl',
      tagline: 'text-base'
    },
    xl: {
      icon: 'w-24 h-24',
      text: 'text-3xl',
      tagline: 'text-lg'
    },
    '2xl': {
      icon: 'w-32 h-32',
      text: 'text-4xl',
      tagline: 'text-xl'
    },
    '3xl': {
      icon: 'w-48 h-48',
      text: 'text-3xl',
      tagline: 'text-lg'
    },
    '4xl': {
      icon: 'w-64 h-64',
      text: 'text-6xl',
      tagline: 'text-3xl'
    },
    '5xl': {
      icon: 'w-80 h-80',
      text: 'text-7xl',
      tagline: 'text-4xl'
    }
  }

  const renderIcon = () => {
    return (
      <div className={`${sizeClasses[size].icon} relative`}>
        <Image
          src={logo}
          alt={`${APP_LOGO_CONFIG.appName} Logo`}
          width={500}
          height={500}
          className="object-contain filter contrast-125 brightness-110 saturate-110"
          style={{
            filter: 'drop-shadow(0 0 1px rgba(0, 0, 0, 1)) drop-shadow(1px 1px 2px rgba(0, 0, 0, 0.8))'
          }}
          priority
        />
      </div>
    );
  }

  const renderText = () => (
    <div className={`flex flex-col ${layout === 'vertical' ? 'text-center' : ''} ${layout === 'vertical' ? '-space-y-1' : ''}`}>
      <h1 
        className={`${sizeClasses[size].text} font-bold bg-gradient-to-r from-primary-600 to-primary-700 bg-clip-text text-transparent`}
        style={{
          filter: 'drop-shadow(0 0 1px rgba(0, 0, 0, 0.8)) drop-shadow(1px 1px 1px rgba(0, 0, 0, 0.6))'
        }}
      >
        {APP_LOGO_CONFIG.appName}
      </h1>
      {APP_LOGO_CONFIG.tagline && (
        <p 
          className={`${sizeClasses[size].tagline} text-primary-500 font-medium`}
          style={{
            filter: 'drop-shadow(0 0 1px rgba(0, 0, 0, 0.8)) drop-shadow(1px 1px 1px rgba(0, 0, 0, 0.6))'
          }}
        >
          {APP_LOGO_CONFIG.tagline}
        </p>
      )}
    </div>
  )

  if (variant === 'icon') {
    return <div className={className}>{renderIcon()}</div>
  }

  if (variant === 'text') {
    return <div className={className}>{renderText()}</div>
  }

  return (
    <div className={`flex ${layout === 'vertical' ? 'flex-col items-center gap-0' : 'items-center gap-3'} ${className}`}>
      {renderIcon()}
      {showText && renderText()}
    </div>
  )
}