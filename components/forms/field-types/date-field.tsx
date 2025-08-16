'use client'

import * as React from 'react'
import { useFormContext, Controller } from 'react-hook-form'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils/cn'
import type { FormFieldData } from '@/lib/validations/kit'

interface DateFieldProps {
  field: FormFieldData
  className?: string
  disabled?: boolean
}

export function DateField({
  field,
  className,
  disabled = false,
}: DateFieldProps) {
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
          <Input
            id={field.id}
            type="date"
            disabled={disabled}
            className={cn(
              error && 'border-destructive focus-visible:ring-destructive'
            )}
            value={controllerField.value || ''}
            onChange={controllerField.onChange}
          />
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
