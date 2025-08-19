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

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const [userRole, setUserRole] = useState<string>('')

  useEffect(() => {
    fetchUserRole()
  }, [])

  const fetchUserRole = async () => {
    try {
      const response = await fetch('/api/user/profile')
      const result = await response.json()
      
      if (result.success && result.data?.user) {
        setUserRole(result.data.user.role)
      }
    } catch (error) {
      console.error('Error fetching user role:', error)
    }
  }

  const isAdmin = ['admin', 'super_admin', 'global_admin'].includes(userRole)
  const canSeeBilling = ['super_admin', 'global_admin'].includes(userRole)

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary-50/20 to-background relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-gradient-mesh opacity-10"></div>
      
      {/* Color Line Separator - Top */}
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary-500 via-primary-600 to-primary-700"></div>
      
      <div className="flex relative z-10">
        {/* Sidebar */}
        <aside className="min-h-screen w-72 border-r border-border/50 bg-card/80 backdrop-blur-sm shadow-soft">
          {/* Logo Section */}
          <div className="p-8 border-b border-border/50">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-primary-600 to-primary-700 bg-clip-text text-transparent">
              Onboard Hero
            </h1>
          </div>
          
          {/* Color Line Separator */}
          <div className="w-full h-px bg-gradient-to-r from-transparent via-primary-200 to-transparent"></div>
          
          {/* Navigation */}
          <nav className="p-6">
            <div className="space-y-3">
              {[
                { href: '/dashboard', label: 'Dashboard', icon: '📊' },
                { href: '/dashboard/clients', label: 'Clients', icon: '👥' },
                { href: '/dashboard/kits', label: 'Kits', icon: '📦' },
                { href: '/dashboard/teams', label: 'Teams', icon: '🏢' },
                { href: '/dashboard/analytics', label: 'Analytics', icon: '📈' },
                { href: '/dashboard/integrations', label: 'Integrations', icon: '🔗' },
                { href: '/dashboard/branding', label: 'Branding', icon: '🎨' },
                ...(canSeeBilling ? [{ href: '/dashboard/billing', label: 'Billing', icon: '💳' }] : []),
                ...(isAdmin ? [{ href: '/dashboard/users', label: 'Users', icon: '👤' }] : []),
                { href: '/dashboard/settings', label: 'Settings', icon: '⚙️' },
              ].map((item, index) => (
                <div key={item.href}>
                  <Link
                    href={item.href}
                    className="group flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-foreground hover:bg-primary-50 hover:text-primary-700 transition-all duration-200 hover:shadow-sm"
                  >
                    <span className="text-lg group-hover:scale-110 transition-transform duration-200">
                      {item.icon}
                    </span>
                    {item.label}
                  </Link>
                  {index === 0 && (
                    <div className="my-3 w-full h-px bg-gradient-to-r from-transparent via-primary-200 to-transparent"></div>
                  )}
                  {index === 4 && (
                    <div className="my-3 w-full h-px bg-gradient-to-r from-transparent via-secondary-200 to-transparent"></div>
                  )}
                </div>
              ))}
            </div>
          </nav>
        </aside>

        {/* Vertical Color Line Separator */}
        <div className="w-1 bg-gradient-to-b from-primary-500 via-primary-600 to-primary-700"></div>

        {/* Main Content */}
        <main className="flex-1 relative">
          {children}
        </main>
      </div>
      
      {/* Color Line Separator - Bottom */}
      <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-primary-700 via-primary-600 to-primary-500"></div>
    </div>
  )
}
