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

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

interface UserProfile {
  role: string
}

export default function TeamsPage() {
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchUserProfile()
  }, [])

  const fetchUserProfile = async () => {
    try {
      const response = await fetch('/api/user/profile')
      const result = await response.json()
      
      if (result.success && result.data?.user) {
        setProfile(result.data.user)
      }
    } catch (error) {
      console.error('Error fetching profile:', error)
    } finally {
      setLoading(false)
    }
  }

  const canCreateTeams = profile && ['super_user', 'admin', 'super_admin', 'global_admin'].includes(profile.role)

  return (
    <div className="p-8 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Teams</h1>
          <p className="text-gray-600">
            Collaborate with your team members on onboarding projects
          </p>
        </div>
        {canCreateTeams ? (
          <Button>Create Team</Button>
        ) : (
          <div className="flex items-center space-x-2">
            <Badge variant="secondary">Super User+ Required</Badge>
            <Button disabled>Create Team</Button>
          </div>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Team Collaboration</CardTitle>
          <CardDescription>
            Team management features are coming soon. You'll be able to create teams, invite members, and collaborate on onboarding kits.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
              <span className="text-2xl">🏢</span>
            </div>
            <h3 className="mb-2 text-lg font-medium text-gray-900">
              Coming Soon
            </h3>
            <p className="text-gray-600">
              Team collaboration features are being developed.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}