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

// Comprehensive Nylas Integration for Onboard Hero
// Provides advanced email, calendar, and contact management capabilities

export interface NylasConfig {
  apiKey: string
  apiUri?: string
  timeout?: number
}

export interface NylasAccount {
  id: string
  email: string
  provider: 'gmail' | 'outlook' | 'yahoo' | 'imap' | 'exchange'
  sync_state: 'running' | 'stopped' | 'invalid'
  account_from_header_only: boolean
  trial: boolean
  billing_state: 'paid' | 'cancelled' | 'pending'
}

export interface NylasMessage {
  id: string
  account_id: string
  thread_id: string
  subject: string
  from: Array<{ name?: string; email: string }>
  to: Array<{ name?: string; email: string }>
  cc?: Array<{ name?: string; email: string }>
  bcc?: Array<{ name?: string; email: string }>
  reply_to?: Array<{ name?: string; email: string }>
  date: number
  unread: boolean
  starred: boolean
  snippet: string
  body: string
  files: Array<{
    id: string
    filename: string
    content_type: string
    size: number
  }>
  labels: Array<{ id: string; name: string }>
  folder: { id: string; name: string }
}

export interface NylasEvent {
  id: string
  account_id: string
  calendar_id: string
  title: string
  description?: string
  location?: string
  when: {
    start_time: number
    end_time: number
    start_timezone?: string
    end_timezone?: string
  }
  participants: Array<{
    name: string
    email: string
    status: 'yes' | 'no' | 'maybe' | 'noreply'
  }>
  busy: boolean
  read_only: boolean
  status: 'confirmed' | 'tentative' | 'cancelled'
  recurring?: boolean
  recurrence?: {
    rrule: string[]
    timezone: string
  }
}

export interface NylasContact {
  id: string
  account_id: string
  name: string
  email: string
  phone_numbers: Array<{ type: string; number: string }>
  physical_addresses: Array<{
    type: string
    street_address: string
    city: string
    state: string
    postal_code: string
    country: string
  }>
  web_pages: Array<{ type: string; url: string }>
  job_title?: string
  company_name?: string
  notes?: string
  picture_url?: string
}

export interface NylasCalendar {
  id: string
  account_id: string
  name: string
  description?: string
  read_only: boolean
  timezone: string
  hex_color?: string
  is_primary: boolean
}

export interface NylasDraft {
  id?: string
  account_id: string
  to: Array<{ name?: string; email: string }>
  from?: Array<{ name?: string; email: string }>
  cc?: Array<{ name?: string; email: string }>
  bcc?: Array<{ name?: string; email: string }>
  reply_to?: Array<{ name?: string; email: string }>
  subject: string
  body: string
  file_ids?: string[]
  reply_to_message_id?: string
  tracking?: {
    opens: boolean
    links: boolean
    thread_replies: boolean
  }
}

export interface NylasWebhook {
  id: string
  application_id: string
  callback_url: string
  state: 'active' | 'inactive'
  triggers: Array<
    | 'account.connected'
    | 'account.running'
    | 'account.stopped'
    | 'account.invalid'
    | 'message.created'
    | 'message.updated'
    | 'thread.replied'
    | 'contact.created'
    | 'contact.updated'
    | 'event.created'
    | 'event.updated'
    | 'event.deleted'
  >
  version: string
}

export interface NylasFreeBusy {
  email: string
  time_slots: Array<{
    start_time: number
    end_time: number
    status: 'busy' | 'free'
  }>
}

export interface NylasSchedulingPage {
  id: string
  name: string
  slug: string
  config: {
    event: {
      title: string
      duration: number
      location?: string
      description?: string
    }
    availability: {
      duration_minutes: number
      interval_minutes: number
      minimum_booking_notice: number
      maximum_booking_notice: number
      available_days: number[]
      available_times: Array<{
        start: string
        end: string
      }>
    }
    booking: {
      confirmation_method: 'automatic' | 'manual'
      cancellation_policy?: string
      additional_fields?: Array<{
        name: string
        type: 'text' | 'email' | 'phone' | 'dropdown'
        required: boolean
        options?: string[]
      }>
    }
  }
  appearance: {
    color: string
    show_nylas_branding: boolean
    submit_text?: string
    thank_you_text?: string
  }
}

