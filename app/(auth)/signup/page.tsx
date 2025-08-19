'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from '@/components/ui/use-toast'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function SignupPage() {
  const router = useRouter()

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Create Account</CardTitle>
          <CardDescription>
            Sign up for a new account to get started
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <div className="p-6 bg-yellow-50 border border-yellow-200 rounded-lg">
            <h3 className="font-semibold text-yellow-800 mb-2">Account Creation Disabled</h3>
            <p className="text-yellow-700 text-sm mb-4">
              Public signup is currently disabled. Please contact your administrator to create an account for you.
            </p>
            <p className="text-xs text-yellow-600">
              If you already have an account, you can sign in below.
            </p>
          </div>
          <Button 
            onClick={() => router.push('/login')} 
            className="w-full"
          >
            Go to Sign In
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}