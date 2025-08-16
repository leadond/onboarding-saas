import { z } from 'zod'

// Step Type Enum
export const stepTypeSchema = z.enum([
  'welcome_message',
  'welcome_video',
  'intake_form',
  'file_upload',
  'contract_signing',
  'scheduling',
  'payment',
  'confirmation',
])

// Kit Status Enum
export const kitStatusSchema = z.enum(['draft', 'published', 'archived'])

// Form Field Validation Schema
export const formFieldValidationSchema = z
  .object({
    min_length: z.number().min(0).optional(),
    max_length: z.number().min(1).optional(),
    pattern: z.string().optional(),
    custom_message: z.string().optional(),
  })
  .optional()

// Form Field Schema
export const formFieldSchema = z.object({
  id: z.string().uuid(),
  type: z.enum([
    'text',
    'email',
    'phone',
    'textarea',
    'select',
    'checkbox',
    'radio',
    'date',
    'file',
  ]),
  label: z.string().min(1, 'Field label is required'),
  placeholder: z.string().optional(),
  required: z.boolean().default(false),
  options: z.array(z.string()).optional(),
  validation: formFieldValidationSchema,
  order: z.number().min(0),
})

// Upload Configuration Schema
export const uploadConfigSchema = z.object({
  max_files: z.number().min(1).max(20).default(5),
  max_file_size: z
    .number()
    .min(1024)
    .max(100 * 1024 * 1024), // 1KB to 100MB
  accepted_types: z
    .array(z.string())
    .min(1, 'At least one file type must be allowed'),
  description: z.string().optional(),
})

// Contract Field Schema
export const contractFieldSchema = z.object({
  name: z.string().min(1),
  type: z.enum(['text', 'signature', 'date', 'checkbox']),
  required: z.boolean().default(false),
  tab_label: z.string().optional(),
})

// Contract Template Schema
export const contractTemplateSchema = z.object({
  template_id: z.string().min(1),
  title: z.string().min(1),
  description: z.string().optional(),
  fields: z.array(contractFieldSchema),
})

// Time Slot Schema
export const timeSlotSchema = z.object({
  day: z.string().min(1),
  start_time: z.string().regex(/^\d{2}:\d{2}$/, 'Time must be in HH:MM format'),
  end_time: z.string().regex(/^\d{2}:\d{2}$/, 'Time must be in HH:MM format'),
})

// Calendar Configuration Schema
export const calendarConfigSchema = z.object({
  provider: z.enum(['google', 'calendly', 'outlook']),
  calendar_id: z.string().optional(),
  duration: z.number().min(15).max(480), // 15 minutes to 8 hours
  buffer_time: z.number().min(0).max(120).optional(), // 0 to 2 hours
  available_times: z.array(timeSlotSchema).optional(),
})

// Payment Configuration Schema
export const paymentConfigSchema = z.object({
  amount: z.number().min(1, 'Amount must be greater than 0'),
  currency: z.string().length(3, 'Currency must be 3 characters'),
  description: z.string().min(1, 'Payment description is required'),
  payment_methods: z
    .array(z.string())
    .min(1, 'At least one payment method is required'),
  stripe_price_id: z.string().optional(),
})

