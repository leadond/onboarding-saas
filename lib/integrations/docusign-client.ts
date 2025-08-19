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

'use client'

import { createClient } from '@/lib/supabase/client'

export interface DocuSignTemplate {
  templateId: string
  name: string
  description?: string
  fields: DocuSignField[]
}

export interface DocuSignField {
  name: string
  type: 'text' | 'signature' | 'date' | 'checkbox' | 'radio'
  required: boolean
  tabLabel?: string
  value?: string
  locked?: boolean
  recipientId?: string
}

export interface DocuSignEnvelope {
  envelopeId: string
  status: 'created' | 'sent' | 'delivered' | 'signed' | 'completed' | 'declined' | 'voided'
  documentsUri?: string
  recipientsUri?: string
  createdDateTime?: string
  sentDateTime?: string
  completedDateTime?: string
  statusChangedDateTime?: string
}

export interface DocuSignRecipient {
  recipientId: string
  recipientType: 'signer' | 'carbonCopy' | 'certifiedDelivery'
  name: string
  email: string
  routingOrder?: number
  tabs?: DocuSignField[]
}

export interface ContractSigningData {
  templateId: string
  recipientName: string
  recipientEmail: string
  customFields?: Record<string, string>
  returnUrl?: string
  signerCanSignOnMobile?: boolean
}

class DocuSignClient {
  private supabase = createClient()
  private baseUrl: string
  private apiVersion = 'v2.1'

  constructor() {
    this.baseUrl = process.env.NEXT_PUBLIC_DOCUSIGN_BASE_URL || 'https://demo.docusign.net/restapi'
  }

  /**
   * Initialize DocuSign integration (for development/testing)
   * In production, this would use actual DocuSign API
   */
  async initialize() {
    // For now, return mock initialization
    return {
      accountId: 'demo-account',
      baseUrl: this.baseUrl,
      isDemo: true
    }
  }

  /**
   * Create envelope from template
   */
  async createEnvelopeFromTemplate(data: ContractSigningData): Promise<DocuSignEnvelope> {
    try {
      // In development, return mock envelope
      if (process.env.NODE_ENV === 'development') {
        const mockEnvelope: DocuSignEnvelope = {
          envelopeId: `mock-envelope-${Date.now()}`,
          status: 'created',
          createdDateTime: new Date().toISOString()
        }
        
        // Save to database for tracking
        await this.saveEnvelopeToDatabase(mockEnvelope, data)
        
        return mockEnvelope
      }

      // Production DocuSign API call would go here
      const response = await fetch(`${this.baseUrl}/${this.apiVersion}/accounts/{accountId}/envelopes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${await this.getAccessToken()}`
        },
        body: JSON.stringify({
          templateId: data.templateId,
          templateRoles: [{
            email: data.recipientEmail,
            name: data.recipientName,
            recipientId: '1',
            roleName: 'Signer',
            tabs: this.formatCustomFields(data.customFields)
          }],
          status: 'sent',
          emailSubject: 'Please sign this document'
        })
      })

      if (!response.ok) {
        throw new Error(`DocuSign API error: ${response.statusText}`)
      }

      const envelope = await response.json()
      await this.saveEnvelopeToDatabase(envelope, data)
      
