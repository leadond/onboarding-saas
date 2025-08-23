'use client'

import { useState, useCallback } from 'react'

export function useLoading(initialState = false) {
  const [loading, setLoading] = useState(initialState)

  const startLoading = useCallback(() => setLoading(true), [])
  const stopLoading = useCallback(() => setLoading(false), [])
  
  const withLoading = useCallback(async <T>(asyncFn: () => Promise<T>): Promise<T> => {
    startLoading()
    try {
      const result = await asyncFn()
      return result
    } finally {
      stopLoading()
    }
  }, [startLoading, stopLoading])

  return {
    loading,
    startLoading,
    stopLoading,
    withLoading,
    setLoading
  }
}