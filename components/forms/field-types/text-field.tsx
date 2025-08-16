'use client'

import * as React from 'react'
import { useFormContext } from 'react-hook-form'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils/cn'
import type { FormFieldData } from '@/lib/validations/kit'

interface TextFieldProps {
  field: FormFieldData
  className?: string
  disabled?: boolean
}

export function TextField({
  field,
  className,
  disabled = false,
}: TextFieldProps) {
  const {
    register,
    formState: { errors },
    watch,
  } = useFormContext()

  const error = errors[field.id]
  const value = watch(field.id)

  // Determine input type based on field type
  const inputType =
    field.type === 'email' ? 'email' : field.type === 'phone' ? 'tel' : 'text'

  // Create validation rules
  const validationRules = {
    required: field.required ? `${field.label} is required` : false,
    ...(field.validation?.min_length && {
      minLength: {
        value: field.validation.min_length,
        message:
          field.validation.custom_message ||
          `Minimum ${field.validation.min_length} characters required`,
      },
    }),
    ...(field.validation?.max_length && {
      maxLength: {
        value: field.validation.max_length,
        message:
          field.validation.custom_message ||
          `Maximum ${field.validation.max_length} characters allowed`,
      },
    }),
    ...(field.validation?.pattern && {
      pattern: {
        value: new RegExp(field.validation.pattern),
        message: field.validation.custom_message || 'Invalid format',
      },
    }),
    ...(field.type === 'email' && {
      pattern: {
        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
        message: 'Invalid email address',
      },
    }),
    ...(field.type === 'phone' && {
      pattern: {
        value: /^[\+]?[1-9][\d]{0,15}$/,
        message: 'Invalid phone number',
      },
    }),
  }

  return (
    <div className={cn('space-y-2', className)}>
      <Label htmlFor={field.id} className="text-sm font-medium">
        {field.label}
        {field.required && <span className="ml-1 text-destructive">*</span>}
      </Label>

      <Input
        id={field.id}
        type={inputType}
        placeholder={field.placeholder}
        disabled={disabled}
        className={cn(
          error && 'border-destructive focus-visible:ring-destructive'
        )}
        {...register(field.id, validationRules)}
      />

      {error && (
        <p className="mt-1 text-sm text-destructive">
          {error.message as string}
        </p>
      )}

      {field.validation?.max_length && value?.length && (
        <p className="mt-1 text-xs text-muted-foreground">
          {value.length}/{field.validation.max_length} characters
        </p>
      )}
    </div>
  )
}
