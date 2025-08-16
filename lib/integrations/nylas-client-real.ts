// Real Nylas Integration Implementation for OnboardKit
// Uses the actual Nylas SDK v7 for production functionality

import Nylas from 'nylas';
import type {
  NylasConfig,
  NylasAccount,
  NylasMessage,
  NylasEvent,
  NylasContact,
  NylasCalendar,
  NylasDraft,
  NylasWebhook,
  NylasFreeBusy,
  NylasSchedulingPage,
} from './nylas-client';

export class RealNylasClient {
  private nylas: Nylas;
  private config: NylasConfig;

  constructor(config: NylasConfig) {
    this.config = config;
    this.nylas = new Nylas({
      apiKey: config.apiKey,
      apiUri: config.apiUri || 'https://api.us.nylas.com',
    });
  }

  // Account Management
  async getAccounts(): Promise<NylasAccount[]> {
    try {
      const response = await this.nylas.accounts.list();
      return response.data.map(account => ({
        id: account.id,
        email: account.email || '',
        provider: this.mapProvider(account.provider),
        sync_state: this.mapSyncState(account.syncState),
        account_from_header_only: false,
        trial: false,
        billing_state: 'paid' as const,
      }));
    } catch (error) {
      console.error('Real Nylas getAccounts error:', error);
      return [];
    }
  }

  async getAccount(accountId: string): Promise<NylasAccount> {
    try {
      const account = await this.nylas.accounts.find(accountId);
      return {
        id: account.id,
        email: account.email || '',
        provider: this.mapProvider(account.provider),
        sync_state: this.mapSyncState(account.syncState),
        account_from_header_only: false,
        trial: false,
        billing_state: 'paid' as const,
      };
    } catch (error) {
      console.error('Real Nylas getAccount error:', error);
      throw error;
    }
  }

  // Email Management
  async getMessages(accountId: string, options?: any): Promise<NylasMessage[]> {
    try {
      const queryParams: any = {
        limit: options?.limit || 50,
        offset: options?.offset || 0,
      };

      if (options?.unread) {
        queryParams.unread = true;
      }

      const response = await this.nylas.messages.list({
        identifier: accountId,
        queryParams,
      });

      return response.data.map(message => ({
        id: message.id,
        account_id: accountId,
        thread_id: message.threadId || '',
        subject: message.subject || '',
        from: message.from?.map(f => ({ name: f.name, email: f.email })) || [],
        to: message.to?.map(t => ({ name: t.name, email: t.email })) || [],
        cc: message.cc?.map(c => ({ name: c.name, email: c.email })),
        bcc: message.bcc?.map(b => ({ name: b.name, email: b.email })),
        reply_to: message.replyTo?.map(r => ({ name: r.name, email: r.email })),
        date: message.date || Date.now() / 1000,
        unread: message.unread || false,
        starred: message.starred || false,
        snippet: message.snippet || '',
        body: message.body || '',
        files: message.attachments?.map(att => ({
          id: att.id || '',
          filename: att.filename || '',
          content_type: att.contentType || '',
          size: att.size || 0,
        })) || [],
        labels: message.folders?.map(f => ({ id: f, name: f })) || [],
        folder: { id: 'inbox', name: 'INBOX' },
      }));
    } catch (error) {
      console.error('Real Nylas getMessages error:', error);
      return [];
    }
  }

  async getMessage(accountId: string, messageId: string): Promise<NylasMessage> {
    try {
      const message = await this.nylas.messages.find({
        identifier: accountId,
        messageId,
      });

      return {
        id: message.id,
        account_id: accountId,
        thread_id: message.threadId || '',
        subject: message.subject || '',
        from: message.from?.map(f => ({ name: f.name, email: f.email })) || [],
        to: message.to?.map(t => ({ name: t.name, email: t.email })) || [],
        cc: message.cc?.map(c => ({ name: c.name, email: c.email })),
        bcc: message.bcc?.map(b => ({ name: b.name, email: b.email })),
        reply_to: message.replyTo?.map(r => ({ name: r.name, email: r.email })),
        date: message.date || Date.now() / 1000,
        unread: message.unread || false,
        starred: message.starred || false,
        snippet: message.snippet || '',
        body: message.body || '',
        files: message.attachments?.map(att => ({
          id: att.id || '',
          filename: att.filename || '',
          content_type: att.contentType || '',
          size: att.size || 0,
        })) || [],
        labels: message.folders?.map(f => ({ id: f, name: f })) || [],
        folder: { id: 'inbox', name: 'INBOX' },
      };
    } catch (error) {
      console.error('Real Nylas getMessage error:', error);
      throw error;
    }
  }

