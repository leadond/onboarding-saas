/*
 * Copyright (c) 2024 [Your Company Name]. All rights reserved.
 * 
 * PROPRIETARY AND CONFIDENTIAL
 * 
 * This software contains proprietary and confidential information.
 * Unauthorized copying, distribution, or use is strictly prohibited.
 * 
 * For licensing information, contact: [your-email@domain.com]
 */

'use client'

import React from 'react'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Smartphone,
  Monitor,
  Download,
  X,
  Zap,
  Wifi,
  Bell,
  Shield,
  CheckCircle,
  Sparkles
} from 'lucide-react'
import { usePWAInstall } from '@/hooks/use-pwa'

interface PWAInstallPromptProps {
  showInline?: boolean
  autoShow?: boolean
  onInstall?: () => void
  onDismiss?: () => void
}

export function PWAInstallPrompt({ 
  showInline = false, 
  autoShow = true,
  onInstall,
  onDismiss 
}: PWAInstallPromptProps) {
  const { canInstall, isInstalled, install } = usePWAInstall()
  const [showPrompt, setShowPrompt] = useState(false)
  const [isInstalling, setIsInstalling] = useState(false)
  const [dismissed, setDismissed] = useState(false)

  useEffect(() => {
    // Check if user has previously dismissed the prompt
    const hasBeenDismissed = localStorage.getItem('pwa-install-dismissed') === 'true'
    setDismissed(hasBeenDismissed)

    // Auto-show prompt if conditions are met
    if (autoShow && canInstall && !isInstalled && !hasBeenDismissed) {
      // Delay showing the prompt to avoid interrupting user flow
      const timer = setTimeout(() => {
        setShowPrompt(true)
      }, 3000)

      return () => clearTimeout(timer)
    }
  }, [canInstall, isInstalled, autoShow])

  const handleInstall = async () => {
    setIsInstalling(true)
    try {
      const result = await install()
      if (result === true) {
        setShowPrompt(false)
        onInstall?.()
      }
    } catch (error) {
      console.error('PWA installation failed:', error)
    } finally {
      setIsInstalling(false)
    }
  }

  const handleDismiss = () => {
    setShowPrompt(false)
    setDismissed(true)
    localStorage.setItem('pwa-install-dismissed', 'true')
    onDismiss?.()
  }

  const handleRemindLater = () => {
    setShowPrompt(false)
    // Set a temporary dismissal that expires after 24 hours
    const tomorrow = new Date()
    tomorrow.setHours(tomorrow.getHours() + 24)
    localStorage.setItem('pwa-install-remind-later', tomorrow.toISOString())
  }

  // Don't show if already installed or permanently dismissed
  if (isInstalled || dismissed || !canInstall) {
    return null
  }

  const features = [
    {
      icon: <Zap className="h-4 w-4 text-yellow-500" />,
      title: 'Lightning Fast',
      description: 'Instant loading and smooth performance'
    },
    {
      icon: <Wifi className="h-4 w-4 text-blue-500" />,
      title: 'Works Offline',
      description: 'Access your kits even without internet'
    },
    {
      icon: <Bell className="h-4 w-4 text-green-500" />,
      title: 'Push Notifications',
      description: 'Get notified about important updates'
    },
    {
      icon: <Shield className="h-4 w-4 text-purple-500" />,
      title: 'Secure & Private',
      description: 'Your data stays safe and encrypted'
    }
  ]

  if (showInline) {
    return (
      <Card className="border-2 border-dashed border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Download className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <CardTitle className="text-lg">Install Onboard Hero App</CardTitle>
                <CardDescription>
                  Get the full app experience with offline access and notifications
                </CardDescription>
              </div>
            </div>
            <Badge variant="secondary" className="flex items-center space-x-1">
              <Sparkles className="h-3 w-3" />
              <span>Recommended</span>
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            {features.map((feature, index) => (
              <div key={index} className="text-center">
                <div className="flex justify-center mb-2">
                  {feature.icon}
                </div>
                <h4 className="text-sm font-medium mb-1">{feature.title}</h4>
                <p className="text-xs text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3">
            <Button 
              onClick={handleInstall}
              disabled={isInstalling}
              className="flex-1 flex items-center space-x-2"
            >
              <Download className="h-4 w-4" />
              <span>{isInstalling ? 'Installing...' : 'Install App'}</span>
            </Button>
            <Button 
              variant="outline" 
              onClick={handleDismiss}
              className="flex items-center space-x-2"
            >
              <X className="h-4 w-4" />
              <span>Not Now</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Dialog open={showPrompt} onOpenChange={setShowPrompt}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center space-x-3 mb-2">
            <div className="p-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl">
              <Download className="h-6 w-6 text-white" />
            </div>
            <div>
              <DialogTitle className="text-xl">Install Onboard Hero</DialogTitle>
              <DialogDescription>
                Get the best experience with our Progressive Web App
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4">
          {/* Device compatibility */}
          <div className="flex items-center justify-center space-x-6 py-4 bg-gray-50 rounded-lg">
            <div className="text-center">
              <Monitor className="h-8 w-8 text-gray-600 mx-auto mb-2" />
              <span className="text-sm text-gray-600">Desktop</span>
            </div>
            <div className="text-center">
              <Smartphone className="h-8 w-8 text-gray-600 mx-auto mb-2" />
              <span className="text-sm text-gray-600">Mobile</span>
            </div>
          </div>

          {/* Features grid */}
          <div className="grid grid-cols-2 gap-3">
            {features.map((feature, index) => (
              <div key={index} className="flex items-start space-x-2 p-3 bg-gray-50 rounded-lg">
                {feature.icon}
                <div>
                  <h4 className="text-sm font-medium">{feature.title}</h4>
                  <p className="text-xs text-muted-foreground">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Benefits */}
          <Alert>
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>
              <strong>No app store required!</strong> Install directly from your browser and get automatic updates.
            </AlertDescription>
          </Alert>
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button 
            onClick={handleInstall}
            disabled={isInstalling}
            className="w-full sm:w-auto flex items-center space-x-2"
          >
            <Download className="h-4 w-4" />
            <span>{isInstalling ? 'Installing...' : 'Install Now'}</span>
          </Button>
          
          <div className="flex gap-2 w-full sm:w-auto">
            <Button 
              variant="outline" 
              onClick={handleRemindLater}
              className="flex-1 sm:flex-none"
            >
              Remind Later
            </Button>
            <Button 
              variant="ghost" 
              onClick={handleDismiss}
              className="flex-1 sm:flex-none"
            >
              No Thanks
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// Compact install button for navigation bars
export function PWAInstallButton() {
  const { canInstall, isInstalled, install } = usePWAInstall()
  const [isInstalling, setIsInstalling] = useState(false)

  if (isInstalled || !canInstall) {
    return null
  }

  const handleInstall = async () => {
    setIsInstalling(true)
    try {
      await install()
    } catch (error) {
      console.error('PWA installation failed:', error)
    } finally {
      setIsInstalling(false)
    }
  }

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleInstall}
      disabled={isInstalling}
      className="flex items-center space-x-2"
    >
      <Download className="h-4 w-4" />
      <span className="hidden sm:inline">
        {isInstalling ? 'Installing...' : 'Install App'}
      </span>
    </Button>
  )
}

// PWA status indicator
export function PWAStatusIndicator() {
  const { isInstalled } = usePWAInstall()

  if (!isInstalled) {
    return null
  }

  return (
    <Badge variant="secondary" className="flex items-center space-x-1">
      <CheckCircle className="h-3 w-3 text-green-500" />
      <span>App Installed</span>
    </Badge>
  )
}
