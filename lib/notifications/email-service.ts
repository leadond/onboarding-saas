import { createClient } from '@/lib/supabase/server'
import type { Tables } from '@/lib/supabase/database.types'
import type { Kit, KitStep } from '@/types'

type ClientProgress = Tables<'client_progress'>

export interface EmailTemplate {
  subject: string
  html: string
  text: string
  variables: Record<string, string>
}

export interface EmailOptions {
  to: string
  from?: string
  subject: string
  html: string
  text: string
  templateId?: string
  variables?: Record<string, any>
}

export interface NotificationContext {
  kit: Kit & {
    user?: {
      full_name?: string
      company_name?: string
      email?: string
    }
  }
  client: {
    name?: string
    email: string
    identifier: string
  }
  step?: KitStep
  progress?: ClientProgress
  completionPercentage?: number
  totalSteps?: number
  completedSteps?: number
}

// Email service provider interface
export interface EmailProvider {
  sendEmail(
    options: EmailOptions
  ): Promise<{ success: boolean; messageId?: string; error?: string }>
  validateEmail(email: string): boolean
}

// Resend email provider implementation
class ResendProvider implements EmailProvider {
  private apiKey: string
  private baseUrl = 'https://api.resend.com'

  constructor(apiKey: string) {
    this.apiKey = apiKey
  }

  async sendEmail(
    options: EmailOptions
  ): Promise<{ success: boolean; messageId?: string; error?: string }> {
    try {
      const response = await fetch(`${this.baseUrl}/emails`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from:
            options.from ||
            process.env.DEFAULT_FROM_EMAIL ||
            'noreply@onboardhero.com',
          to: [options.to],
          subject: options.subject,
          html: options.html,
          text: options.text,
        }),
      })

      if (!response.ok) {
        const error = await response.text()
        return { success: false, error }
      }

      const result = await response.json()
      return { success: true, messageId: result.id }
    } catch (error) {
      console.error('Email sending failed:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      }
    }
  }

  validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }
}

// SendGrid email provider implementation
class SendGridProvider implements EmailProvider {
  private apiKey: string
  private baseUrl = 'https://api.sendgrid.com/v3'

  constructor(apiKey: string) {
    this.apiKey = apiKey
  }

  async sendEmail(
    options: EmailOptions
  ): Promise<{ success: boolean; messageId?: string; error?: string }> {
    try {
      const response = await fetch(`${this.baseUrl}/mail/send`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          personalizations: [
            {
              to: [{ email: options.to }],
              subject: options.subject,
            },
          ],
          from: {
            email:
              options.from ||
              process.env.DEFAULT_FROM_EMAIL ||
              'noreply@onboardhero.com',
          },
          content: [
            {
              type: 'text/plain',
              value: options.text,
            },
            {
              type: 'text/html',
              value: options.html,
            },
          ],
        }),
      })

      if (!response.ok) {
        const error = await response.text()
        return { success: false, error }
      }

      // SendGrid returns 202 with empty body on success
      return {
        success: true,
        messageId: response.headers.get('x-message-id') || undefined,
      }
    } catch (error) {
      console.error('Email sending failed:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      }
    }
  }

  validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }
}

// Email service class
export class EmailService {
  private provider: EmailProvider
  private supabase = createClient()

  constructor() {
    const emailProvider = process.env.EMAIL_PROVIDER || 'resend'

    switch (emailProvider.toLowerCase()) {
      case 'sendgrid':
        const sendgridKey = process.env.SENDGRID_API_KEY
        if (!sendgridKey) {
          throw new Error('SENDGRID_API_KEY environment variable is required')
        }
        this.provider = new SendGridProvider(sendgridKey)
        break

      case 'resend':
      default:
        const resendKey = process.env.RESEND_API_KEY
        if (!resendKey) {
          throw new Error('RESEND_API_KEY environment variable is required')
        }
        this.provider = new ResendProvider(resendKey)
        break
    }
  }

  /**
   * Send welcome email to client when they start onboarding
   */
  async sendWelcomeEmail(context: NotificationContext): Promise<boolean> {
    try {
      const template = await this.getEmailTemplate('welcome', context)

      const result = await this.provider.sendEmail({
        to: context.client.email,
        subject: template.subject,
        html: template.html,
        text: template.text,
      })

      if (result.success) {
        await this.logNotification({
          type: 'welcome_email',
          context,
          status: 'sent',
          messageId: result.messageId,
        })
      } else {
        await this.logNotification({
          type: 'welcome_email',
          context,
          status: 'failed',
          error: result.error,
        })
      }

      return result.success
    } catch (error) {
      console.error('Failed to send welcome email:', error)
      return false
    }
  }

  /**
   * Send step completion confirmation email
   */
  async sendStepCompletionEmail(
    context: NotificationContext
  ): Promise<boolean> {
    if (!context.step) return false

    try {
      const template = await this.getEmailTemplate('step_completion', context)

      const result = await this.provider.sendEmail({
        to: context.client.email,
        subject: template.subject,
        html: template.html,
        text: template.text,
      })

      if (result.success) {
        await this.logNotification({
          type: 'step_completion_email',
          context,
          status: 'sent',
          messageId: result.messageId,
        })
      } else {
        await this.logNotification({
          type: 'step_completion_email',
          context,
          status: 'failed',
          error: result.error,
        })
      }

      return result.success
    } catch (error) {
      console.error('Failed to send step completion email:', error)
      return false
    }
  }

