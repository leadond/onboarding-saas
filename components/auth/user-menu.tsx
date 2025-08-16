'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  User,
  Settings,
  LogOut,
  CreditCard,
  HelpCircle,
  ChevronDown,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/hooks/use-auth'
import { useUser } from '@/hooks/use-user'
import { cn } from '@/lib/utils/cn'

interface UserMenuProps {
  className?: string
}

export function UserMenu({ className }: UserMenuProps) {
  const [isOpen, setIsOpen] = useState(false)
  const { signOut, loading } = useAuth()
  const { user } = useUser()

  if (!user) return null

  const handleSignOut = async () => {
    setIsOpen(false)
    await signOut()
  }

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  const displayName = user.fullName || user.email?.split('@')[0] || 'User'
  const initials = user.fullName
    ? getInitials(user.fullName)
    : displayName[0]?.toUpperCase() || 'U'

  return (
    <div className={cn('relative', className)}>
      <Button
        variant="ghost"
        className="flex h-auto items-center space-x-2 p-2"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex items-center space-x-2">
          {user.avatarUrl ? (
            <img
              src={user.avatarUrl}
              alt={displayName}
              className="h-8 w-8 rounded-full object-cover"
            />
          ) : (
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 text-sm font-medium text-white">
              {initials}
            </div>
          )}
          <div className="hidden flex-col items-start md:flex">
            <span className="text-sm font-medium text-gray-900">
              {displayName}
            </span>
            <span className="text-xs text-gray-500">{user.email}</span>
          </div>
        </div>
        <ChevronDown
          className={cn(
            'h-4 w-4 text-gray-400 transition-transform duration-200',
            isOpen && 'rotate-180'
          )}
        />
      </Button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />

          {/* Menu */}
          <div className="absolute right-0 top-full z-20 mt-2 w-64 rounded-lg border border-gray-200 bg-white py-2 shadow-lg">
            {/* User Info */}
            <div className="border-b border-gray-100 px-4 py-3">
              <div className="flex items-center space-x-3">
                {user.avatarUrl ? (
                  <img
                    src={user.avatarUrl}
                    alt={displayName}
                    className="h-10 w-10 rounded-full object-cover"
                  />
                ) : (
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-600 font-medium text-white">
                    {initials}
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-gray-900">
                    {displayName}
                  </p>
                  <p className="truncate text-xs text-gray-500">{user.email}</p>
                  {user.companyName && (
                    <p className="truncate text-xs text-gray-500">
                      {user.companyName}
                    </p>
                  )}
                </div>
              </div>

              {/* Subscription Status */}
              <div className="mt-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500">Plan:</span>
                  <span
                    className={cn(
                      'rounded-full px-2 py-1 text-xs font-medium',
                      user.subscriptionStatus === 'active'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-800'
                    )}
                  >
                    {user.subscriptionTier}
                  </span>
                </div>
              </div>
            </div>

            {/* Menu Items */}
            <div className="py-1">
              <Link
                href="/dashboard/profile"
                className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                onClick={() => setIsOpen(false)}
              >
                <User className="mr-3 h-4 w-4" />
                Profile Settings
              </Link>

              <Link
                href="/dashboard/billing"
                className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                onClick={() => setIsOpen(false)}
              >
                <CreditCard className="mr-3 h-4 w-4" />
                Billing & Plans
              </Link>

              <Link
                href="/dashboard/settings"
                className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                onClick={() => setIsOpen(false)}
              >
                <Settings className="mr-3 h-4 w-4" />
                Account Settings
              </Link>

              <Link
                href="/support"
                className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                onClick={() => setIsOpen(false)}
              >
                <HelpCircle className="mr-3 h-4 w-4" />
                Help & Support
              </Link>
            </div>

            {/* Sign Out */}
            <div className="border-t border-gray-100 py-1">
              <button
                onClick={handleSignOut}
                disabled={loading}
                className="flex w-full items-center px-4 py-2 text-sm text-red-700 hover:bg-red-50 disabled:opacity-50"
              >
                <LogOut className="mr-3 h-4 w-4" />
                {loading ? 'Signing out...' : 'Sign out'}
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

// Simplified version for mobile
export function UserMenuMobile({ className }: UserMenuProps) {
  const { user } = useUser()
  const { signOut, loading } = useAuth()

  if (!user) return null

  const displayName = user.fullName || user.email?.split('@')[0] || 'User'
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }
  const initials = user.fullName
    ? getInitials(user.fullName)
    : displayName[0]?.toUpperCase() || 'U'

  return (
    <div className={cn('space-y-4', className)}>
      {/* User Info */}
      <div className="flex items-center space-x-3 rounded-lg bg-gray-50 p-4">
        {user.avatarUrl ? (
          <img
            src={user.avatarUrl}
            alt={displayName}
            className="h-12 w-12 rounded-full object-cover"
          />
        ) : (
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-600 text-lg font-medium text-white">
            {initials}
          </div>
        )}
        <div className="min-w-0 flex-1">
          <p className="truncate text-base font-medium text-gray-900">
            {displayName}
          </p>
          <p className="truncate text-sm text-gray-500">{user.email}</p>
          {user.companyName && (
            <p className="truncate text-sm text-gray-500">{user.companyName}</p>
          )}
        </div>
      </div>

      {/* Menu Links */}
      <div className="space-y-2">
        <Link
          href="/dashboard/profile"
          className="flex items-center rounded-lg p-3 text-gray-700 hover:bg-gray-50"
        >
          <User className="mr-3 h-5 w-5" />
          Profile Settings
        </Link>

        <Link
          href="/dashboard/billing"
          className="flex items-center rounded-lg p-3 text-gray-700 hover:bg-gray-50"
        >
          <CreditCard className="mr-3 h-5 w-5" />
          Billing & Plans
        </Link>

        <Link
          href="/dashboard/settings"
          className="flex items-center rounded-lg p-3 text-gray-700 hover:bg-gray-50"
        >
          <Settings className="mr-3 h-5 w-5" />
          Account Settings
        </Link>

        <Link
          href="/support"
          className="flex items-center rounded-lg p-3 text-gray-700 hover:bg-gray-50"
        >
          <HelpCircle className="mr-3 h-5 w-5" />
          Help & Support
        </Link>

        <button
          onClick={() => signOut()}
          disabled={loading}
          className="flex w-full items-center rounded-lg p-3 text-red-700 hover:bg-red-50 disabled:opacity-50"
        >
          <LogOut className="mr-3 h-5 w-5" />
          {loading ? 'Signing out...' : 'Sign out'}
        </button>
      </div>
    </div>
  )
}
