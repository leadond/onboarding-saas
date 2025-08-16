'use client'

import * as React from 'react'
import { useForm, FormProvider } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
  TextField,
  TextareaField,
  SelectField,
  CheckboxField,
  RadioField,
  DateField,
} from '@/components/forms/field-types'
import { Button } from '@/components/ui/button'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { cn } from '@/lib/utils/cn'
import type { FormFieldData } from '@/lib/validations/kit'

interface FormRendererProps {
  fields: FormFieldData[]
  onSubmit: (data: any) => void | Promise<void>
  defaultValues?: Record<string, any>
  isLoading?: boolean
  submitText?: string
  className?: string
  disabled?: boolean
}

// Create dynamic validation schema based on form fields
function createValidationSchema(fields: FormFieldData[]) {
  const schemaFields: Record<string, z.ZodTypeAny> = {}

  fields.forEach(field => {
    let fieldSchema: z.ZodTypeAny

    switch (field.type) {
      case 'email':
        fieldSchema = z.string().email('Invalid email address')
        break
      case 'phone':
        fieldSchema = z
          .string()
          .regex(/^[\+]?[1-9][\d]{0,15}$/, 'Invalid phone number')
        break
      case 'date':
        fieldSchema = z.string().min(1, 'Date is required')
        break
      case 'select':
      case 'radio':
        fieldSchema = z.string().min(1, `${field.label} is required`)
        break
      case 'checkbox':
        // For checkbox arrays
        fieldSchema = z.array(z.boolean()).optional()
        break
      default:
        fieldSchema = z.string()
    }

    // Apply validation rules
    if (field.validation) {
      const { min_length, max_length, pattern } = field.validation

      if (field.type !== 'checkbox') {
        if (min_length) {
          fieldSchema = (fieldSchema as z.ZodString).min(
            min_length,
            field.validation.custom_message ||
              `Minimum ${min_length} characters required`
          )
        }
        if (max_length) {
          fieldSchema = (fieldSchema as z.ZodString).max(
            max_length,
            field.validation.custom_message ||
              `Maximum ${max_length} characters allowed`
          )
        }
        if (pattern) {
          fieldSchema = (fieldSchema as z.ZodString).regex(
            new RegExp(pattern),
            field.validation.custom_message || 'Invalid format'
          )
        }
      }
    }

    // Make field optional if not required
    if (!field.required) {
      fieldSchema = fieldSchema.optional()
    }

    schemaFields[field.id] = fieldSchema
  })

  return z.object(schemaFields)
}

// Render individual field component based on type
function renderField(field: FormFieldData, disabled: boolean) {
  const commonProps = {
    field,
    disabled,
    className: 'mb-6',
  }

  switch (field.type) {
    case 'text':
    case 'email':
    case 'phone':
      return <TextField key={field.id} {...commonProps} />

    case 'textarea':
      return <TextareaField key={field.id} {...commonProps} />

    case 'select':
      return <SelectField key={field.id} {...commonProps} />

    case 'checkbox':
      return <CheckboxField key={field.id} {...commonProps} />

    case 'radio':
      return <RadioField key={field.id} {...commonProps} />

    case 'date':
      return <DateField key={field.id} {...commonProps} />

    default:
      console.warn(`Unknown field type: ${field.type}`)
      return null
  }
}

export function FormRenderer({
  fields,
  onSubmit,
  defaultValues = {},
  isLoading = false,
  submitText = 'Submit',
  className,
  disabled = false,
}: FormRendererProps) {
  // Sort fields by order
  const sortedFields = React.useMemo(
    () => [...fields].sort((a, b) => a.order - b.order),
    [fields]
  )

  // Create validation schema
  const validationSchema = React.useMemo(
    () => createValidationSchema(sortedFields),
    [sortedFields]
  )

  // Initialize form
  const form = useForm({
    resolver: zodResolver(validationSchema),
    defaultValues,
    mode: 'onBlur',
  })

  const handleSubmit = form.handleSubmit(async data => {
    try {
      await onSubmit(data)
    } catch (error) {
      console.error('Form submission error:', error)
    }
  })

  return (
    <FormProvider {...form}>
      <form
        onSubmit={handleSubmit}
        className={cn('space-y-6', className)}
        noValidate
      >
        {sortedFields.map(field => renderField(field, disabled || isLoading))}

        <div className="flex justify-end pt-6">
          <Button
            type="submit"
            disabled={disabled || isLoading}
            className="min-w-[120px]"
          >
            {isLoading ? (
              <>
                <LoadingSpinner size="sm" className="mr-2" />
                Submitting...
              </>
            ) : (
              submitText
            )}
          </Button>
        </div>
      </form>
    </FormProvider>
  )
}

// Hook to get form field errors for external display
export function useFormRenderer() {
  const [isSubmitting, setIsSubmitting] = React.useState(false)

  const submitForm = async (
    onSubmit: (data: any) => void | Promise<void>,
    data: any
  ) => {
    setIsSubmitting(true)
    try {
      await onSubmit(data)
    } catch (error) {
      throw error
    } finally {
      setIsSubmitting(false)
    }
  }

  return {
    isSubmitting,
    submitForm,
  }
}