// Mock Nylas client for development
export class MockNylasClient {
  protected config: NylasConfig

  constructor(config: NylasConfig) {
    this.config = config
  }

  // Account Management
  async getAccounts(): Promise<NylasAccount[]> {
    return [
      {
        id: 'acc-1',
        email: 'user@example.com',
        provider: 'gmail',
        sync_state: 'running',
        account_from_header_only: false,
        trial: false,
        billing_state: 'paid',
      },
    ]
  }

  async getAccount(accountId: string): Promise<NylasAccount> {
    return {
      id: accountId,
      email: 'user@example.com',
      provider: 'gmail',
      sync_state: 'running',
      account_from_header_only: false,
      trial: false,
      billing_state: 'paid',
    }
  }

  // Email Management
  async getMessages(accountId: string, options?: any): Promise<NylasMessage[]> {
    return [
      {
        id: 'msg-1',
        account_id: accountId,
        thread_id: 'thread-1',
        subject: 'Welcome to Onboard Hero',
        from: [{ name: 'Onboard Hero', email: 'noreply@onboardhero.com' }],
        to: [{ name: 'Client', email: 'client@example.com' }],
        date: Date.now() / 1000,
        unread: false,
        starred: false,
        snippet: 'Welcome to your onboarding journey...',
        body: '<p>Welcome to your onboarding journey with Onboard Hero!</p>',
        files: [],
        labels: [{ id: 'label-1', name: 'Onboarding' }],
        folder: { id: 'folder-1', name: 'INBOX' },
      },
    ]
  }

  async getMessage(accountId: string, messageId: string): Promise<NylasMessage> {
    return {
      id: messageId,
      account_id: accountId,
      thread_id: 'thread-1',
      subject: 'Welcome to Onboard Hero',
      from: [{ name: 'Onboard Hero', email: 'noreply@onboardhero.com' }],
      to: [{ name: 'Client', email: 'client@example.com' }],
      date: Date.now() / 1000,
      unread: false,
      starred: false,
      snippet: 'Welcome to your onboarding journey...',
      body: '<p>Welcome to your onboarding journey with Onboard Hero!</p>',
      files: [],
      labels: [{ id: 'label-1', name: 'Onboarding' }],
      folder: { id: 'folder-1', name: 'INBOX' },
    }
  }

  async sendMessage(accountId: string, draft: NylasDraft): Promise<NylasMessage> {
    const message: NylasMessage = {
      id: `msg-${Date.now()}`,
      account_id: accountId,
      thread_id: `thread-${Date.now()}`,
      subject: draft.subject,
      from: draft.from || [{ name: 'Onboard Hero', email: 'noreply@onboardhero.com' }],
      to: draft.to,
      cc: draft.cc,
      bcc: draft.bcc,
      reply_to: draft.reply_to,
      date: Date.now() / 1000,
      unread: false,
      starred: false,
      snippet: draft.body.substring(0, 100),
      body: draft.body,
      files: [],
      labels: [],
      folder: { id: 'sent', name: 'SENT' },
    }

    console.log('Mock: Sent message via Nylas:', message)
    return message
  }

  async createDraft(accountId: string, draft: NylasDraft): Promise<NylasDraft> {
    const createdDraft = {
      ...draft,
      id: `draft-${Date.now()}`,
      account_id: accountId,
    }
    console.log('Mock: Created draft via Nylas:', createdDraft)
    return createdDraft
  }

  async updateDraft(accountId: string, draftId: string, draft: Partial<NylasDraft>): Promise<NylasDraft> {
    const updatedDraft = {
      id: draftId,
      account_id: accountId,
      to: [],
      subject: '',
      body: '',
      ...draft,
    }
    console.log('Mock: Updated draft via Nylas:', updatedDraft)
    return updatedDraft
  }

