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
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { cn } from '@/lib/utils/cn'
import type { HtmlForm } from '@/types'

interface HtmlFormRendererProps {
  htmlForm: HtmlForm
  onSubmit: (data: any) => void | Promise<void>
  defaultValues?: Record<string, any>
  isLoading?: boolean
  className?: string
  disabled?: boolean
}

// Create a dynamic validation schema based on HTML form fields
function createValidationSchema(htmlForm: HtmlForm) {
  const schemaFields: Record<string, z.ZodTypeAny> = {}

  // If field mappings are provided, use them to create validation schema
  if (htmlForm.field_mappings) {
    Object.entries(htmlForm.field_mappings).forEach(([htmlFieldName, standardFieldName]) => {
      // For HTML forms, we'll accept any string value by default
      // More sophisticated validation could be added based on field names or patterns
      schemaFields[standardFieldName] = z.string().optional()
    })
  } else {
    // If no field mappings, create a generic schema that accepts any form data
    schemaFields.formData = z.record(z.string(), z.any())
  }

  return z.object(schemaFields)
}

// Extract form field names from HTML content
function extractFormFieldNames(htmlContent: string): string[] {
  const fieldNames: string[] = []
  
  // Simple regex to find input, textarea, and select names
  const inputRegex = /<(?:input|textarea|select)\s[^>]*name\s*=\s*["']([^"']+)["'][^>]*>/gi
  let match
  
  while ((match = inputRegex.exec(htmlContent)) !== null) {
    fieldNames.push(match[1])
  }
  
  return [...new Set(fieldNames)] // Remove duplicates
}

export function HtmlFormRenderer({
  htmlForm,
  onSubmit,
  defaultValues = {},
  isLoading = false,
  className,
  disabled = false,
}: HtmlFormRendererProps) {
  const formRef = React.useRef<HTMLFormElement>(null)
  const [extractedFields, setExtractedFields] = React.useState<string[]>([])

  // Extract field names from HTML content on mount
  React.useEffect(() => {
    const fields = extractFormFieldNames(htmlForm.html_content)
    setExtractedFields(fields)
  }, [htmlForm.html_content])

  // Create validation schema
  const validationSchema = React.useMemo(
    () => createValidationSchema(htmlForm),
    [htmlForm]
  )

  // Initialize form
  const form = useForm({
    resolver: zodResolver(validationSchema),
    defaultValues,
    mode: 'onBlur',
  })

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    
    if (!formRef.current) return

    try {
      const formData = new FormData(formRef.current)
      const formDataObj: Record<string, any> = {}
      
      // Convert FormData to object
      for (const [key, value] of formData.entries()) {
        // Handle multiple values for the same name (checkboxes, multi-selects)
        if (formDataObj[key]) {
          if (Array.isArray(formDataObj[key])) {
            formDataObj[key].push(value)
          } else {
            formDataObj[key] = [formDataObj[key], value]
          }
        } else {
          formDataObj[key] = value
        }
      }

      // Apply field mappings if provided
      let processedData = formDataObj
      if (htmlForm.field_mappings) {
        processedData = {}
        Object.entries(htmlForm.field_mappings).forEach(([htmlFieldName, standardFieldName]) => {
          if (formDataObj[htmlFieldName] !== undefined) {
            processedData[standardFieldName] = formDataObj[htmlFieldName]
          }
        })
      }

      await onSubmit(processedData)
    } catch (error) {
      console.error('HTML form submission error:', error)
      throw error
    }
  }

  // Process HTML content to ensure it works with our form handler
  const processedHtmlContent = React.useMemo(() => {
    let html = htmlForm.html_content
    
    // Ensure form doesn't have its own form tags
    html = html.replace(/<form[^>]*>/gi, '').replace(/<\/form>/gi, '')
    
    // Ensure submit button has type="button" to prevent form submission
    html = html.replace(
      /<button\s+([^>]*?)type\s*=\s*["']submit["']([^>]*?)>/gi,
      '<button $1type="button"$2 data-html-form-submit>'
    )
    
    // Handle input type="submit" by converting to button
    html = html.replace(
      /<input\s+([^>]*?)type\s*=\s*["']submit["']([^>]*?)>/gi,
      '<button type="button" data-html-form-submit $1$2>Submit</button>'
    )
    
    return html
  }, [htmlForm.html_content])

  return (
    <div className={cn('space-y-6', className)}>
      {/* Custom CSS if provided */}
      {htmlForm.css_content && (
        <style dangerouslySetInnerHTML={{ __html: htmlForm.css_content }} />
      )}
      
      {/* HTML Form Content */}
      <form
        ref={formRef}
        onSubmit={handleSubmit}
        className="html-form-container"
        dangerouslySetInnerHTML={{ __html: processedHtmlContent }}
      />
      
      {/* Submit Button (if no submit button found in HTML) */}
      <div className="flex justify-end pt-6">
        <Button
          type="submit"
          disabled={disabled || isLoading}
          className="min-w-[120px]"
          onClick={(e) => {
            // Trigger form submission
            if (formRef.current) {
              const submitEvent = new Event('submit', { bubbles: true, cancelable: true })
              formRef.current.dispatchEvent(submitEvent)
            }
          }}
        >
          {isLoading ? (
            <>
              <LoadingSpinner size="sm" className="mr-2" />
              Submitting...
            </>
          ) : (
            htmlForm.submit_button_text || 'Submit'
          )}
        </Button>
      </div>
    </div>
  )
}

// Hook to get HTML form field errors for external display
export function useHtmlFormRenderer() {
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