  /**
   * Send reminder email for incomplete steps
   */
  async sendReminderEmail(
    context: NotificationContext,
    daysSinceLastActivity: number
  ): Promise<boolean> {
    try {
      const template = await this.getEmailTemplate('reminder', {
        ...context,
        daysSinceLastActivity,
      })

      const result = await this.provider.sendEmail({
        to: context.client.email,
        subject: template.subject,
        html: template.html,
        text: template.text,
      })

      if (result.success) {
        await this.logNotification({
          type: 'reminder_email',
          context,
          status: 'sent',
          messageId: result.messageId,
        })
      } else {
        await this.logNotification({
          type: 'reminder_email',
          context,
          status: 'failed',
          error: result.error,
        })
      }

      return result.success
    } catch (error) {
      console.error('Failed to send reminder email:', error)
      return false
    }
  }

  /**
   * Send completion celebration email
   */
  async sendCompletionEmail(context: NotificationContext): Promise<boolean> {
    try {
      const template = await this.getEmailTemplate('completion', context)

      const result = await this.provider.sendEmail({
        to: context.client.email,
        subject: template.subject,
        html: template.html,
        text: template.text,
      })

      if (result.success) {
        await this.logNotification({
          type: 'completion_email',
          context,
          status: 'sent',
          messageId: result.messageId,
        })
      } else {
        await this.logNotification({
          type: 'completion_email',
          context,
          status: 'failed',
          error: result.error,
        })
      }

      return result.success
    } catch (error) {
      console.error('Failed to send completion email:', error)
      return false
    }
  }

  /**
   * Send admin notification email
   */
  async sendAdminNotification(
    type: 'new_client' | 'client_completed' | 'client_stuck',
    context: NotificationContext
  ): Promise<boolean> {
    if (!context.kit.user?.email) return false

    try {
      const template = await this.getEmailTemplate(`admin_${type}`, context)

      const result = await this.provider.sendEmail({
        to: context.kit.user.email,
        subject: template.subject,
        html: template.html,
        text: template.text,
      })

      if (result.success) {
        await this.logNotification({
          type: `admin_${type}_email`,
          context,
          status: 'sent',
          messageId: result.messageId,
        })
      } else {
        await this.logNotification({
          type: `admin_${type}_email`,
          context,
          status: 'failed',
          error: result.error,
        })
      }

      return result.success
    } catch (error) {
      console.error(`Failed to send admin ${type} email:`, error)
      return false
    }
  }

  /**
   * Send custom message from admin to client
   */
  async sendCustomMessage(
    context: NotificationContext,
    subject: string,
    message: string,
    fromAdmin = true
  ): Promise<boolean> {
    try {
      const template = await this.getEmailTemplate('custom_message', {
        ...context,
        customSubject: subject,
        customMessage: message,
        fromAdmin,
      })

      const result = await this.provider.sendEmail({
        to: context.client.email,
        from: fromAdmin ? context.kit.user?.email : undefined,
        subject: template.subject,
        html: template.html,
        text: template.text,
      })

      if (result.success) {
        await this.logNotification({
          type: 'custom_message_email',
          context,
          status: 'sent',
          messageId: result.messageId,
        })
      } else {
        await this.logNotification({
          type: 'custom_message_email',
          context,
          status: 'failed',
          error: result.error,
        })
      }

      return result.success
    } catch (error) {
      console.error('Failed to send custom message:', error)
      return false
    }
  }

  /**
   * Get email template with variable substitution
   */
  private async getEmailTemplate(
    templateType: string,
    context: any
  ): Promise<EmailTemplate> {
    // Import the template module dynamically
    const { getNotificationTemplate } = await import('./notification-templates')
    return getNotificationTemplate(templateType, context)
  }

  /**
   * Log notification to database for tracking
   */
  private async logNotification(log: {
    type: string
    context: NotificationContext
    status: 'sent' | 'failed'
    messageId?: string
    error?: string
  }): Promise<void> {
    try {
      await this.supabase.from('audit_logs').insert({
        action: 'create',
        resource_type: 'notification',
        resource_id: log.context.client.identifier,
        details: {
          type: log.type,
          status: log.status,
          messageId: log.messageId,
          error: log.error,
          clientEmail: log.context.client.email,
          kitId: log.context.kit.id,
          stepId: log.context.step?.id,
        } as any,
        session_id: log.context.client.identifier,
      })
    } catch (error) {
      console.error('Failed to log notification:', error)
    }
  }

  /**
   * Validate email address
   */
  validateEmail(email: string): boolean {
    return this.provider.validateEmail(email)
  }

  /**
   * Get notification history for a client
   */
  async getNotificationHistory(clientIdentifier: string): Promise<any[]> {
    try {
      const { data, error } = await this.supabase
        .from('audit_logs')
        .select('*')
        .eq('resource_type', 'notification')
        .eq('resource_id', clientIdentifier)
        .order('created_at', { ascending: false })

      if (error) throw error
      return data || []
    } catch (error) {
      console.error('Failed to get notification history:', error)
      return []
    }
  }
}

export default EmailService
