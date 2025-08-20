// TypeScript types for the Onboarding Kits system

export interface KitTemplate {
  id: string
  name: string
  description?: string
  industry?: string
  category?: string
  version: string
  is_active: boolean
  is_premium: boolean
  price: number
  created_by?: string
  created_at: string
  updated_at: string
  metadata: Record<string, any>
  steps?: KitTemplateStep[]
}

export interface KitTemplateStep {
  id: string
  template_id: string
  name: string
  description?: string
  step_order: number
  step_type: StepType
  responsibility: ResponsibilityType
  is_required: boolean
  estimated_duration_hours: number
  config: Record<string, any>
  created_at: string
  updated_at: string
}

export interface CompanyKit {
  id: string
  company_name: string
  template_id?: string
  name: string
  description?: string
  is_active: boolean
  customizations: Record<string, any>
  created_by?: string
  created_at: string
  updated_at: string
  steps?: CompanyKitStep[]
  template?: KitTemplate
}

export interface CompanyKitStep {
  id: string
  kit_id: string
  template_step_id?: string
  name: string
  description?: string
  step_order: number
  step_type: StepType
  responsibility: ResponsibilityType
  is_required: boolean
  is_active: boolean
  estimated_duration_hours: number
  config: Record<string, any>
  created_at: string
  updated_at: string
}

export interface OnboardingSession {
  id: string
  kit_id: string
  client_name: string
  client_email: string
  client_phone?: string
  assigned_user_id?: string
  status: SessionStatus
  progress_percentage: number
  started_at: string
  completed_at?: string
  due_date?: string
  metadata: Record<string, any>
  created_at: string
  updated_at: string
  kit?: CompanyKit
  assigned_user?: any
  step_instances?: StepInstance[]
}

export interface StepInstance {
  id: string
  session_id: string
  step_id: string
  status: StepStatus
  assigned_to: ResponsibilityType
  started_at?: string
  completed_at?: string
  due_date?: string
  completion_data: Record<string, any>
  notes?: string
  created_at: string
  updated_at: string
  step?: CompanyKitStep
  documents?: DocumentInstance[]
  forms?: FormSubmission[]
  files?: FileUpload[]
  payments?: PaymentRequest[]
}

export interface DocumentTemplate {
  id: string
  name: string
  description?: string
  document_type: DocumentType
  industry?: string
  content: string
  is_global: boolean
  company_name?: string
  created_by?: string
  is_active: boolean
  version: string
  created_at: string
  updated_at: string
}

