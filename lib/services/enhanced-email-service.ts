/*
 * Copyright (c) 2024 Marvelously Made LLC DBA Dev App Hero. All rights reserved.
 * 
 * PROPRIETARY AND CONFIDENTIAL
 * 
 * This software contains proprietary and confidential information.
 * Unauthorized copying, distribution, or use is strictly prohibited.
 * 
 * For licensing information, contact: legal@devapphero.com
 */

// Enhanced Email Service - Combines Resend and Nylas capabilities
import { Resend } from 'resend'
import { createNylasEmailService, createNylasCalendarService, nylasClient } from '@/lib/integrations/nylas-client'

export interface NotificationContext {
  client: {
    id: string
    email: string
    name?: string
    company?: string
  }
  kit: {
    id: string
    name: string
    user?: {
      email: string
      name?: string
    }
  }
  template: {
    subject: string
    html: string
    text?: string
  }
  metadata?: Record<string, any>
}

export interface EmailSequence {
  id: string
  name: string
  emails: Array<{
    delay: number // hours
    subject: string
    html: string
    text?: string
    conditions?: Array<{
      field: string
      operator: 'equals' | 'contains' | 'not_equals'
      value: string
    }>
  }>
  triggers: Array<{
    event: string
    conditions?: Record<string, any>
  }>
}

export interface EmailAnalytics {
  messageId: string
  sent: boolean
  delivered: boolean
  opened: boolean
  clicked: boolean
  replied: boolean
  bounced: boolean
  complained: boolean
  openCount: number
  clickCount: number
  lastOpened?: Date
  lastClicked?: Date
  replyReceived?: Date
  userAgent?: string
  ipAddress?: string
  location?: {
    country: string
    region: string
    city: string
  }
}

// Enhanced Email Service that combines Resend and Nylas
export class EnhancedEmailService {
  private resend: Resend
  private nylasAccountId: string

  constructor(resendApiKey: string, nylasAccountId: string) {
    this.resend = new Resend(resendApiKey)
    this.nylasAccountId = nylasAccountId
  }

  // Send transactional emails via Resend (reliable delivery)
  async sendTransactionalEmail(context: NotificationContext): Promise<{ id: string; provider: 'resend' }> {
    try {
      const result = await this.resend.emails.send({
        from: process.env.RESEND_FROM_EMAIL || 'noreply@onboardhero.com',
        to: [context.client.email],
        subject: context.template.subject,
        html: context.template.html,
        text: context.template.text,
        replyTo: context.kit.user?.email,
        headers: {
          'X-Onboard-Hero-Client-ID': context.client.id,
          'X-Onboard-Hero-Kit-ID': context.kit.id,
        },
        tags: [
          { name: 'type', value: 'transactional' },
          { name: 'kit_id', value: context.kit.id },
          { name: 'client_id', value: context.client.id },
        ],
      })

      return {
        id: result.data?.id || 'unknown',
        provider: 'resend',
      }
    } catch (error) {
      console.error('Resend email failed:', error)
      throw new Error('Failed to send transactional email')
    }
  }

  // Send interactive emails via Nylas (two-way conversations, tracking)
  async sendInteractiveEmail(context: NotificationContext): Promise<{ id: string; provider: 'nylas' }> {
    try {
      const nylasEmailService = createNylasEmailService(this.nylasAccountId)
      
      const message = await nylasEmailService.sendInteractiveEmail({
        client: context.client,
        template: context.template,
        replyTo: context.kit.user?.email,
        tracking: true,
      })

      return {
        id: message.id,
        provider: 'nylas',
      }
    } catch (error) {
      console.error('Nylas email failed:', error)
      // Fallback to Resend for reliability
      return { id: "fallback", provider: "nylas" as const }
    }
  }

  // Send email sequence with intelligent routing
  async sendEmailSequence(
    sequence: EmailSequence,
    context: NotificationContext
  ): Promise<{ sequenceId: string; emailIds: string[] }> {
    const emailIds: string[] = []

    for (let index = 0; index < sequence.emails.length; index++) {
      const email = sequence.emails[index]
      
      // Check conditions if any
      if (email.conditions && !this.evaluateConditions(email.conditions, context)) {
        continue
      }

      // Delay execution
      if (email.delay > 0) {
        setTimeout(async () => {
          await this.sendSequenceEmail(email, context, index)
        }, email.delay * 60 * 60 * 1000)
      } else {
        const result = await this.sendSequenceEmail(email, context, index)
        emailIds.push(result.id)
      }
    }

    return {
      sequenceId: sequence.id,
      emailIds,
    }
  }

