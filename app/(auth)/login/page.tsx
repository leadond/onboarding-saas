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

import { LoginForm } from '@/components/auth/login-form'

export default function LoginPage() {
  return (
    <div className="min-h-screen flex">
      {/* Left Sidebar - Interactive Experience */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-purple-600 via-purple-700 to-indigo-800 relative overflow-hidden">
        <div className="absolute inset-0 bg-black/20" />
        
        {/* Animated Background Elements */}
        <div className="absolute inset-0">
          <div className="absolute top-20 left-20 w-32 h-32 bg-white/10 rounded-full animate-pulse" />
          <div className="absolute top-40 right-16 w-24 h-24 bg-white/5 rounded-full animate-bounce" style={{animationDelay: '1s'}} />
          <div className="absolute bottom-32 left-16 w-20 h-20 bg-white/15 rounded-full animate-pulse" style={{animationDelay: '2s'}} />
          <div className="absolute bottom-20 right-32 w-16 h-16 bg-white/8 rounded-full animate-bounce" style={{animationDelay: '0.5s'}} />
        </div>
        
        <div className="relative z-10 flex flex-col justify-center px-12 py-16 text-white">
          <div className="max-w-md space-y-8">
            {/* Welcome Message */}
            <div className="text-center">
              <div className="text-6xl mb-4 animate-bounce">👋</div>
              <h1 className="text-3xl font-bold mb-2">
                <span className="bg-gradient-to-r from-white to-purple-200 bg-clip-text text-transparent">
                  Welcome Back!
                </span>
              </h1>
              <p className="text-purple-100 text-lg">
                Ready to create amazing onboarding experiences?
              </p>
            </div>
            
            {/* Interactive Stats */}
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
              <h3 className="text-lg font-semibold mb-4 text-center">🚀 Your Impact Dashboard</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-purple-100">Users Onboarded</span>
                  <span className="font-bold text-xl">2,847</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-purple-100">Success Rate</span>
                  <span className="font-bold text-xl text-green-300">94%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-purple-100">Time Saved</span>
                  <span className="font-bold text-xl">156hrs</span>
                </div>
              </div>
            </div>
            
            {/* Quick Tips */}
            <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
              <h3 className="text-lg font-semibold mb-4 flex items-center">
                <span className="mr-2">💡</span>
                Today's Tip
              </h3>
              <p className="text-purple-100 leading-relaxed">
                "Users who complete interactive tutorials are 3x more likely to become power users. Try adding micro-interactions to your flows!"
              </p>
            </div>
            
            {/* Status Indicator */}
            <div className="flex items-center justify-center space-x-2 text-sm">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              <span className="text-purple-100">All systems operational</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="flex-1 flex items-center justify-center bg-gradient-to-br from-background via-muted/20 to-background p-4">
        <div className="w-full max-w-md">
          <LoginForm />
        </div>
      </div>
    </div>
  )
}