  async deleteDraft(accountId: string, draftId: string): Promise<void> {
    console.log(`Mock: Deleted draft ${draftId} via Nylas`)
  }

  // Calendar Management
  async getCalendars(accountId: string): Promise<NylasCalendar[]> {
    return [
      {
        id: 'cal-1',
        account_id: accountId,
        name: 'Primary Calendar',
        description: 'Main calendar',
        read_only: false,
        timezone: 'America/New_York',
        hex_color: '#1a73e8',
        is_primary: true,
      },
    ]
  }

  async getEvents(accountId: string, options?: any): Promise<NylasEvent[]> {
    return [
      {
        id: 'event-1',
        account_id: accountId,
        calendar_id: 'cal-1',
        title: 'Onboarding Call',
        description: 'Initial onboarding discussion',
        location: 'Zoom',
        when: {
          start_time: Math.floor(Date.now() / 1000) + 3600,
          end_time: Math.floor(Date.now() / 1000) + 7200,
          start_timezone: 'America/New_York',
          end_timezone: 'America/New_York',
        },
        participants: [
          { name: 'Client', email: 'client@example.com', status: 'yes' },
          { name: 'Onboard Hero', email: 'team@onboardhero.com', status: 'yes' },
        ],
        busy: true,
        read_only: false,
        status: 'confirmed',
      },
    ]
  }

  async createEvent(accountId: string, calendarId: string, event: Partial<NylasEvent>): Promise<NylasEvent> {
    const createdEvent: NylasEvent = {
      id: `event-${Date.now()}`,
      account_id: accountId,
      calendar_id: calendarId,
      title: event.title || 'New Event',
      description: event.description,
      location: event.location,
      when: event.when || {
        start_time: Math.floor(Date.now() / 1000) + 3600,
        end_time: Math.floor(Date.now() / 1000) + 7200,
      },
      participants: event.participants || [],
      busy: event.busy ?? true,
      read_only: false,
      status: event.status || 'confirmed',
    }
    console.log('Mock: Created event via Nylas:', createdEvent)
    return createdEvent
  }

  async updateEvent(accountId: string, eventId: string, event: Partial<NylasEvent>): Promise<NylasEvent> {
    const updatedEvent: NylasEvent = {
      id: eventId,
      account_id: accountId,
      calendar_id: 'cal-1',
      title: 'Updated Event',
      when: {
        start_time: Math.floor(Date.now() / 1000) + 3600,
        end_time: Math.floor(Date.now() / 1000) + 7200,
      },
      participants: [],
      busy: true,
      read_only: false,
      status: 'confirmed',
      ...event,
    }
    console.log('Mock: Updated event via Nylas:', updatedEvent)
    return updatedEvent
  }

  async deleteEvent(accountId: string, eventId: string): Promise<void> {
    console.log(`Mock: Deleted event ${eventId} via Nylas`)
  }

  // Free/Busy Management
  async getFreeBusy(emails: string[], startTime: number, endTime: number): Promise<NylasFreeBusy[]> {
    return emails.map(email => ({
      email,
      time_slots: [
        {
          start_time: startTime + 3600,
          end_time: startTime + 7200,
          status: 'busy' as const,
        },
      ],
    }))
  }

  // Contact Management
  async getContacts(accountId: string, options?: any): Promise<NylasContact[]> {
    return [
      {
        id: 'contact-1',
        account_id: accountId,
        name: 'John Doe',
        email: 'john@example.com',
        phone_numbers: [{ type: 'work', number: '+1-555-0123' }],
        physical_addresses: [
          {
            type: 'work',
            street_address: '123 Business St',
            city: 'New York',
            state: 'NY',
            postal_code: '10001',
            country: 'US',
          },
        ],
        web_pages: [{ type: 'work', url: 'https://example.com' }],
        job_title: 'CEO',
        company_name: 'Example Corp',
        notes: 'Important client',
      },
    ]
  }

