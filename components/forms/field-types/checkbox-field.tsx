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
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils/cn'
import type { FormFieldData } from '@/lib/validations/kit'

interface CheckboxFieldProps {
  field: FormFieldData
  className?: string
  disabled?: boolean
}

export function CheckboxField({
  field,
  className,
  disabled = false,
}: CheckboxFieldProps) {
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

      <div className="space-y-2">
        {field.options?.map((option, index) => (
          <Controller
            key={`${field.id}-${index}`}
            name={`${field.id}[${index}]`}
            control={control}
            rules={{
              required:
                field.required && index === 0
                  ? `${field.label} is required`
                  : false,
            }}
            render={({ field: controllerField }) => (
              <div className="flex items-center space-x-2">
                <Checkbox
                  id={`${field.id}-${index}`}
                  checked={controllerField.value || false}
                  onCheckedChange={checked => {
                    controllerField.onChange(checked)
                  }}
                  disabled={disabled}
                />
                <Label
                  htmlFor={`${field.id}-${index}`}
                  className="cursor-pointer text-sm font-normal"
                >
                  {option}
                </Label>
              </div>
            )}
          />
        ))}
      </div>

      {error && (
        <p className="mt-1 text-sm text-destructive">
          {error.message as string}
        </p>
      )}
    </div>
  )
}
