'use client'

import useSWR, { mutate } from 'swr'
import { useState } from 'react'
import type {
  KitStepFormData,
  StepUpdateData,
  StepReorderData,
} from '@/lib/validations/kit'
import type { Tables } from '@/lib/supabase/database.types'

type Step = Tables<'kit_steps'>

type StepsResponse = {
  success: boolean
  data: Step[]
}

type StepResponse = {
  success: boolean
  data: Step
}

// Fetcher function for SWR
const fetcher = async (url: string) => {
  const response = await fetch(url)
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`)
  }
  return response.json()
}

// Hook for getting steps for a specific kit
export function useSteps(kitId: string | null) {
  const {
    data,
    error,
    isLoading,
    mutate: refetch,
  } = useSWR<StepsResponse>(kitId ? `/api/kits/${kitId}/steps` : null, fetcher)

  return {
    steps: data?.data || [],
    isLoading,
    error,
    refetch,
  }
}

// Hook for getting a single step
export function useStep(kitId: string | null, stepId: string | null) {
  const {
    data,
    error,
    isLoading,
    mutate: refetch,
  } = useSWR<StepResponse>(
    kitId && stepId ? `/api/kits/${kitId}/steps/${stepId}` : null,
    fetcher
  )

  return {
    step: data?.data || null,
    isLoading,
    error,
    refetch,
  }
}

// Hook for step CRUD operations
export function useStepOperations() {
  const [isCreating, setIsCreating] = useState(false)
  const [isUpdating, setIsUpdating] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [isReordering, setIsReordering] = useState(false)

  const createStep = async (
    kitId: string,
    stepData: KitStepFormData
  ): Promise<Step> => {
    setIsCreating(true)
    try {
      const response = await fetch(`/api/kits/${kitId}/steps`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(stepData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to create step')
      }

      const result = await response.json()

      // Invalidate caches
      mutate(`/api/kits/${kitId}/steps`)
      mutate(`/api/kits/${kitId}`) // Also invalidate kit cache to update step count

      return result.data
    } catch (error) {
      console.error('Error creating step:', error)
      throw error
    } finally {
      setIsCreating(false)
    }
  }

  const updateStep = async (
    kitId: string,
    stepId: string,
    stepData: Partial<StepUpdateData>
  ): Promise<Step> => {
    setIsUpdating(true)
    try {
      const response = await fetch(`/api/kits/${kitId}/steps/${stepId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(stepData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to update step')
      }

      const result = await response.json()

      // Invalidate caches
      mutate(`/api/kits/${kitId}/steps`)
      mutate(`/api/kits/${kitId}/steps/${stepId}`)
      mutate(`/api/kits/${kitId}`)

      return result.data
    } catch (error) {
      console.error('Error updating step:', error)
      throw error
    } finally {
      setIsUpdating(false)
    }
  }

  const deleteStep = async (kitId: string, stepId: string): Promise<void> => {
    setIsDeleting(true)
    try {
      const response = await fetch(`/api/kits/${kitId}/steps/${stepId}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to delete step')
      }

      // Invalidate caches
      mutate(`/api/kits/${kitId}/steps`)
      mutate(`/api/kits/${kitId}/steps/${stepId}`, undefined, false)
      mutate(`/api/kits/${kitId}`)
    } catch (error) {
      console.error('Error deleting step:', error)
      throw error
    } finally {
      setIsDeleting(false)
    }
  }

  const reorderSteps = async (
    kitId: string,
    reorderData: StepReorderData
  ): Promise<Step[]> => {
    setIsReordering(true)
    try {
      const response = await fetch(`/api/kits/${kitId}/steps/reorder`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(reorderData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to reorder steps')
      }

      const result = await response.json()

      // Invalidate caches
      mutate(`/api/kits/${kitId}/steps`)
      mutate(`/api/kits/${kitId}`)

      return result.data
    } catch (error) {
      console.error('Error reordering steps:', error)
      throw error
    } finally {
      setIsReordering(false)
    }
  }

  return {
    createStep,
    updateStep,
    deleteStep,
    reorderSteps,
    isCreating,
    isUpdating,
    isDeleting,
    isReordering,
  }
}

// Hook for step validation and content helpers
export function useStepValidation() {
  const validateStepContent = (stepType: string, content: any): string[] => {
    const errors: string[] = []

    switch (stepType) {
      case 'welcome_message':
        if (!content?.instructions || content.instructions.trim() === '') {
          errors.push('Welcome message content is required')
        }
        break

      case 'welcome_video':
        if (!content?.video_url && !content?.instructions) {
          errors.push('Either video URL or instructions are required')
        }
        if (content?.video_url && !isValidUrl(content.video_url)) {
          errors.push('Please provide a valid video URL')
        }
        break

      case 'intake_form':
        if (!content?.form_fields || content.form_fields.length === 0) {
          errors.push('At least one form field is required')
        } else {
          content.form_fields.forEach((field: any, index: number) => {
            if (!field.label || field.label.trim() === '') {
              errors.push(`Field ${index + 1}: Label is required`)
            }
            if (
              field.type === 'select' &&
              (!field.options || field.options.length === 0)
            ) {
              errors.push(`Field ${index + 1}: Select field must have options`)
            }
          })
        }
        break

      case 'file_upload':
        if (!content?.upload_config) {
          errors.push('Upload configuration is required')
        } else {
          const config = content.upload_config
          if (!config.accepted_types || config.accepted_types.length === 0) {
            errors.push('At least one accepted file type is required')
          }
          if (!config.max_files || config.max_files < 1) {
            errors.push('Maximum file count must be at least 1')
          }
          if (!config.max_file_size || config.max_file_size < 1024) {
            errors.push('Maximum file size must be at least 1KB')
          }
        }
        break

      case 'contract_signing':
        if (!content?.contract_template) {
          errors.push('Contract template is required')
        } else {
          const template = content.contract_template
          if (!template.template_id || template.template_id.trim() === '') {
            errors.push('Contract template ID is required')
          }
          if (!template.title || template.title.trim() === '') {
            errors.push('Contract title is required')
          }
        }
        break

      case 'scheduling':
        if (!content?.calendar_config) {
          errors.push('Calendar configuration is required')
        } else {
          const config = content.calendar_config
          if (!config.provider) {
            errors.push('Calendar provider is required')
          }
          if (!config.duration || config.duration < 15) {
            errors.push('Meeting duration must be at least 15 minutes')
          }
        }
        break

      case 'payment':
        if (!content?.payment_config) {
          errors.push('Payment configuration is required')
        } else {
          const config = content.payment_config
          if (!config.amount || config.amount <= 0) {
            errors.push('Payment amount must be greater than 0')
          }
          if (!config.currency || config.currency.length !== 3) {
            errors.push('Valid currency code is required')
          }
          if (!config.description || config.description.trim() === '') {
            errors.push('Payment description is required')
          }
        }
        break

      case 'confirmation':
        // Confirmation steps are usually just text-based
        if (!content?.instructions || content.instructions.trim() === '') {
          errors.push('Confirmation message is required')
        }
        break

      default:
        errors.push('Unknown step type')
    }

    return errors
  }

  const isValidUrl = (url: string): boolean => {
    try {
      new URL(url)
      return true
    } catch {
      return false
    }
  }

  const getStepTypeDisplayName = (stepType: string): string => {
    const displayNames: Record<string, string> = {
      welcome_message: 'Welcome Message',
      welcome_video: 'Welcome Video',
      intake_form: 'Intake Form',
      file_upload: 'File Upload',
      contract_signing: 'Contract Signing',
      scheduling: 'Scheduling',
      payment: 'Payment',
      confirmation: 'Confirmation',
    }
    return displayNames[stepType] || stepType
  }

  const getStepTypeDescription = (stepType: string): string => {
    const descriptions: Record<string, string> = {
      welcome_message: 'Display a welcome message to clients',
      welcome_video: 'Show a welcome video or message',
      intake_form: 'Collect information from clients with a custom form',
      file_upload: 'Allow clients to upload files and documents',
      contract_signing: 'Enable clients to sign contracts electronically',
      scheduling: 'Let clients schedule meetings or appointments',
      payment: 'Collect payments from clients',
      confirmation: 'Display confirmation and next steps',
    }
    return descriptions[stepType] || ''
  }

  return {
    validateStepContent,
    getStepTypeDisplayName,
    getStepTypeDescription,
  }
}

// Export types for use in components
export type { Step, StepsResponse, StepResponse }
