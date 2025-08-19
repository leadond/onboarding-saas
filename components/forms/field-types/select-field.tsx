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
import { useFormContext, Controller } from 'react-hook-form'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils/cn'
import type { FormFieldData } from '@/lib/validations/kit'

interface SelectFieldProps {
  field: FormFieldData
  className?: string
  disabled?: boolean
}

export function SelectField({
  field,
  className,
  disabled = false,
}: SelectFieldProps) {
  const {
    control,
    formState: { errors },
  } = useFormContext()

  const error = errors[field.id]

  return (
    <div className={cn('space-y-2', className)}>
      <Label htmlFor={field.id} className="text-sm font-medium">
        {field.label}
        {field.required && <span className="ml-1 text-destructive">*</span>}
      </Label>

      <Controller
        name={field.id}
        control={control}
        rules={{
          required: field.required ? `${field.label} is required` : false,
        }}
        render={({ field: controllerField }) => (
          <Select
            onValueChange={controllerField.onChange}
            value={controllerField.value || ''}
            disabled={disabled}
          >
            <SelectTrigger
              className={cn(
                error && 'border-destructive focus:ring-destructive'
              )}
            >
              <SelectValue
                placeholder={
                  field.placeholder || `Select ${field.label.toLowerCase()}`
                }
              />
            </SelectTrigger>
            <SelectContent>
              {field.options?.map(option => (
                <SelectItem key={option} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      />

      {error && (
        <p className="mt-1 text-sm text-destructive">
          {error.message as string}
        </p>
      )}
    </div>
  )
}
