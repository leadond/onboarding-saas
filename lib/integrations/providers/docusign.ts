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

export class DocuSignService {
  private accessToken: string
  private baseUrl: string
  private accountId?: string

  constructor(accessToken: string, baseUrl = 'https://demo.docusign.net/restapi', accountId?: string) {
    this.accessToken = accessToken
    this.baseUrl = baseUrl
    this.accountId = accountId
  }

  private async makeRequest(endpoint: string, method = 'GET', data?: any) {
    const url = `${this.baseUrl}${endpoint}`
    const options: RequestInit = {
      method,
      headers: {
        'Authorization': `Bearer ${this.accessToken}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
    }

    if (data && (method === 'POST' || method === 'PUT')) {
      options.body = JSON.stringify(data)
    }

    const response = await fetch(url, options)
    
    if (!response.ok) {
      const error = await response.text()
      throw new Error(`DocuSign API error: ${response.status} ${error}`)
    }

    return response.json()
  }

  async getAccountInfo() {
    if (!this.accountId) {
      const userInfo = await this.makeRequest('/v2.1/accounts')
      this.accountId = userInfo.accounts[0].accountId
    }
    return this.makeRequest(`/v2.1/accounts/${this.accountId}`)
  }

  async createEnvelope(envelopeData: {
    recipients: {
      signers: Array<{
        email: string
        name: string
        recipientId: string
        tabs?: any
      }>
    }
    documents: Array<{
      documentBase64: string
      documentId: string
      fileExtension: string
      name: string
    }>
    emailSubject: string
    status: 'sent' | 'created'
  }) {
    await this.getAccountInfo() // Ensure accountId is set
    
    return this.makeRequest(`/v2.1/accounts/${this.accountId}/envelopes`, 'POST', envelopeData)
  }

  async getEnvelope(envelopeId: string) {
    await this.getAccountInfo()
    return this.makeRequest(`/v2.1/accounts/${this.accountId}/envelopes/${envelopeId}`)
  }

  async getEnvelopeStatus(envelopeId: string) {
    const envelope = await this.getEnvelope(envelopeId)
    return envelope.status
  }

  async getEnvelopeRecipients(envelopeId: string) {
    await this.getAccountInfo()
    return this.makeRequest(`/v2.1/accounts/${this.accountId}/envelopes/${envelopeId}/recipients`)
  }

  async getCompletedDocument(envelopeId: string, documentId: string = 'combined') {
    await this.getAccountInfo()
    const response = await fetch(
      `${this.baseUrl}/v2.1/accounts/${this.accountId}/envelopes/${envelopeId}/documents/${documentId}`,
      {
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
        },
      }
    )

    if (!response.ok) {
      throw new Error(`Failed to get document: ${response.statusText}`)
    }

    return response.blob()
  }

  async createTemplate(templateData: {
    name: string
    description?: string
    documents: Array<{
      documentBase64: string
      documentId: string
      fileExtension: string
      name: string
    }>
    recipients: {
      signers: Array<{
        roleName: string
        recipientId: string
        tabs?: any
      }>
    }
  }) {
    await this.getAccountInfo()
    
    return this.makeRequest(`/v2.1/accounts/${this.accountId}/templates`, 'POST', templateData)
  }

  async createEnvelopeFromTemplate(templateId: string, templateRoles: Array<{
    email: string
    name: string
    roleName: string
  }>, emailSubject: string) {
    await this.getAccountInfo()
    
    return this.makeRequest(`/v2.1/accounts/${this.accountId}/envelopes`, 'POST', {
      templateId,
      templateRoles,
      emailSubject,
      status: 'sent'
    })
  }

  async listEnvelopes(params?: {
    status?: string
    from_date?: string
    to_date?: string
    count?: number
  }) {
    await this.getAccountInfo()
    
    const queryParams = new URLSearchParams(params as any)
    return this.makeRequest(`/v2.1/accounts/${this.accountId}/envelopes?${queryParams.toString()}`)
  }

  async createWebhook(webhookData: {
    name: string
    url: string
    events: string[]
    includeData?: string[]
  }) {
    await this.getAccountInfo()
    
    const connectData = {
      name: webhookData.name,
      url: webhookData.url,
      events: webhookData.events,
      includeData: webhookData.includeData || ['recipients', 'documents']
    }
    
    return this.makeRequest(`/v2.1/accounts/${this.accountId}/connect`, 'POST', connectData)
  }

  // OAuth helpers
  static getAuthUrl(
    clientId: string,
    redirectUri: string,
    baseUrl = 'https://account-d.docusign.com',
    state?: string
  ) {
    const scopes = ['signature', 'impersonation'].join('%20')
    
    const params = new URLSearchParams({
      response_type: 'code',
      scope: scopes,
      client_id: clientId,
      redirect_uri: redirectUri,
      ...(state && { state })
    })

    return `${baseUrl}/oauth/auth?${params.toString()}`
  }

  static async exchangeCodeForToken(
    clientId: string,
    clientSecret: string,
    code: string,
    baseUrl = 'https://account-d.docusign.com'
  ) {
    const response = await fetch(`${baseUrl}/oauth/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString('base64')}`
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code
      })
    })

    const result = await response.json()

    if (!response.ok) {
      throw new Error(result.error_description || result.error || 'Failed to exchange code for token')
    }

    return result
  }

  static async getUserInfo(accessToken: string, baseUrl = 'https://account-d.docusign.com') {
    const response = await fetch(`${baseUrl}/oauth/userinfo`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    })

    if (!response.ok) {
      throw new Error('Failed to get user info')
    }

    return response.json()
  }
}