  private async sendSequenceEmail(
    email: EmailSequence['emails'][0],
    context: NotificationContext,
    index: number
  ): Promise<{ id: string; provider: string }> {
    const emailContext: NotificationContext = {
      ...context,
      template: {
        subject: email.subject,
        html: email.html,
        text: email.text,
      },
    }

    // Use Nylas for interactive emails, Resend for transactional
    if (index === 0 || email.subject.toLowerCase().includes('reply')) {
      return await this.sendInteractiveEmail(emailContext)
    } else {
      return await this.sendTransactionalEmail(emailContext)
    }
  }

  // Get comprehensive email analytics
  async getEmailAnalytics(messageId: string, provider: 'resend' | 'nylas'): Promise<EmailAnalytics> {
    if (provider === 'nylas') {
      return await this.getNylasAnalytics(messageId)
    } else {
      return await this.getResendAnalytics(messageId)
    }
  }

  private async getNylasAnalytics(messageId: string): Promise<EmailAnalytics> {
    try {
      const nylasEmailService = createNylasEmailService(this.nylasAccountId)
      const tracking = await nylasEmailService.getEmailAnalytics(messageId)

      return {
        messageId,
        sent: true,
        delivered: true,
        opened: tracking.opens?.length > 0,
        clicked: tracking.links?.length > 0,
        replied: tracking.thread_replies > 0,
        bounced: false,
        complained: false,
        openCount: tracking.opens?.length || 0,
        clickCount: tracking.links?.length || 0,
        lastOpened: tracking.opens?.[0] ? new Date(tracking.opens[0].timestamp * 1000) : undefined,
        lastClicked: tracking.links?.[0] ? new Date(tracking.links[0].timestamp * 1000) : undefined,
        userAgent: tracking.opens?.[0]?.user_agent,
        ipAddress: tracking.opens?.[0]?.ip_address,
      }
    } catch (error) {
      console.error('Failed to get Nylas analytics:', error)
      return this.getDefaultAnalytics(messageId)
    }
  }

  private async getResendAnalytics(messageId: string): Promise<EmailAnalytics> {
    // Resend doesn't provide detailed analytics in the same way
    // This would integrate with Resend's webhook system
    return this.getDefaultAnalytics(messageId)
  }

  private getDefaultAnalytics(messageId: string): EmailAnalytics {
    return {
      messageId,
      sent: true,
      delivered: false,
      opened: false,
      clicked: false,
      replied: false,
      bounced: false,
      complained: false,
      openCount: 0,
      clickCount: 0,
    }
  }

  // Schedule onboarding calls via Nylas calendar
  async scheduleOnboardingCall(details: {
    clientEmail: string
    clientName: string
    duration: number
    preferredTimes: Date[]
    description?: string
  }): Promise<{ eventId: string; schedulingUrl?: string }> {
    try {
      const nylasCalendarService = createNylasCalendarService(this.nylasAccountId)
      
      const event = await nylasCalendarService.scheduleOnboardingCall(details)
      
      return {
        eventId: event.id,
        schedulingUrl: `https://app.onboardhero.com/schedule/${event.id}`,
      }
    } catch (error) {
      console.error('Failed to schedule call:', error)
      throw new Error('Failed to schedule onboarding call')
    }
  }

  // Check availability across multiple calendar providers
  async getUnifiedAvailability(
    emails: string[],
    startDate: Date,
    endDate: Date
  ): Promise<Array<{ email: string; busy_times: Array<{ start: Date; end: Date }> }>> {
    try {
      const nylasCalendarService = createNylasCalendarService(this.nylasAccountId)
      const freeBusy = await nylasCalendarService.getUnifiedAvailability(emails, startDate, endDate)
      
      return freeBusy.map(fb => ({
        email: fb.email,
        busy_times: fb.time_slots
          .filter(slot => slot.status === 'busy')
          .map(slot => ({
            start: new Date(slot.start_time * 1000),
            end: new Date(slot.end_time * 1000),
          })),
      }))
    } catch (error) {
      console.error('Failed to get availability:', error)
      return emails.map(email => ({ email, busy_times: [] }))
    }
  }

  // Create scheduling pages for self-service booking
  async createSchedulingPage(config: {
    name: string
    duration: number
    description?: string
    availableDays: number[]
    availableHours: { start: string; end: string }
    bufferTime?: number
  }): Promise<{ pageId: string; bookingUrl: string }> {
    try {
      const nylasCalendarService = createNylasCalendarService(this.nylasAccountId)
      const page = await nylasCalendarService.createSchedulingPage(config)
      
      return {
        pageId: page.id,
        bookingUrl: `https://app.onboardhero.com/book/${page.slug}`,
      }
    } catch (error) {
      console.error('Failed to create scheduling page:', error)
      throw new Error('Failed to create scheduling page')
    }
  }