  async sendMessage(accountId: string, draft: NylasDraft): Promise<NylasMessage> {
    try {
      const message = await this.nylas.messages.send({
        identifier: accountId,
        requestBody: {
          to: draft.to,
          from: draft.from,
          cc: draft.cc,
          bcc: draft.bcc,
          replyTo: draft.reply_to,
          subject: draft.subject,
          body: draft.body,
          attachments: draft.file_ids?.map(id => ({ id })),
          replyToMessageId: draft.reply_to_message_id,
          trackingOptions: draft.tracking ? {
            opens: draft.tracking.opens,
            links: draft.tracking.links,
            threadReplies: draft.tracking.thread_replies,
          } : undefined,
        },
      });

      return {
        id: message.id,
        account_id: accountId,
        thread_id: message.threadId || '',
        subject: message.subject || '',
        from: message.from?.map(f => ({ name: f.name, email: f.email })) || [],
        to: message.to?.map(t => ({ name: t.name, email: t.email })) || [],
        cc: message.cc?.map(c => ({ name: c.name, email: c.email })),
        bcc: message.bcc?.map(b => ({ name: b.name, email: b.email })),
        reply_to: message.replyTo?.map(r => ({ name: r.name, email: r.email })),
        date: message.date || Date.now() / 1000,
        unread: false,
        starred: false,
        snippet: message.snippet || '',
        body: message.body || '',
        files: [],
        labels: [],
        folder: { id: 'sent', name: 'SENT' },
      };
    } catch (error) {
      console.error('Real Nylas sendMessage error:', error);
      throw error;
    }
  }

  async createDraft(accountId: string, draft: NylasDraft): Promise<NylasDraft> {
    try {
      const createdDraft = await this.nylas.drafts.create({
        identifier: accountId,
        requestBody: {
          to: draft.to,
          from: draft.from,
          cc: draft.cc,
          bcc: draft.bcc,
          replyTo: draft.reply_to,
          subject: draft.subject,
          body: draft.body,
          attachments: draft.file_ids?.map(id => ({ id })),
          replyToMessageId: draft.reply_to_message_id,
        },
      });

      return {
        ...draft,
        id: createdDraft.id,
        account_id: accountId,
      };
    } catch (error) {
      console.error('Real Nylas createDraft error:', error);
      throw error;
    }
  }

  async updateDraft(accountId: string, draftId: string, draft: Partial<NylasDraft>): Promise<NylasDraft> {
    try {
      const updatedDraft = await this.nylas.drafts.update({
        identifier: accountId,
        draftId,
        requestBody: {
          to: draft.to,
          from: draft.from,
          cc: draft.cc,
          bcc: draft.bcc,
          replyTo: draft.reply_to,
          subject: draft.subject,
          body: draft.body,
          attachments: draft.file_ids?.map(id => ({ id })),
        },
      });

      return {
        id: updatedDraft.id,
        account_id: accountId,
        to: draft.to || [],
        subject: draft.subject || '',
        body: draft.body || '',
        ...draft,
      };
    } catch (error) {
      console.error('Real Nylas updateDraft error:', error);
      throw error;
    }
  }

  async deleteDraft(accountId: string, draftId: string): Promise<void> {
    try {
      await this.nylas.drafts.destroy({
        identifier: accountId,
        draftId,
      });
    } catch (error) {
      console.error('Real Nylas deleteDraft error:', error);
      throw error;
    }
  }

  // Calendar Management
  async getCalendars(accountId: string): Promise<NylasCalendar[]> {
    try {
      const response = await this.nylas.calendars.list({
        identifier: accountId,
      });

      return response.data.map(calendar => ({
        id: calendar.id,
        account_id: accountId,
        name: calendar.name || '',
        description: calendar.description,
        read_only: calendar.readOnly || false,
        timezone: calendar.timezone || 'UTC',
        hex_color: calendar.hexColor,
        is_primary: calendar.isPrimary || false,
      }));
    } catch (error) {
      console.error('Real Nylas getCalendars error:', error);
      return [];
    }
  }