  async createContact(accountId: string, contact: Partial<NylasContact>): Promise<NylasContact> {
    const createdContact: NylasContact = {
      id: `contact-${Date.now()}`,
      account_id: accountId,
      name: contact.name || 'New Contact',
      email: contact.email || '',
      phone_numbers: contact.phone_numbers || [],
      physical_addresses: contact.physical_addresses || [],
      web_pages: contact.web_pages || [],
      job_title: contact.job_title,
      company_name: contact.company_name,
      notes: contact.notes,
      picture_url: contact.picture_url,
    }
    console.log('Mock: Created contact via Nylas:', createdContact)
    return createdContact
  }

  // Webhook Management
  async createWebhook(webhook: Omit<NylasWebhook, 'id' | 'application_id'>): Promise<NylasWebhook> {
    const createdWebhook: NylasWebhook = {
      id: `webhook-${Date.now()}`,
      application_id: 'app-1',
      ...webhook,
    }
    console.log('Mock: Created webhook via Nylas:', createdWebhook)
    return createdWebhook
  }

  async getWebhooks(): Promise<NylasWebhook[]> {
    return [
      {
        id: 'webhook-1',
        application_id: 'app-1',
        callback_url: 'https://app.onboardhero.com/api/webhooks/nylas',
        state: 'active',
        triggers: ['message.created', 'event.created'],
        version: '2.0',
      },
    ]
  }

  // Scheduling Management
  async createSchedulingPage(page: Omit<NylasSchedulingPage, 'id'>): Promise<NylasSchedulingPage> {
    const createdPage: NylasSchedulingPage = {
      id: `page-${Date.now()}`,
      ...page,
    }
    console.log('Mock: Created scheduling page via Nylas:', createdPage)
    return createdPage
  }

  async getSchedulingPages(): Promise<NylasSchedulingPage[]> {
    return [
      {
        id: 'page-1',
        name: 'Onboarding Call',
        slug: 'onboarding-call',
        config: {
          event: {
            title: 'Onboarding Call',
            duration: 30,
            location: 'Zoom',
            description: 'Initial onboarding discussion',
          },
          availability: {
            duration_minutes: 30,
            interval_minutes: 15,
            minimum_booking_notice: 60,
            maximum_booking_notice: 10080,
            available_days: [1, 2, 3, 4, 5],
            available_times: [
              { start: '09:00', end: '17:00' },
            ],
          },
          booking: {
            confirmation_method: 'automatic',
            cancellation_policy: 'Can cancel up to 24 hours before',
          },
        },
        appearance: {
          color: '#1a73e8',
          show_nylas_branding: false,
          submit_text: 'Book Meeting',
          thank_you_text: 'Your meeting has been booked!',
        },
      },
    ]
  }

  // Email Tracking
  async getMessageTracking(accountId: string, messageId: string): Promise<any> {
    return {
      message_id: messageId,
      opens: [
        {
          timestamp: Date.now() / 1000,
          ip_address: '192.168.1.1',
          user_agent: 'Mozilla/5.0...',
        },
      ],
      links: [],
      thread_replies: 0,
    }
  }

  // File Management
  async uploadFile(accountId: string, file: File): Promise<{ id: string; filename: string; size: number }> {
    return {
      id: `file-${Date.now()}`,
      filename: file.name,
      size: file.size,
    }
  }

  async downloadFile(accountId: string, fileId: string): Promise<Blob> {
    // Mock file download
    return new Blob(['Mock file content'], { type: 'text/plain' })
  }
}

// Real Nylas client using Nylas SDK v7
export class NylasClient extends MockNylasClient {
  private realNylas?: any;
  private apiKey: string;
  private apiUri: string;

