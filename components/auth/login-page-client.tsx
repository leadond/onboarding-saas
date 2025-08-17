'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { LoginForm } from '@/components/auth/login-form'

export function LoginPageClient() {
  const searchParams = useSearchParams()
  const [initialError, setInitialError] = useState<string | null>(null)

  useEffect(() => {
    const error = searchParams.get('error')
    if (error) {
      setInitialError(error)
    }
  }, [searchParams])

  return <LoginForm initialError={initialError} />
}