  async getEvents(accountId: string, options?: any): Promise<NylasEvent[]> {
    try {
      const queryParams: any = {};
      
      if (options?.calendar_id) {
        queryParams.calendarId = options.calendar_id;
      }
      if (options?.starts_after) {
        queryParams.start = options.starts_after;
      }
      if (options?.ends_before) {
        queryParams.end = options.ends_before;
      }

      const response = await this.nylas.events.list({
        identifier: accountId,
        queryParams,
      });

      return response.data.map(event => ({
        id: event.id,
        account_id: accountId,
        calendar_id: event.calendarId || '',
        title: event.title || '',
        description: event.description,
        location: event.location,
        when: {
          start_time: event.when.startTime || Date.now() / 1000,
          end_time: event.when.endTime || Date.now() / 1000 + 3600,
          start_timezone: event.when.startTimezone,
          end_timezone: event.when.endTimezone,
        },
        participants: event.participants?.map(p => ({
          name: p.name || '',
          email: p.email || '',
          status: this.mapParticipantStatus(p.status),
        })) || [],
        busy: event.busy || false,
        read_only: event.readOnly || false,
        status: this.mapEventStatus(event.status),
      }));
    } catch (error) {
      console.error('Real Nylas getEvents error:', error);
      return [];
    }
  }

  async createEvent(accountId: string, calendarId: string, event: Partial<NylasEvent>): Promise<NylasEvent> {
    try {
      const createdEvent = await this.nylas.events.create({
        identifier: accountId,
        requestBody: {
          calendarId,
          title: event.title || 'New Event',
          description: event.description,
          location: event.location,
          when: event.when ? {
            startTime: event.when.start_time,
            endTime: event.when.end_time,
            startTimezone: event.when.start_timezone,
            endTimezone: event.when.end_timezone,
          } : {
            startTime: Math.floor(Date.now() / 1000) + 3600,
            endTime: Math.floor(Date.now() / 1000) + 7200,
          },
          participants: event.participants?.map(p => ({
            name: p.name,
            email: p.email,
            status: p.status,
          })),
          busy: event.busy,
        },
      });

      return {
        id: createdEvent.id,
        account_id: accountId,
        calendar_id: calendarId,
        title: createdEvent.title || '',
        description: createdEvent.description,
        location: createdEvent.location,
        when: {
          start_time: createdEvent.when.startTime || Date.now() / 1000,
          end_time: createdEvent.when.endTime || Date.now() / 1000 + 3600,
          start_timezone: createdEvent.when.startTimezone,
          end_timezone: createdEvent.when.endTimezone,
        },
        participants: createdEvent.participants?.map(p => ({
          name: p.name || '',
          email: p.email || '',
          status: this.mapParticipantStatus(p.status),
        })) || [],
        busy: createdEvent.busy || false,
        read_only: false,
        status: 'confirmed',
      };
    } catch (error) {
      console.error('Real Nylas createEvent error:', error);
      throw error;
    }
  }

  async updateEvent(accountId: string, eventId: string, event: Partial<NylasEvent>): Promise<NylasEvent> {
    try {
      const updatedEvent = await this.nylas.events.update({
        identifier: accountId,
        eventId,
        requestBody: {
          title: event.title,
          description: event.description,
          location: event.location,
          when: event.when ? {
            startTime: event.when.start_time,
            endTime: event.when.end_time,
            startTimezone: event.when.start_timezone,
            endTimezone: event.when.end_timezone,
          } : undefined,
          participants: event.participants?.map(p => ({
            name: p.name,
            email: p.email,
            status: p.status,
          })),
          busy: event.busy,
        },
      });

      return {
        id: updatedEvent.id,
        account_id: accountId,
        calendar_id: updatedEvent.calendarId || '',
        title: updatedEvent.title || '',
        description: updatedEvent.description,
        location: updatedEvent.location,
        when: {
          start_time: updatedEvent.when.startTime || Date.now() / 1000,
          end_time: updatedEvent.when.endTime || Date.now() / 1000 + 3600,
          start_timezone: updatedEvent.when.startTimezone,
          end_timezone: updatedEvent.when.endTimezone,
        },
        participants: updatedEvent.participants?.map(p => ({
          name: p.name || '',
          email: p.email || '',
          status: this.mapParticipantStatus(p.status),
        })) || [],
        busy: updatedEvent.busy || false,
        read_only: false,
        status: 'confirmed',
      };
    } catch (error) {
      console.error('Real Nylas updateEvent error:', error);
      throw error;
    }
  }