// Custom Styling Schema
export const customStylingSchema = z.object({
  background_color: z
    .string()
    .regex(/^#[0-9A-Fa-f]{6}$/, 'Invalid hex color')
    .optional(),
  text_color: z
    .string()
    .regex(/^#[0-9A-Fa-f]{6}$/, 'Invalid hex color')
    .optional(),
  button_color: z
    .string()
    .regex(/^#[0-9A-Fa-f]{6}$/, 'Invalid hex color')
    .optional(),
  custom_css: z.string().optional(),
})

// Notification Settings Schema
export const notificationSettingsSchema = z.object({
  notify_on_completion: z.boolean().default(true),
  notify_on_start: z.boolean().default(false),
  custom_message: z.string().optional(),
})

// Step Content Schema (flexible JSONB content)
export const stepContentSchema = z.object({
  instructions: z.string().optional(),
  video_url: z.string().url().optional(),
  form_fields: z.array(formFieldSchema).optional(),
  upload_config: uploadConfigSchema.optional(),
  contract_template: contractTemplateSchema.optional(),
  calendar_config: calendarConfigSchema.optional(),
  payment_config: paymentConfigSchema.optional(),
})

// Step Settings Schema
export const stepSettingsSchema = z.object({
  auto_advance: z.boolean().default(false),
  allow_skip: z.boolean().default(false),
  custom_styling: customStylingSchema.optional(),
  notifications: notificationSettingsSchema.optional(),
})

// Kit Step Schema (for creation/update)
export const kitStepSchema = z.object({
  id: z.string().uuid().optional(), // Optional for creation
  kit_id: z.string().uuid().optional(), // Will be set by parent kit
  step_order: z.number().min(0),
  step_type: stepTypeSchema,
  title: z
    .string()
    .min(1, 'Step title is required')
    .max(255, 'Title is too long'),
  description: z.string().max(1000, 'Description is too long').optional(),
  content: stepContentSchema.default({}),
  is_required: z.boolean().default(true),
  is_active: z.boolean().default(true),
  settings: stepSettingsSchema.default({}),
  conditional_logic: z.any().optional(), // JSONB field for future use
})

// Kit Schema (for creation/update)
export const kitSchema = z.object({
  id: z.string().uuid().optional(), // Optional for creation
  user_id: z.string().uuid().optional(), // Will be set from auth context
  name: z.string().min(1, 'Kit name is required').max(255, 'Name is too long'),
  slug: z
    .string()
    .min(1)
    .max(255)
    .regex(
      /^[a-z0-9-]+$/,
      'Slug can only contain lowercase letters, numbers, and hyphens'
    )
    .optional(), // Will be generated if not provided
  description: z.string().max(1000, 'Description is too long').optional(),
  welcome_message: z.string().optional(),
  brand_color: z
    .string()
    .regex(/^#[0-9A-Fa-f]{6}$/, 'Invalid hex color')
    .default('#3B82F6'),
  logo_url: z.string().url().optional(),
  status: kitStatusSchema.default('draft'),
  is_template: z.boolean().default(false),
  completion_redirect_url: z.string().url().optional(),
  custom_domain: z.string().max(255).optional(),
  seo_title: z.string().max(255).optional(),
  seo_description: z.string().max(500).optional(),
  analytics_enabled: z.boolean().default(true),
  password_protected: z.boolean().default(false),
  password_hash: z.string().optional(),
  steps: z.array(kitStepSchema).optional(), // For creating kit with steps
})

// Kit Update Schema (all fields optional except validation requirements)
export const kitUpdateSchema = kitSchema.partial().extend({
  id: z.string().uuid(), // ID is required for updates
})

// Step Update Schema
export const stepUpdateSchema = kitStepSchema.partial().extend({
  id: z.string().uuid(), // ID is required for updates
})

// Kit Duplication Schema
export const kitDuplicateSchema = z.object({
  name: z.string().min(1, 'New kit name is required').max(255),
  include_steps: z.boolean().default(true),
  copy_settings: z.boolean().default(true),
})

// Kit Publishing Schema
export const kitPublishSchema = z.object({
  status: z.enum(['draft', 'published']),
  publish_message: z.string().optional(),
})

// Step Reorder Schema
export const stepReorderSchema = z.object({
  step_orders: z
    .array(
      z.object({
        id: z.string().uuid(),
        step_order: z.number().min(0),
      })
    )
    .min(1, 'At least one step order is required'),
})

// Client Assignment Schema
export const clientAssignmentSchema = z.object({
  client_email: z.string().email('Invalid email address'),
  client_name: z.string().min(1, 'Client name is required'),
  send_invitation: z.boolean().default(true),
  custom_message: z.string().optional(),
  due_date: z.string().datetime().optional(),
})

// Bulk Client Assignment Schema
export const bulkClientAssignmentSchema = z.object({
  clients: z
    .array(clientAssignmentSchema)
    .min(1, 'At least one client is required')
    .max(100, 'Maximum 100 clients at once'),
  kit_id: z.string().uuid(),
})

// Kit Analytics Query Schema
export const kitAnalyticsQuerySchema = z.object({
  kit_id: z.string().uuid(),
  start_date: z.string().datetime().optional(),
  end_date: z.string().datetime().optional(),
  metrics: z
    .array(
      z.enum([
        'views',
        'completions',
        'conversion_rate',
        'time_to_complete',
        'step_dropoff',
      ])
    )
    .optional(),
})

// Kit Filter Schema (for listing/searching)
export const kitFilterSchema = z.object({
  status: z.array(kitStatusSchema).optional(),
  search: z.string().optional().nullable(),
  is_template: z.boolean().optional(),
  created_after: z.string().datetime().optional().nullable(),
  created_before: z.string().datetime().optional().nullable(),
  sort_by: z
    .enum(['created_at', 'updated_at', 'name', 'status'])
    .default('updated_at'),
  sort_order: z.enum(['asc', 'desc']).default('desc'),
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(100).default(10),
})

// Kit Template Schema
export const kitTemplateSchema = z.object({
  name: z.string().min(1).max(255),
  description: z.string().max(1000),
  category: z.string().min(1),
  steps: z.array(kitStepSchema).min(1, 'Template must have at least one step'),
  preview_image_url: z.string().url().optional(),
  tags: z.array(z.string()).optional(),
})

// Export type inference helpers
export type KitFormData = z.infer<typeof kitSchema>
export type KitUpdateData = z.infer<typeof kitUpdateSchema>
export type KitStepFormData = z.infer<typeof kitStepSchema>
export type StepUpdateData = z.infer<typeof stepUpdateSchema>
export type KitDuplicateData = z.infer<typeof kitDuplicateSchema>
export type KitPublishData = z.infer<typeof kitPublishSchema>
export type StepReorderData = z.infer<typeof stepReorderSchema>
export type ClientAssignmentData = z.infer<typeof clientAssignmentSchema>
export type BulkClientAssignmentData = z.infer<
  typeof bulkClientAssignmentSchema
>
export type KitAnalyticsQuery = z.infer<typeof kitAnalyticsQuerySchema>
export type KitFilterQuery = z.infer<typeof kitFilterSchema>
export type KitTemplateData = z.infer<typeof kitTemplateSchema>
export type FormFieldData = z.infer<typeof formFieldSchema>
export type UploadConfigData = z.infer<typeof uploadConfigSchema>
export type StepContentData = z.infer<typeof stepContentSchema>
export type StepSettingsData = z.infer<typeof stepSettingsSchema>
