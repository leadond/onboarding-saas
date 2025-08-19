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

import * as React from 'react'
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils/cn'

interface JsonEditorProps {
  value: any
  onChange: (value: any) => void
  height?: string
  placeholder?: string
  className?: string
}

export function JsonEditor({ 
  value, 
  onChange, 
  height = '200px', 
  placeholder = '', 
  className 
}: JsonEditorProps) {
  const [textValue, setTextValue] = React.useState('')
  const [error, setError] = React.useState('')

  React.useEffect(() => {
    try {
      const jsonString = JSON.stringify(value, null, 2)
      setTextValue(jsonString)
      setError('')
    } catch (err) {
      setTextValue('')
      setError('Invalid JSON value')
    }
  }, [value])

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value
    setTextValue(newValue)

    try {
      if (newValue.trim() === '') {
        onChange({})
        setError('')
        return
      }

      const parsedValue = JSON.parse(newValue)
      onChange(parsedValue)
      setError('')
    } catch (err) {
      setError('Invalid JSON format')
    }
  }

  return (
    <div className={cn('space-y-2', className)}>
      <Textarea
        value={textValue}
        onChange={handleChange}
        placeholder={placeholder}
        style={{ height }}
        className={cn(
          'font-mono text-sm',
          error && 'border-red-500 focus:border-red-500'
        )}
      />
      {error && (
        <p className="text-sm text-red-500">{error}</p>
      )}
    </div>
  )
}