export interface FormTemplate {
  id: string
  name: string
  description?: string
  form_type: FormType
  industry?: string
  fields: FormField[]
  is_global: boolean
  company_name?: string
  created_by?: string
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface FormField {
  id: string
  name: string
  label: string
  type: FieldType
  required: boolean
  placeholder?: string
  options?: string[]
  validation?: Record<string, any>
  order: number
}

export interface FormSubmission {
  id: string
  step_instance_id: string
  form_template_id: string
  session_id: string
  submitted_by: ResponsibilityType
  submission_data: Record<string, any>
  submitted_at: string
  created_at: string
  form_template?: FormTemplate
}

export interface DocumentInstance {
  id: string
  step_instance_id: string
  template_id: string
  session_id: string
  document_name: string
  content: string
  file_url?: string
  signature_request_id?: string
  signature_status: SignatureStatus
  signed_at?: string
  created_at: string
  updated_at: string
  template?: DocumentTemplate
}

export interface FileUpload {
  id: string
  step_instance_id: string
  session_id: string
  original_filename: string
  file_url: string
  file_size?: number
  file_type?: string
  uploaded_by: ResponsibilityType
  uploaded_at: string
  created_at: string
}

export interface PaymentRequest {
  id: string
  step_instance_id: string
  session_id: string
  amount: number
  currency: string
  description?: string
  stripe_payment_intent_id?: string
  status: PaymentStatus
  paid_at?: string
  created_at: string
  updated_at: string
}

export interface Notification {
  id: string
  session_id: string
  step_instance_id?: string
  recipient_type: ResponsibilityType
  recipient_email?: string
  recipient_phone?: string
  notification_type: NotificationType
  subject?: string
  message: string
  status: NotificationStatus
  sent_at?: string
  created_at: string
}

export interface CompanyIntegration {
  id: string
  company_name: string
  integration_type: IntegrationType
  api_key_encrypted?: string
  settings: Record<string, any>
  is_active: boolean
  created_by?: string
  created_at: string
  updated_at: string
}

export interface CalendarEvent {
  id: string
  session_id: string
  step_instance_id?: string
  title: string
  description?: string
  start_date: string
  end_date: string
  event_type: EventType
  attendees: string[]
  calendar_url?: string
  created_at: string
  updated_at: string
}

export interface AIAnalysis {
  id: string
  document_instance_id: string
  analysis_type: AnalysisType
  analysis_result: Record<string, any>
  confidence_score?: number
  suggestions?: string
  created_at: string
}

// Enums and Union Types
export type StepType = 'form' | 'document' | 'payment' | 'approval' | 'task' | 'calendar' | 'file_upload'
export type ResponsibilityType = 'client' | 'company' | 'both'
export type SessionStatus = 'active' | 'completed' | 'paused' | 'cancelled'
export type StepStatus = 'pending' | 'in_progress' | 'completed' | 'skipped' | 'blocked'
export type DocumentType = 'contract' | 'agreement' | 'form' | 'checklist' | 'invoice' | 'proposal'
export type FormType = 'intake' | 'survey' | 'application' | 'feedback' | 'questionnaire'
export type FieldType = 'text' | 'email' | 'phone' | 'number' | 'textarea' | 'select' | 'checkbox' | 'radio' | 'date' | 'file'
export type SignatureStatus = 'pending' | 'signed' | 'declined' | 'expired'
export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'cancelled'
export type NotificationType = 'email' | 'sms' | 'both'
export type NotificationStatus = 'pending' | 'sent' | 'failed'
export type IntegrationType = 'stripe' | 'twilio' | 'boldsign' | 'openai' | 'aws' | 'cloudinary' | 'custom'
export type EventType = 'deadline' | 'meeting' | 'reminder' | 'milestone'
export type AnalysisType = 'legal_review' | 'error_check' | 'compliance' | 'readability'

// API Request/Response Types
export interface CreateKitTemplateRequest {
  name: string
  description?: string
  industry?: string
  category?: string
  is_premium?: boolean
  price?: number
  steps: Omit<KitTemplateStep, 'id' | 'template_id' | 'created_at' | 'updated_at'>[]
}

export interface CreateCompanyKitRequest {
  template_id?: string
  name: string
  description?: string
  customizations?: Record<string, any>
  steps?: Omit<CompanyKitStep, 'id' | 'kit_id' | 'created_at' | 'updated_at'>[]
}

export interface StartOnboardingSessionRequest {
  kit_id: string
  client_name: string
  client_email: string
  client_phone?: string
  assigned_user_id?: string
  due_date?: string
  metadata?: Record<string, any>
}

export interface UpdateStepInstanceRequest {
  status?: StepStatus
  completion_data?: Record<string, any>
  notes?: string
}

export interface CreateDocumentRequest {
  template_id: string
  step_instance_id: string
  variables?: Record<string, any>
}

export interface SubmitFormRequest {
  form_template_id: string
  step_instance_id: string
  submission_data: Record<string, any>
}

export interface CreatePaymentRequest {
  step_instance_id: string
  amount: number
  currency?: string
  description?: string
}

export interface SendNotificationRequest {
  session_id: string
  step_instance_id?: string
  recipient_type: ResponsibilityType
  notification_type: NotificationType
  subject?: string
  message: string
}

// Industry-specific kit configurations
export interface IndustryKitConfig {
  industry: string
  typical_steps: string[]
  required_documents: string[]
  common_forms: string[]
  average_duration_days: number
  compliance_requirements?: string[]
}

// Pre-built industry configurations
export const INDUSTRY_CONFIGS: Record<string, IndustryKitConfig> = {
  'legal': {
    industry: 'Legal Services',
    typical_steps: ['Client Intake', 'Retainer Agreement', 'Case Assessment', 'Document Collection', 'Payment Setup'],
    required_documents: ['Retainer Agreement', 'Fee Schedule', 'Privacy Policy'],
    common_forms: ['Client Intake Form', 'Case Details Form', 'Contact Information'],
    average_duration_days: 7,
    compliance_requirements: ['Attorney-Client Privilege', 'State Bar Requirements']
  },
  'accounting': {
    industry: 'Accounting & Finance',
    typical_steps: ['Client Information', 'Service Agreement', 'Document Upload', 'Payment Terms', 'Access Setup'],
    required_documents: ['Engagement Letter', 'Fee Agreement', 'Privacy Notice'],
    common_forms: ['Business Information Form', 'Tax Document Checklist', 'Bank Account Details'],
    average_duration_days: 5,
    compliance_requirements: ['AICPA Standards', 'IRS Requirements']
  },
  'consulting': {
    industry: 'Business Consulting',
    typical_steps: ['Discovery Call', 'Proposal Review', 'Contract Signing', 'Project Kickoff', 'Payment Setup'],
    required_documents: ['Consulting Agreement', 'Statement of Work', 'NDA'],
    common_forms: ['Business Assessment Form', 'Goals & Objectives', 'Contact Details'],
    average_duration_days: 10,
    compliance_requirements: ['Professional Standards', 'Confidentiality']
  },
  'healthcare': {
    industry: 'Healthcare Services',
    typical_steps: ['Patient Registration', 'Insurance Verification', 'Medical History', 'Consent Forms', 'Appointment Scheduling'],
    required_documents: ['HIPAA Notice', 'Consent Forms', 'Privacy Policy'],
    common_forms: ['Patient Information Form', 'Medical History', 'Insurance Details'],
    average_duration_days: 3,
    compliance_requirements: ['HIPAA', 'State Medical Board']
  },
  'real_estate': {
    industry: 'Real Estate',
    typical_steps: ['Client Registration', 'Buyer/Seller Agreement', 'Property Search', 'Document Preparation', 'Closing Coordination'],
    required_documents: ['Listing Agreement', 'Buyer Agreement', 'Disclosure Forms'],
    common_forms: ['Client Preferences', 'Financial Qualification', 'Property Requirements'],
    average_duration_days: 14,
    compliance_requirements: ['Real Estate License Requirements', 'State Disclosure Laws']
  }
}