  async deleteEvent(accountId: string, eventId: string): Promise<void> {
    try {
      await this.nylas.events.destroy({
        identifier: accountId,
        eventId,
      });
    } catch (error) {
      console.error('Real Nylas deleteEvent error:', error);
      throw error;
    }
  }

  // Free/Busy Management
  async getFreeBusy(emails: string[], startTime: number, endTime: number): Promise<NylasFreeBusy[]> {
    try {
      // Note: Nylas v7 may have different free/busy API
      // This is a placeholder implementation
      return emails.map(email => ({
        email,
        time_slots: [],
      }));
    } catch (error) {
      console.error('Real Nylas getFreeBusy error:', error);
      return [];
    }
  }

  // Contact Management
  async getContacts(accountId: string, options?: any): Promise<NylasContact[]> {
    try {
      const response = await this.nylas.contacts.list({
        identifier: accountId,
        queryParams: {
          limit: options?.limit || 50,
          offset: options?.offset || 0,
        },
      });

      return response.data.map(contact => ({
        id: contact.id,
        account_id: accountId,
        name: contact.givenName ? `${contact.givenName} ${contact.surname || ''}`.trim() : '',
        email: contact.emails?.[0]?.email || '',
        phone_numbers: contact.phoneNumbers?.map(p => ({
          type: p.type || 'other',
          number: p.number || '',
        })) || [],
        physical_addresses: contact.physicalAddresses?.map(a => ({
          type: a.type || 'other',
          street_address: a.streetAddress || '',
          city: a.city || '',
          state: a.state || '',
          postal_code: a.postalCode || '',
          country: a.country || '',
        })) || [],
        web_pages: contact.webPages?.map(w => ({
          type: 'other',
          url: w.url || '',
        })) || [],
        job_title: contact.jobTitle,
        company_name: contact.companyName,
        notes: contact.notes,
        picture_url: contact.pictureUrl,
      }));
    } catch (error) {
      console.error('Real Nylas getContacts error:', error);
      return [];
    }
  }

  async createContact(accountId: string, contact: Partial<NylasContact>): Promise<NylasContact> {
    try {
      const nameParts = contact.name?.split(' ') || [''];
      const createdContact = await this.nylas.contacts.create({
        identifier: accountId,
        requestBody: {
          givenName: nameParts[0] || '',
          surname: nameParts.slice(1).join(' ') || undefined,
          emails: contact.email ? [{ email: contact.email, type: 'work' }] : [],
          phoneNumbers: contact.phone_numbers?.map(p => ({
            type: p.type,
            number: p.number,
          })),
          physicalAddresses: contact.physical_addresses?.map(a => ({
            type: a.type,
            streetAddress: a.street_address,
            city: a.city,
            state: a.state,
            postalCode: a.postal_code,
            country: a.country,
          })),
          jobTitle: contact.job_title,
          companyName: contact.company_name,
          notes: contact.notes,
        },
      });

      return {
        id: createdContact.id,
        account_id: accountId,
        name: contact.name || '',
        email: contact.email || '',
        phone_numbers: contact.phone_numbers || [],
        physical_addresses: contact.physical_addresses || [],
        web_pages: contact.web_pages || [],
        job_title: contact.job_title,
        company_name: contact.company_name,
        notes: contact.notes,
        picture_url: contact.picture_url,
      };
    } catch (error) {
      console.error('Real Nylas createContact error:', error);
      throw error;
    }
  }