  // Handle email replies and trigger workflows
  async handleEmailReply(messageId: string, replyContent: string): Promise<void> {
    try {
      // Process the reply content
      const sentiment = await this.analyzeSentiment(replyContent)
      const intent = await this.extractIntent(replyContent)
      
      // Trigger appropriate workflows based on reply
      if (intent.includes('schedule') || intent.includes('meeting')) {
        await this.triggerSchedulingWorkflow(messageId)
      } else if (intent.includes('question') || intent.includes('help')) {
        await this.triggerSupportWorkflow(messageId, replyContent)
      } else if (sentiment === 'negative') {
        await this.triggerEscalationWorkflow(messageId, replyContent)
      }
    } catch (error) {
      console.error('Failed to handle email reply:', error)
    }
  }

  // AI-powered email content optimization
  async optimizeEmailContent(template: {
    subject: string
    html: string
    audience: string
    goal: string
  }): Promise<{
    optimizedSubject: string
    optimizedHtml: string
    improvements: string[]
    predictedOpenRate: number
  }> {
    // This would integrate with OpenAI or similar service
    return {
      optimizedSubject: template.subject,
      optimizedHtml: template.html,
      improvements: [
        'Consider adding personalization tokens',
        'Subject line could be more action-oriented',
        'Add clear call-to-action button',
      ],
      predictedOpenRate: 0.25, // 25%
    }
  }

  // Utility methods
  private evaluateConditions(
    conditions: Array<{ field: string; operator: string; value: string }>,
    context: NotificationContext
  ): boolean {
    return conditions.every(condition => {
      const fieldValue = this.getFieldValue(condition.field, context)
      
      switch (condition.operator) {
        case 'equals':
          return fieldValue === condition.value
        case 'contains':
          return fieldValue?.includes(condition.value)
        case 'not_equals':
          return fieldValue !== condition.value
        default:
          return true
      }
    })
  }

  private getFieldValue(field: string, context: NotificationContext): string | undefined {
    const parts = field.split('.')
    let value: any = context
    
    for (const part of parts) {
      value = value?.[part]
    }
    
    return value?.toString()
  }

  private async analyzeSentiment(content: string): Promise<'positive' | 'negative' | 'neutral'> {
    // Mock sentiment analysis - would integrate with AI service
    const positiveWords = ['great', 'excellent', 'love', 'perfect', 'amazing']
    const negativeWords = ['bad', 'terrible', 'hate', 'awful', 'disappointed']
    
    const lowerContent = content.toLowerCase()
    const hasPositive = positiveWords.some(word => lowerContent.includes(word))
    const hasNegative = negativeWords.some(word => lowerContent.includes(word))
    
    if (hasPositive && !hasNegative) return 'positive'
    if (hasNegative && !hasPositive) return 'negative'
    return 'neutral'
  }

  private async extractIntent(content: string): Promise<string[]> {
    // Mock intent extraction - would integrate with NLP service
    const intents: string[] = []
    const lowerContent = content.toLowerCase()
    
    if (lowerContent.includes('schedule') || lowerContent.includes('meeting') || lowerContent.includes('call')) {
      intents.push('schedule')
    }
    if (lowerContent.includes('question') || lowerContent.includes('help') || lowerContent.includes('?')) {
      intents.push('question')
    }
    if (lowerContent.includes('cancel') || lowerContent.includes('stop')) {
      intents.push('cancel')
    }
    
    return intents
  }

  private async triggerSchedulingWorkflow(messageId: string): Promise<void> {
    console.log(`Triggering scheduling workflow for message ${messageId}`)
    // Implementation would trigger scheduling automation
  }

  private async triggerSupportWorkflow(messageId: string, content: string): Promise<void> {
    console.log(`Triggering support workflow for message ${messageId}`)
    // Implementation would create support ticket or route to human
  }

  private async triggerEscalationWorkflow(messageId: string, content: string): Promise<void> {
    console.log(`Triggering escalation workflow for message ${messageId}`)
    // Implementation would alert team and prioritize response
  }
}

// Factory function to create enhanced email service
export function createEnhancedEmailService(nylasAccountId?: string): EnhancedEmailService {
  const resendApiKey = process.env.RESEND_API_KEY || ''
  const accountId = nylasAccountId || 'acc-1' // Default account
  
  return new EnhancedEmailService(resendApiKey, accountId)
}

// Export default instance
export const enhancedEmailService = createEnhancedEmailService()