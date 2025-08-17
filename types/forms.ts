// Form data types for Onboard Hero

export interface StepContent {
  instructions?: string
  video_url?: string
  upload_config?: {
    max_file_size: number
    allowed_types: string[]
    max_files: number
  }
  payment_config?: {
    amount: string
    description: string
    currency: string
  }
  form_fields?: Array<{
    id: string
    type: string
    label: string
    required: boolean
    options?: string[]
  }>
  [key: string]: any
}

export interface FormData {
  title: string
  description: string
  step_type: string
  content: StepContent
  is_required: boolean
  order_index: number
}

export interface KitFormData {
  title: string
  description: string
  is_published: boolean
  settings?: {
    theme?: string
    branding?: any
    notifications?: any
  }
}

export interface UserProfileData {
  full_name: string
  company_name: string
  email: string
  avatar_url?: string
  settings?: any
}