      return envelope
    } catch (error) {
      console.error('Error creating DocuSign envelope:', error)
      throw error
    }
  }

  /**
   * Get envelope status
   */
  async getEnvelopeStatus(envelopeId: string): Promise<DocuSignEnvelope> {
    try {
      // In development, return mock status
      if (process.env.NODE_ENV === 'development') {
        return {
          envelopeId,
          status: 'sent',
          statusChangedDateTime: new Date().toISOString()
        }
      }

      // Production DocuSign API call
      const response = await fetch(
        `${this.baseUrl}/${this.apiVersion}/accounts/{accountId}/envelopes/${envelopeId}`,
        {
          headers: {
            'Authorization': `Bearer ${await this.getAccessToken()}`
          }
        }
      )

      if (!response.ok) {
        throw new Error(`DocuSign API error: ${response.statusText}`)
      }

      const envelope = await response.json()
      
      // Update database
      await this.updateEnvelopeStatus(envelopeId, envelope.status)
      
      return envelope
    } catch (error) {
      console.error('Error getting envelope status:', error)
      throw error
    }
  }

  /**
   * Get recipient view URL (for embedded signing)
   */
  async getRecipientView(envelopeId: string, recipientData: {
    userName: string
    email: string
    returnUrl: string
  }): Promise<{ url: string }> {
    try {
      // In development, return mock URL
      if (process.env.NODE_ENV === 'development') {
        return {
          url: `/api/docusign/mock-signing?envelopeId=${envelopeId}&returnUrl=${encodeURIComponent(recipientData.returnUrl)}`
        }
      }

      // Production DocuSign API call
      const response = await fetch(
        `${this.baseUrl}/${this.apiVersion}/accounts/{accountId}/envelopes/${envelopeId}/views/recipient`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${await this.getAccessToken()}`
          },
          body: JSON.stringify({
            userName: recipientData.userName,
            email: recipientData.email,
            returnUrl: recipientData.returnUrl,
            authenticationMethod: 'none',
            recipientId: '1'
          })
        }
      )

      if (!response.ok) {
        throw new Error(`DocuSign API error: ${response.statusText}`)
      }

      return await response.json()
    } catch (error) {
      console.error('Error getting recipient view:', error)
      throw error
    }
  }

  /**
   * Process webhook events from DocuSign
   */
  async processWebhookEvent(webhookData: any): Promise<void> {
    try {
      const { envelopeId, status } = webhookData
      
      // Update envelope status in database
      await this.updateEnvelopeStatus(envelopeId, status)
      
      // Trigger any additional processing based on status
      if (status === 'completed') {
        await this.handleEnvelopeCompleted(envelopeId)
      }
    } catch (error) {
      console.error('Error processing DocuSign webhook:', error)
      throw error
    }
  }

  /**
   * List available templates
   */
  async listTemplates(): Promise<DocuSignTemplate[]> {
    try {
      // In development, return mock templates
      if (process.env.NODE_ENV === 'development') {
        return [
          {
            templateId: 'mock-template-1',
            name: 'Service Agreement Template',
            description: 'Standard service agreement template',
            fields: [
              { name: 'clientName', type: 'text', required: true, tabLabel: 'Client Name' },
              { name: 'serviceDate', type: 'date', required: true, tabLabel: 'Service Date' },
              { name: 'signature', type: 'signature', required: true, tabLabel: 'Client Signature' }
            ]
          },
          {
            templateId: 'mock-template-2',
            name: 'NDA Template',
            description: 'Non-disclosure agreement template',
            fields: [
              { name: 'partyName', type: 'text', required: true, tabLabel: 'Party Name' },
              { name: 'effectiveDate', type: 'date', required: true, tabLabel: 'Effective Date' },
              { name: 'signature', type: 'signature', required: true, tabLabel: 'Signature' }
            ]
          }
        ]
      }

      // Production API call would go here
      const response = await fetch(
        `${this.baseUrl}/${this.apiVersion}/accounts/{accountId}/templates`,
        {
          headers: {
            'Authorization': `Bearer ${await this.getAccessToken()}`
          }
        }
      )

      if (!response.ok) {
        throw new Error(`DocuSign API error: ${response.statusText}`)
      }

      const data = await response.json()
      return data.envelopeTemplates || []
    } catch (error) {
      console.error('Error listing templates:', error)
      return []
    }
  }

  private async getAccessToken(): Promise<string> {
    // In production, implement OAuth flow to get access token
    // For now, return mock token
    return 'mock-access-token'
  }

  private formatCustomFields(customFields?: Record<string, string>) {
    if (!customFields) return {}
    
    // Convert custom fields to DocuSign tab format
    return Object.entries(customFields).map(([name, value]) => ({
      tabLabel: name,
      value: value
    }))
  }

  private async saveEnvelopeToDatabase(envelope: DocuSignEnvelope, data: ContractSigningData) {
    // Save envelope data to database for tracking
    // TODO: Create contract_envelopes table in database schema
    try {
      // For now, store in webhook_events table as a workaround
      await this.supabase
        .from('webhook_events')
        .insert({
          source: 'docusign',
          event_type: 'envelope_created',
          event_id: envelope.envelopeId,
          event_data: {
            envelope_id: envelope.envelopeId,
            template_id: data.templateId,
            recipient_name: data.recipientName,
            recipient_email: data.recipientEmail,
            status: envelope.status,
            created_at: envelope.createdDateTime || new Date().toISOString(),
            custom_fields: data.customFields || {}
          },
          processed: false
        })
    } catch (error) {
      console.error('Error saving envelope to database:', error)
    }
  }

  private async updateEnvelopeStatus(envelopeId: string, status: string) {
    try {
      // TODO: Update contract_envelopes table when it exists
      // For now, create a new webhook event for status updates
      await this.supabase
        .from('webhook_events')
        .insert({
          source: 'docusign',
          event_type: 'envelope_status_updated',
          event_id: envelopeId,
          event_data: {
            envelope_id: envelopeId,
            status,
            updated_at: new Date().toISOString()
          },
          processed: false
        })
    } catch (error) {
      console.error('Error updating envelope status:', error)
    }
  }

  private async handleEnvelopeCompleted(envelopeId: string) {
    // Handle completed envelope (e.g., update client progress, send notifications)
    console.log(`Envelope ${envelopeId} completed`)
  }
}

export const docusignClient = new DocuSignClient()