  // Webhook Management
  async createWebhook(webhook: Omit<NylasWebhook, 'id' | 'application_id'>): Promise<NylasWebhook> {
    try {
      const createdWebhook = await this.nylas.webhooks.create({
        requestBody: {
          callbackUrl: webhook.callback_url,
          triggers: webhook.triggers.map(trigger => ({
            type: trigger,
          })),
          webhookSecret: process.env.NYLAS_WEBHOOK_SECRET,
        },
      });

      return {
        id: createdWebhook.id,
        application_id: createdWebhook.applicationId || '',
        callback_url: createdWebhook.callbackUrl,
        state: createdWebhook.status === 'active' ? 'active' : 'inactive',
        triggers: webhook.triggers,
        version: '3.0',
      };
    } catch (error) {
      console.error('Real Nylas createWebhook error:', error);
      throw error;
    }
  }

  async getWebhooks(): Promise<NylasWebhook[]> {
    try {
      const response = await this.nylas.webhooks.list();
      return response.data.map(webhook => ({
        id: webhook.id,
        application_id: webhook.applicationId || '',
        callback_url: webhook.callbackUrl,
        state: webhook.status === 'active' ? 'active' : 'inactive',
        triggers: webhook.triggers?.map(t => t.type) || [],
        version: '3.0',
      }));
    } catch (error) {
      console.error('Real Nylas getWebhooks error:', error);
      return [];
    }
  }

  // Scheduling Management (placeholder - may need different implementation)
  async createSchedulingPage(page: Omit<NylasSchedulingPage, 'id'>): Promise<NylasSchedulingPage> {
    // This would need to be implemented based on Nylas Scheduler API
    console.log('Real Nylas createSchedulingPage - not yet implemented');
    return {
      id: `page-${Date.now()}`,
      ...page,
    };
  }

  async getSchedulingPages(): Promise<NylasSchedulingPage[]> {
    // This would need to be implemented based on Nylas Scheduler API
    console.log('Real Nylas getSchedulingPages - not yet implemented');
    return [];
  }

  // Email Tracking
  async getMessageTracking(accountId: string, messageId: string): Promise<any> {
    try {
      // This would need to be implemented based on Nylas tracking API
      console.log('Real Nylas getMessageTracking - not yet implemented');
      return {
        message_id: messageId,
        opens: [],
        links: [],
        thread_replies: 0,
      };
    } catch (error) {
      console.error('Real Nylas getMessageTracking error:', error);
      return null;
    }
  }

  // File Management
  async uploadFile(accountId: string, file: File): Promise<{ id: string; filename: string; size: number }> {
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await this.nylas.attachments.create({
        identifier: accountId,
        requestBody: formData,
      });

      return {
        id: response.id,
        filename: response.filename || file.name,
        size: response.size || file.size,
      };
    } catch (error) {
      console.error('Real Nylas uploadFile error:', error);
      throw error;
    }
  }

  async downloadFile(accountId: string, fileId: string): Promise<Blob> {
    try {
      const response = await this.nylas.attachments.download({
        identifier: accountId,
        attachmentId: fileId,
      });

      return new Blob([response]);
    } catch (error) {
      console.error('Real Nylas downloadFile error:', error);
      throw error;
    }
  }

  // Helper methods to map between Nylas v7 and our interface
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

  private mapSyncState(syncState?: string): 'running' | 'stopped' | 'invalid' {
    switch (syncState?.toLowerCase()) {
      case 'running':
      case 'active':
        return 'running';
      case 'stopped':
      case 'paused':
        return 'stopped';
      default:
        return 'invalid';
    }
  }

  private mapParticipantStatus(status?: string): 'yes' | 'no' | 'maybe' | 'noreply' {
    switch (status?.toLowerCase()) {
      case 'accepted':
      case 'yes':
        return 'yes';
      case 'declined':
      case 'no':
        return 'no';
      case 'tentative':
      case 'maybe':
        return 'maybe';
      default:
        return 'noreply';
    }
  }

  private mapEventStatus(status?: string): 'confirmed' | 'tentative' | 'cancelled' {
    switch (status?.toLowerCase()) {
      case 'confirmed':
        return 'confirmed';
      case 'tentative':
        return 'tentative';
      case 'cancelled':
        return 'cancelled';
      default:
        return 'confirmed';
    }
  }
}