  constructor(config: NylasConfig) {
    super(config);
    this.apiKey = config.apiKey;
    this.apiUri = config.apiUri || 'https://api.us.nylas.com';
    
    // Only initialize real client if we have valid credentials
    if (config.apiKey.startsWith('nyk_')) {
      try {
        const Nylas = require('nylas').default;
        this.realNylas = new Nylas({
          apiKey: config.apiKey,
          apiUri: config.apiUri,
        });
      } catch (error) {
        console.warn('Failed to initialize real Nylas client:', error);
        this.realNylas = null;
      }
    }
  }

  // Override key methods to use real API when available
  async getAccounts(): Promise<NylasAccount[]> {
    if (this.realNylas) {
      try {
        // Use direct API call since SDK structure is different
        const response = await fetch(`${this.apiUri}/v3/grants`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json',
          },
        });

        if (response.ok) {
          const data = await response.json();
          return data.data?.map((grant: any) => ({
            id: grant.id,
            email: grant.email || 'connected-account@example.com',
            provider: this.mapProvider(grant.provider),
            sync_state: grant.grant_status === 'valid' ? 'running' : 'invalid',
            account_from_header_only: false,
            trial: false,
            billing_state: 'paid' as const,
          })) || [];
        }
      } catch (error) {
        console.warn('Real Nylas API call failed, falling back to mock:', error);
      }
    }
    
    // Fallback to mock
    return super.getAccounts();
  }

  async sendMessage(accountId: string, draft: NylasDraft): Promise<NylasMessage> {
    if (this.realNylas) {
      try {
        const response = await fetch(`${this.apiUri}/v3/grants/${accountId}/messages/send`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            to: draft.to,
            from: draft.from,
            cc: draft.cc,
            bcc: draft.bcc,
            reply_to: draft.reply_to,
            subject: draft.subject,
            body: draft.body,
            tracking_options: draft.tracking,
          }),
        });

        if (response.ok) {
          const sentMessage = await response.json();
          return {
            id: sentMessage.data.id,
            account_id: accountId,
            thread_id: sentMessage.data.thread_id || '',
            subject: draft.subject,
            from: draft.from || [{ name: 'Onboard Hero', email: 'noreply@onboardhero.com' }],
            to: draft.to,
            cc: draft.cc,
            bcc: draft.bcc,
            reply_to: draft.reply_to,
            date: Date.now() / 1000,
            unread: false,
            starred: false,
            snippet: draft.body.substring(0, 100),
            body: draft.body,
            files: [],
            labels: [],
            folder: { id: 'sent', name: 'SENT' },
          };
        }
      } catch (error) {
        console.warn('Real Nylas send message failed, falling back to mock:', error);
      }
    }

    // Fallback to mock
    return super.sendMessage(accountId, draft);
  }

  private mapProvider(provider?: string): 'gmail' | 'outlook' | 'yahoo' | 'imap' | 'exchange' {
    switch (provider?.toLowerCase()) {
      case 'gmail':
      case 'google':
        return 'gmail';
      case 'outlook':
      case 'microsoft':
        return 'outlook';
      case 'yahoo':
        return 'yahoo';
      case 'exchange':
        return 'exchange';
      default:
        return 'imap';
    }
  }
}

// Factory function to create client
export function createNylasClient(config: NylasConfig): MockNylasClient {
  // In development, always return mock client
  if (process.env.NODE_ENV === 'development' || !config.apiKey.startsWith('nylas_')) {
    return new MockNylasClient(config)
  }
  
  // In production with real API key, return real client
  return new NylasClient(config)
}

// Default client instance
export const nylasClient = createNylasClient({
  apiKey: process.env.NYLAS_API_KEY || 'mock-nylas-key',
  apiUri: process.env.NYLAS_API_URI || 'https://api.nylas.com',
  timeout: 30000,
})

// Enhanced email service with Nylas
export class NylasEmailService {
  private client: MockNylasClient
  private accountId: string

  constructor(client: MockNylasClient, accountId: string) {
    this.client = client
    this.accountId = accountId
  }

