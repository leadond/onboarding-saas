// Database Types (will be generated from Supabase)
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

// User & Authentication Types
export interface User {
  id: string
  email: string
  full_name?: string
  company_name?: string
  avatar_url?: string
  subscription_status: 'active' | 'canceled' | 'past_due' | 'unpaid'
  stripe_customer_id?: string
  subscription_tier: 'free' | 'starter' | 'pro' | 'enterprise'
  created_at: string
  updated_at: string
}

// Kit & Step Types
export type StepType =
  | 'welcome_message'
  | 'welcome_video'
  | 'intake_form'
  | 'file_upload'
  | 'contract_signing'
  | 'scheduling'
  | 'payment'
  | 'confirmation'

export type KitStatus = 'draft' | 'published' | 'archived'

export interface Kit {
  id: string
  user_id: string
  name: string
  slug: string
  description?: string
  welcome_message?: string
  brand_color: string
  logo_url?: string
  status: KitStatus
  is_template: boolean
  completion_redirect_url?: string
  custom_domain?: string
  created_at: string
  updated_at: string
  steps?: KitStep[]
}

export interface KitStep {
  id: string
  kit_id: string
  step_order: number
  step_type: StepType
  title: string
  description?: string
  content: StepContent
  is_required: boolean
  is_active: boolean
  settings: StepSettings
  created_at: string
  updated_at: string
}

// Step Content Types
export interface StepContent {
  instructions?: string
  video_url?: string
  form_fields?: FormField[]
  upload_config?: UploadConfig
  contract_template?: ContractTemplate
  calendar_config?: CalendarConfig
  payment_config?: PaymentConfig
}

export interface FormField {
  id: string
  type:
    | 'text'
    | 'email'
    | 'phone'
    | 'textarea'
    | 'select'
    | 'checkbox'
    | 'radio'
    | 'date'
    | 'file'
  label: string
  placeholder?: string
  required: boolean
  options?: string[]
  validation?: FieldValidation
  order: number
}

export interface FieldValidation {
  min_length?: number
  max_length?: number
  pattern?: string
  custom_message?: string
}

export interface UploadConfig {
  max_files: number
  max_file_size: number
  accepted_types: string[]
  description?: string
}

export interface ContractTemplate {
  template_id: string
  title: string
  description?: string
  fields: ContractField[]
}

export interface ContractField {
  name: string
  type: 'text' | 'signature' | 'date' | 'checkbox'
  required: boolean
  tab_label?: string
}

export interface CalendarConfig {
  provider: 'google' | 'calendly' | 'outlook'
  calendar_id?: string
  duration: number
  buffer_time?: number
  available_times?: TimeSlot[]
}

export interface TimeSlot {
  day: string
  start_time: string
  end_time: string
}

export interface PaymentConfig {
  amount: number
  currency: string
  description: string
  payment_methods: string[]
  stripe_price_id?: string
}

export interface StepSettings {
  auto_advance?: boolean
  allow_skip?: boolean
  custom_styling?: CustomStyling
  notifications?: NotificationSettings
}

export interface CustomStyling {
  background_color?: string
  text_color?: string
  button_color?: string
  custom_css?: string
}

export interface NotificationSettings {
  notify_on_completion: boolean
  notify_on_start: boolean
  custom_message?: string
}

// Client Progress Types
export interface ClientProgress {
  id: string
  kit_id: string
  client_identifier: string
  client_name?: string
  client_email?: string
  step_id: string
  status: 'not_started' | 'in_progress' | 'completed' | 'skipped'
  response_data?: Json
  completed_at?: string
  started_at: string
  updated_at: string
}

// Analytics Types
export interface KitAnalytics {
  id: string
  kit_id: string
  metric_name: string
  metric_value: Json
  recorded_at: string
  client_identifier?: string
}

export interface AnalyticsMetrics {
  totalViews: number
  totalCompletions: number
  completionRate: number
  avgTimeToComplete: number
  stepDropoff: Record<string, number>
  conversionFunnel: ConversionStep[]
}

export interface ConversionStep {
  step_id: string
  step_title: string
  views: number
  completions: number
  conversion_rate: number
}

// File Upload Types
export interface FileUpload {
  id: string
  kit_id: string
  step_id: string
  client_identifier: string
  original_filename: string
  file_path: string
  file_size: number
  file_type: string
  upload_status: 'uploading' | 'completed' | 'failed'
  created_at: string
}

