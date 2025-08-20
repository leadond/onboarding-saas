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

// NYLAS Sync Services for Onboard Hero
// Provides comprehensive email, calendar, and contact synchronization

import { nylasClient, createNylasEmailService, createNylasCalendarService } from './nylas-client';
import { getSupabaseClient } from '@/lib/supabase';
import type { NylasMessage, NylasEvent, NylasContact } from './nylas-client';

export interface SyncResult {
  success: boolean;
  synchronized: number;
  errors: string[];
  lastSyncTime: string;
}

export interface OnboardingEmailSequence {
  id: string;
  name: string;
  emails: Array<{
    delay: number; // hours after trigger
    subject: string;
    template: string;
    conditions?: {
      stepCompleted?: string;
      responseReceived?: boolean;
    };
  }>;
}

// Enhanced Email Sync Service
export class NylasEmailSyncService {
  private supabase: any = null;
  private emailService: ReturnType<typeof createNylasEmailService>;

  constructor(private accountId: string) {
    this.emailService = createNylasEmailService(accountId);
  }

  /**
   * Send onboarding email sequence to a client
   */
  async sendOnboardingSequence(sequence: {
    clientEmail: string;
    clientName: string;
    kitId: string;
    templateType: 'welcome' | 'reminder' | 'completion';
    customData?: Record<string, any>;
  }): Promise<{ success: boolean; messageId?: string; error?: string }> {
    try {
      const template = await this.getEmailTemplate(sequence.templateType, sequence.customData);
      
      const message = await this.emailService.sendInteractiveEmail({
        client: {
          email: sequence.clientEmail,
          name: sequence.clientName,
        },
        template: {
          subject: template.subject.replace('{{clientName}}', sequence.clientName),
          html: template.html
            .replace('{{clientName}}', sequence.clientName)
            .replace('{{kitId}}', sequence.kitId),
        },
        tracking: true,
        replyTo: process.env.NYLAS_REPLY_TO_EMAIL,
      });

      // Store email in database for tracking
      await this.supabase
        .from('webhook_events')
        .insert({
          source: 'nylas',
          event_type: 'email.sent',
          event_data: {
            message_id: message.id,
            account_id: this.accountId,
            kit_id: sequence.kitId,
            client_email: sequence.clientEmail,
            template_type: sequence.templateType,
            subject: template.subject,
          },
          processed: false,
          created_at: new Date().toISOString(),
        });

      return { success: true, messageId: message.id };
    } catch (error) {
      console.error('Failed to send onboarding email:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  /**
   * Sync recent messages for client responses
   */
  async syncRecentMessages(options: {
    kitId?: string;
    clientEmail?: string;
    lastSyncTime?: Date;
  } = {}): Promise<SyncResult> {
    const startTime = Date.now();
    let synchronized = 0;
    const errors: string[] = [];

    try {
      const messages = await nylasClient.getMessages(this.accountId, {
        limit: 50,
        unread: false,
      });

      for (const message of messages) {
        try {
          // Check if this is a client response to onboarding
          const isClientResponse = await this.identifyClientResponse(message, options);
          
          if (isClientResponse) {
            await this.processClientResponse(message, options);
            synchronized++;
          }
        } catch (error) {
          errors.push(`Message ${message.id}: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
      }

      return {
        success: errors.length === 0,
        synchronized,
        errors,
        lastSyncTime: new Date().toISOString(),
      };
    } catch (error) {
      return {
        success: false,
        synchronized,
        errors: [error instanceof Error ? error.message : 'Sync failed'],
        lastSyncTime: new Date().toISOString(),
      };
    }
  }

  /**
   * Get email template by type
   */
  private async getEmailTemplate(templateType: string, customData?: Record<string, any>) {
    const templates = {
      welcome: {
        subject: 'Welcome to your onboarding journey, {{clientName}}!',
        html: `
          <h2>Welcome {{clientName}}!</h2>
          <p>We're excited to help you get started. Please complete your onboarding steps:</p>
          <a href="${process.env.NEXT_PUBLIC_APP_URL}/kit/{{kitId}}" 
             style="background: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
            Start Onboarding
          </a>
          <p>If you have any questions, just reply to this email.</p>
        `,
      },
      reminder: {
        subject: 'Reminder: Complete your onboarding steps',
        html: `
          <h2>Hi {{clientName}},</h2>
          <p>Just a friendly reminder about your pending onboarding steps.</p>
          <a href="${process.env.NEXT_PUBLIC_APP_URL}/kit/{{kitId}}" 
             style="background: #28a745; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
            Continue Onboarding
          </a>
        `,
      },
      completion: {
        subject: 'Congratulations! Your onboarding is complete',
        html: `
          <h2>Congratulations {{clientName}}!</h2>
          <p>You've successfully completed your onboarding. Welcome aboard!</p>
          <p>Here's what happens next...</p>
        `,
      },
    };

    return templates[templateType as keyof typeof templates] || templates.welcome;
  }

  /**
   * Identify if a message is a client response to onboarding
   */
  private async identifyClientResponse(message: NylasMessage, options: any): Promise<boolean> {
    // Check if the sender matches a client email
    if (options.clientEmail) {
      return message.from.some(sender => sender.email === options.clientEmail);
    }

    // Check thread for onboarding context
    const isOnboardingThread = message.subject?.toLowerCase().includes('onboarding') ||
                              message.body?.toLowerCase().includes('onboarding');

    return isOnboardingThread;
  }

  /**
   * Process a client response message
   */
  private async processClientResponse(message: NylasMessage, options: any): Promise<void> {
    // Store the response
    await this.supabase
      .from('webhook_events')
      .insert({
        source: 'nylas',
        event_type: 'client.response',
        event_data: {
          message_id: message.id,
          account_id: this.accountId,
          thread_id: message.thread_id,
          from_email: message.from[0]?.email,
          subject: message.subject,
          snippet: message.snippet,
          kit_id: options.kitId,
        },
        processed: false,
        created_at: new Date().toISOString(),
      });

    // TODO: Trigger workflow automation based on response
  }
}

// Enhanced Calendar Sync Service  
export class NylasCalendarSyncService {
  private calendarService: ReturnType<typeof createNylasCalendarService>;
  private supabase: any = null;

  constructor(private accountId: string) {
    this.calendarService = createNylasCalendarService(accountId);
  }

  /**
   * Schedule an onboarding call with a client
   */
  async scheduleOnboardingCall(details: {
    clientEmail: string;
    clientName: string;
    kitId: string;
    preferredTimes: Date[];
    duration: number; // minutes
    meetingType: 'kickoff' | 'checkpoint' | 'completion';
  }): Promise<{ success: boolean; eventId?: string; error?: string }> {
    try {
      const event = await this.calendarService.scheduleOnboardingCall({
        clientEmail: details.clientEmail,
        clientName: details.clientName,
        duration: details.duration,
        preferredTimes: details.preferredTimes,
      });

      // Store meeting in database
      await this.supabase
        .from('webhook_events')
        .insert({
          source: 'nylas',
          event_type: 'meeting.scheduled',
          event_data: {
            event_id: event.id,
            account_id: this.accountId,
            kit_id: details.kitId,
            client_email: details.clientEmail,
            meeting_type: details.meetingType,
            event_title: event.title,
            start_time: event.when.start_time,
            end_time: event.when.end_time,
          },
          processed: false,
          created_at: new Date().toISOString(),
        });

      return { success: true, eventId: event.id };
    } catch (error) {
      console.error('Failed to schedule onboarding call:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  /**
   * Sync calendar events for onboarding meetings
   */
  async syncOnboardingEvents(options: {
    kitId?: string;
    startDate?: Date;
    endDate?: Date;
  } = {}): Promise<SyncResult> {
    let synchronized = 0;
    const errors: string[] = [];

    try {
      const startTime = options.startDate ? Math.floor(options.startDate.getTime() / 1000) : undefined;
      const endTime = options.endDate ? Math.floor(options.endDate.getTime() / 1000) : undefined;

      const events = await nylasClient.getEvents(this.accountId, {
        starts_after: startTime,
        ends_before: endTime,
      });

      for (const event of events) {
        try {
          // Check if this is an onboarding-related event
          const isOnboardingEvent = event.title?.toLowerCase().includes('onboarding') ||
                                   event.description?.toLowerCase().includes('onboarding');

          if (isOnboardingEvent) {
            await this.processOnboardingEvent(event, options);
            synchronized++;
          }
        } catch (error) {
          errors.push(`Event ${event.id}: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
      }

      return {
        success: errors.length === 0,
        synchronized,
        errors,
        lastSyncTime: new Date().toISOString(),
      };
    } catch (error) {
      return {
        success: false,
        synchronized,
        errors: [error instanceof Error ? error.message : 'Sync failed'],
        lastSyncTime: new Date().toISOString(),
      };
    }
  }

  /**
   * Process an onboarding calendar event
   */
  private async processOnboardingEvent(event: NylasEvent, options: any): Promise<void> {
    // Store the event
    await this.supabase
      .from('webhook_events')
      .insert({
        source: 'nylas',
        event_type: 'onboarding.event',
        event_data: {
          event_id: event.id,
          account_id: this.accountId,
          calendar_id: event.calendar_id,
          title: event.title,
          start_time: event.when.start_time,
          end_time: event.when.end_time,
          participants: event.participants,
          kit_id: options.kitId,
        },
        processed: false,
        created_at: new Date().toISOString(),
      });
  }

  /**
   * Get availability for scheduling
   */
  async getAvailability(emails: string[], startDate: Date, endDate: Date): Promise<any[]> {
    const startTime = Math.floor(startDate.getTime() / 1000);
    const endTime = Math.floor(endDate.getTime() / 1000);

    return await this.calendarService.getUnifiedAvailability(emails, startDate, endDate);
  }
}

// Contact Sync Service
export class NylasContactSyncService {
  private supabase: any = null;

  constructor(private accountId: string) {}

  /**
   * Sync contacts and identify onboarding clients
   */
  async syncOnboardingContacts(): Promise<SyncResult> {
    let synchronized = 0;
    const errors: string[] = [];

    try {
      const contacts = await nylasClient.getContacts(this.accountId, {
        limit: 100,
      });

      for (const contact of contacts) {
        try {
          await this.processContact(contact);
          synchronized++;
        } catch (error) {
          errors.push(`Contact ${contact.id}: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
      }

      return {
        success: errors.length === 0,
        synchronized,
        errors,
        lastSyncTime: new Date().toISOString(),
      };
    } catch (error) {
      return {
        success: false,
        synchronized,
        errors: [error instanceof Error ? error.message : 'Sync failed'],
        lastSyncTime: new Date().toISOString(),
      };
    }
  }

  /**
   * Process a contact for onboarding context
   */
  private async processContact(contact: NylasContact): Promise<void> {
    // Check if this contact is associated with any onboarding kits
    const { data: clientProgress } = await this.supabase
      .from('client_progress')
      .select('*')
      .eq('client_email', contact.email)
      .limit(1);

    if (clientProgress && clientProgress.length > 0) {
      // Store contact sync event
      await this.supabase
        .from('webhook_events')
        .insert({
          source: 'nylas',
          event_type: 'contact.synced',
          event_data: {
            contact_id: contact.id,
            account_id: this.accountId,
            email: contact.email,
            name: contact.name,
            company: contact.company_name,
            is_onboarding_client: true,
          },
          processed: false,
          created_at: new Date().toISOString(),
        });
    }
  }
}

// Master Sync Coordinator
export class NylasSyncCoordinator {
  private emailSync: NylasEmailSyncService;
  private calendarSync: NylasCalendarSyncService;
  private contactSync: NylasContactSyncService;

  constructor(accountId: string) {
    this.emailSync = new NylasEmailSyncService(accountId);
    this.calendarSync = new NylasCalendarSyncService(accountId);
    this.contactSync = new NylasContactSyncService(accountId);
  }

  /**
   * Perform comprehensive sync of all NYLAS data
   */
  async performFullSync(): Promise<{
    email: SyncResult;
    calendar: SyncResult;
    contacts: SyncResult;
    overall: { success: boolean; totalSynced: number };
  }> {
    console.log('🔄 Starting comprehensive NYLAS sync...');

    const results = await Promise.allSettled([
      this.emailSync.syncRecentMessages(),
      this.calendarSync.syncOnboardingEvents(),
      this.contactSync.syncOnboardingContacts(),
    ]);

    const email = results[0].status === 'fulfilled' ? results[0].value : {
      success: false,
      synchronized: 0,
      errors: ['Email sync failed'],
      lastSyncTime: new Date().toISOString(),
    };

    const calendar = results[1].status === 'fulfilled' ? results[1].value : {
      success: false,
      synchronized: 0,
      errors: ['Calendar sync failed'],
      lastSyncTime: new Date().toISOString(),
    };

    const contacts = results[2].status === 'fulfilled' ? results[2].value : {
      success: false,
      synchronized: 0,
      errors: ['Contact sync failed'],
      lastSyncTime: new Date().toISOString(),
    };

    const totalSynced = email.synchronized + calendar.synchronized + contacts.synchronized;
    const overallSuccess = email.success && calendar.success && contacts.success;

    console.log(`✅ Sync complete: ${totalSynced} items synchronized`);

    return {
      email,
      calendar,
      contacts,
      overall: {
        success: overallSuccess,
        totalSynced,
      },
    };
  }

  /**
   * Get email service for sending onboarding emails
   */
  getEmailService(): NylasEmailSyncService {
    return this.emailSync;
  }

  /**
   * Get calendar service for scheduling meetings
   */
  getCalendarService(): NylasCalendarSyncService {
    return this.calendarSync;
  }

  /**
   * Get contact service for syncing client information
   */
  getContactService(): NylasContactSyncService {
    return this.contactSync;
  }
}

// Factory function to create sync coordinator
export async function createNylasSyncCoordinator(accountId: string): NylasSyncCoordinator {
  return new NylasSyncCoordinator(accountId);
}