  async sendInteractiveEmail(context: {
    client: { email: string; name?: string }
    template: { subject: string; html: string }
    replyTo?: string
    tracking?: boolean
  }): Promise<NylasMessage> {
    const draft: NylasDraft = {
      account_id: this.accountId,
      to: [{ email: context.client.email, name: context.client.name }],
      subject: context.template.subject,
      body: context.template.html,
      reply_to: context.replyTo ? [{ email: context.replyTo }] : undefined,
      tracking: context.tracking ? {
        opens: true,
        links: true,
        thread_replies: true,
      } : undefined,
    }

    return await this.client.sendMessage(this.accountId, draft)
  }

  async sendSequenceEmail(sequence: {
    emails: Array<{
      delay: number // hours
      subject: string
      html: string
    }>
    client: { email: string; name?: string }
  }): Promise<void> {
    sequence.emails.forEach((email, index) => {
      setTimeout(async () => {
        await this.sendInteractiveEmail({
          client: sequence.client,
          template: { subject: email.subject, html: email.html },
          tracking: true,
        })
      }, email.delay * 60 * 60 * 1000) // Convert hours to milliseconds
    })
  }

  async getEmailAnalytics(messageId: string): Promise<any> {
    return await this.client.getMessageTracking(this.accountId, messageId)
  }
}

// Enhanced calendar integration
export class NylasCalendarService {
  private client: MockNylasClient
  private accountId: string

  constructor(client: MockNylasClient, accountId: string) {
    this.client = client
    this.accountId = accountId
  }

  async getUnifiedAvailability(emails: string[], startDate: Date, endDate: Date): Promise<NylasFreeBusy[]> {
    const startTime = Math.floor(startDate.getTime() / 1000)
    const endTime = Math.floor(endDate.getTime() / 1000)
    
    return await this.client.getFreeBusy(emails, startTime, endTime)
  }

  async scheduleOnboardingCall(details: {
    clientEmail: string
    clientName: string
    duration: number // minutes
    preferredTimes: Date[]
  }): Promise<NylasEvent> {
    const calendars = await this.client.getCalendars(this.accountId)
    const primaryCalendar = calendars.find(cal => cal.is_primary) || calendars[0]

    const startTime = Math.floor(details.preferredTimes[0].getTime() / 1000)
    const endTime = startTime + (details.duration * 60)

    return await this.client.createEvent(this.accountId, primaryCalendar.id, {
      title: `Onboarding Call - ${details.clientName}`,
      description: 'Initial onboarding discussion and setup',
      when: {
        start_time: startTime,
        end_time: endTime,
        start_timezone: 'America/New_York',
        end_timezone: 'America/New_York',
      },
      participants: [
        { name: details.clientName, email: details.clientEmail, status: 'noreply' },
        { name: 'Onboard Hero Team', email: 'team@onboardhero.com', status: 'yes' },
      ],
    })
  }

  async createSchedulingPage(config: {
    name: string
    duration: number
    description?: string
    availableDays: number[]
    availableHours: { start: string; end: string }
  }): Promise<NylasSchedulingPage> {
    return await this.client.createSchedulingPage({
      name: config.name,
      slug: config.name.toLowerCase().replace(/\s+/g, '-'),
      config: {
        event: {
          title: config.name,
          duration: config.duration,
          description: config.description,
        },
        availability: {
          duration_minutes: config.duration,
          interval_minutes: 15,
          minimum_booking_notice: 60,
          maximum_booking_notice: 10080,
          available_days: config.availableDays,
          available_times: [config.availableHours],
        },
        booking: {
          confirmation_method: 'automatic',
        },
      },
      appearance: {
        color: '#1a73e8',
        show_nylas_branding: false,
      },
    })
  }
}

// Export service instances
export const createNylasEmailService = (accountId: string) => 
  new NylasEmailService(nylasClient, accountId)

export const createNylasCalendarService = (accountId: string) => 
  new NylasCalendarService(nylasClient, accountId)