// Subscription & Billing Types
export interface SubscriptionPlan {
  id: string
  name: string
  description: string
  price: number
  currency: string
  interval: 'month' | 'year'
  features: PlanFeatures
  stripe_price_id: string
}

export interface PlanFeatures {
  max_kits: number
  max_steps_per_kit: number
  custom_branding: boolean
  analytics: boolean
  integrations: string[]
  storage: string
  priority_support: boolean
}

// Webhook Types
export interface WebhookEvent {
  id: string
  source: 'stripe' | 'boldsign' | 'calendar'
  event_type: string
  event_data: Json
  processed: boolean
  processed_at?: string
  created_at: string
}

export interface StripeWebhookEvent {
  id: string
  type: string
  data: {
    object: any
  }
  created: number
}

export interface BoldSignWebhookEvent {
  eventType: string
  eventData: {
    documentId: string
    status: string
    signerEmail?: string
    completedDate?: string
    declinedDate?: string
  }
}

export interface WebhookProcessingResult {
  success: boolean
  processed: boolean
  error?: string
}

// API Response Types
export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

export interface PaginatedResponse<T = any> {
  data: T[]
  pagination: {
    page: number
    limit: number
    total: number
    total_pages: number
  }
}

// UI Component Types
export interface SelectOption {
  value: string
  label: string
  disabled?: boolean
}

export interface TableColumn<T = any> {
  key: keyof T
  title: string
  sortable?: boolean
  render?: (value: any, record: T) => React.ReactNode
}

export interface ModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title?: string
  description?: string
  children: React.ReactNode
}

// Form Types
export interface FormProps<T = any> {
  initialValues?: T
  onSubmit: (values: T) => void | Promise<void>
  loading?: boolean
  disabled?: boolean
}

// Navigation Types
export interface NavItem {
  title: string
  href: string
  icon?: React.ComponentType<{ className?: string }>
  disabled?: boolean
  external?: boolean
  children?: NavItem[]
}

// Theme Types
export interface ThemeConfig {
  primary_color: string
  secondary_color: string
  accent_color: string
  background_color: string
  text_color: string
  border_radius: string
  font_family: string
}

// Error Types
export interface AppError {
  code: string
  message: string
  details?: Record<string, any>
  stack?: string
}

// Utility Types
export type Prettify<T> = {
  [K in keyof T]: T[K]
} & {}

export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>

export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P]
}

export type WithTimestamps<T> = T & {
  created_at: string
  updated_at: string
}

// Payment & Billing Types
export interface PaymentMethod {
  id: string
  type: 'card'
  card: {
    brand: string
    last4: string
    exp_month: number
    exp_year: number
  }
  billing_details: {
    email?: string
    name?: string
    address?: {
      city?: string
      country?: string
      line1?: string
      line2?: string
      postal_code?: string
      state?: string
    }
  }
}

export interface StripeCustomer {
  id: string
  email?: string
  name?: string
  default_source?: string
  invoice_settings: {
    default_payment_method?: string
  }
  metadata: Record<string, string>
}

export interface StripeSubscription {
  id: string
  customer: string
  status: 'active' | 'canceled' | 'incomplete' | 'incomplete_expired' | 'past_due' | 'trialing' | 'unpaid'
  current_period_start: number
  current_period_end: number
  cancel_at_period_end: boolean
  items: {
    data: Array<{
      id: string
      price: {
        id: string
        unit_amount: number
        currency: string
        recurring: {
          interval: 'month' | 'year'
        }
      }
    }>
  }
}

export interface BillingInfo {
  customer: StripeCustomer
  paymentMethods: PaymentMethod[]
  subscriptions: StripeSubscription[]
}

export interface SetupIntentResult {
  clientSecret: string
  setupIntentId: string
}

export interface PaymentMethodUpdateRequest {
  setupIntentId: string
}

export interface CustomerPortalRequest {
  returnUrl?: string
}

export interface CustomerPortalResponse {
  url: string
}

// Stripe Webhook Event Types
export interface StripeWebhookEvent {
  id: string
  type: string
  data: {
    object: any
  }
  created: number
  livemode: boolean
  pending_webhooks: number
  request?: {
    id: string
    idempotency_key: string
  }
}

export interface WebhookProcessingResult {
  success: boolean
  processed: boolean
  error?: string
}
