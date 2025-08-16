'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  WifiOff,
  RefreshCw,
  Smartphone,
  Monitor,
  Cloud,
  Download,
  CheckCircle,
  Clock,
  AlertCircle
} from 'lucide-react'



export default function OfflinePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full space-y-6">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="mx-auto w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center">
            <WifiOff className="h-10 w-10 text-blue-600" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">You're Offline</h1>
            <p className="text-lg text-gray-600">
              Don't worry! OnboardKit works offline with limited functionality.
            </p>
          </div>
        </div>

        {/* Connection Status */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <AlertCircle className="h-5 w-5 text-amber-500" />
              <span>Connection Status</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">
                  No internet connection detected. Some features may be limited.
                </p>
              </div>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => window.location.reload()}
                className="flex items-center space-x-2"
              >
                <RefreshCw className="h-4 w-4" />
                <span>Retry</span>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Available Features */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              <span>Available Offline</span>
            </CardTitle>
            <CardDescription>
              These features work without an internet connection
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                <div>
                  <h4 className="font-medium">View Cached Kits</h4>
                  <p className="text-sm text-gray-600">Access recently viewed onboarding kits</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                <div>
                  <h4 className="font-medium">Draft Mode</h4>
                  <p className="text-sm text-gray-600">Create and edit kits locally</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                <div>
                  <h4 className="font-medium">Offline Analytics</h4>
                  <p className="text-sm text-gray-600">View cached analytics data</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                <div>
                  <h4 className="font-medium">Form Drafts</h4>
                  <p className="text-sm text-gray-600">Save form progress locally</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Limited Features */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Clock className="h-5 w-5 text-amber-500" />
              <span>Limited Offline</span>
            </CardTitle>
            <CardDescription>
              These features will sync when you're back online
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-amber-500 rounded-full mt-2"></div>
                <div>
                  <h4 className="font-medium">Form Submissions</h4>
                  <p className="text-sm text-gray-600">Saved locally, will sync automatically</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-amber-500 rounded-full mt-2"></div>
                <div>
                  <h4 className="font-medium">File Uploads</h4>
                  <p className="text-sm text-gray-600">Queued for upload when online</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-amber-500 rounded-full mt-2"></div>
                <div>
                  <h4 className="font-medium">Analytics Events</h4>
                  <p className="text-sm text-gray-600">Tracked locally, will sync later</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-amber-500 rounded-full mt-2"></div>
                <div>
                  <h4 className="font-medium">Real-time Updates</h4>
                  <p className="text-sm text-gray-600">Will resume when connection returns</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* PWA Features */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Smartphone className="h-5 w-5 text-blue-500" />
              <span>Progressive Web App</span>
            </CardTitle>
            <CardDescription>
              OnboardKit works like a native app on all devices
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2 mb-4">
              <Badge variant="secondary" className="flex items-center space-x-1">
                <Monitor className="h-3 w-3" />
                <span>Desktop</span>
              </Badge>
              <Badge variant="secondary" className="flex items-center space-x-1">
                <Smartphone className="h-3 w-3" />
                <span>Mobile</span>
              </Badge>
              <Badge variant="secondary" className="flex items-center space-x-1">
                <Cloud className="h-3 w-3" />
                <span>Offline Ready</span>
              </Badge>
              <Badge variant="secondary" className="flex items-center space-x-1">
                <Download className="h-3 w-3" />
                <span>Installable</span>
              </Badge>
            </div>
            
            <div className="text-sm text-gray-600 space-y-2">
              <p>
                • Install OnboardKit on your device for quick access
              </p>
              <p>
                • Receive push notifications for important updates
              </p>
              <p>
                • Automatic background sync when connection returns
              </p>
              <p>
                • Optimized for mobile and desktop experiences
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button 
            onClick={() => window.location.href = '/dashboard'}
            className="flex items-center space-x-2"
          >
            <CheckCircle className="h-4 w-4" />
            <span>Continue Offline</span>
          </Button>
          
          <Button 
            variant="outline"
            onClick={() => window.location.reload()}
            className="flex items-center space-x-2"
          >
            <RefreshCw className="h-4 w-4" />
            <span>Check Connection</span>
          </Button>
        </div>

        {/* Footer */}
        <div className="text-center text-sm text-gray-500">
          <p>
            Your data is safe and will sync automatically when you're back online.
          </p>
        </div>
      </div>
    </div>
  )
}