/*
 * Copyright (c) 2024 [Your Company Name]. All rights reserved.
 * 
 * PROPRIETARY AND CONFIDENTIAL
 * 
 * This software contains proprietary and confidential information.
 * Unauthorized copying, distribution, or use is strictly prohibited.
 * 
 * For licensing information, contact: [your-email@domain.com]
 */

'use client'

import * as React from 'react'
import { useFormContext, Controller } from 'react-hook-form'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils/cn'
import type { FormFieldData } from '@/lib/validations/kit'

interface RadioFieldProps {
  field: FormFieldData
  className?: string
  disabled?: boolean
}

export function RadioField({
  field,
  className,
  disabled = false,
}: RadioFieldProps) {
  const {
    control,
    formState: { errors },
  } = useFormContext()

  const error = errors[field.id]

  return (
    <div className={cn('space-y-3', className)}>
      <Label className="text-sm font-medium">
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
          <div className="space-y-2">
            {field.options?.map((option, index) => (
              <div
                key={`${field.id}-${index}`}
                className="flex items-center space-x-2"
              >
                <input
                  type="radio"
                  id={`${field.id}-${index}`}
                  name={field.id}
                  value={option}
                  checked={controllerField.value === option}
                  onChange={() => controllerField.onChange(option)}
                  disabled={disabled}
                  className="h-4 w-4 border-gray-300 text-primary focus:ring-2 focus:ring-primary"
                />
                <Label
                  htmlFor={`${field.id}-${index}`}
                  className="cursor-pointer text-sm font-normal"
                >
                  {option}
                </Label>
              </div>
            ))}
          </div>
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
