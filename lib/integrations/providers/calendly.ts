export class CalendlyService {
  private accessToken: string
  private baseUrl = 'https://api.calendly.com'

  constructor(accessToken: string) {
    this.accessToken = accessToken
  }

  private async makeRequest(endpoint: string, method = 'GET', data?: any) {
    const url = `${this.baseUrl}${endpoint}`
    const options: RequestInit = {
      method,
      headers: {
        'Authorization': `Bearer ${this.accessToken}`,
        'Content-Type': 'application/json',
      },
    }

    if (data && (method === 'POST' || method === 'PUT')) {
      options.body = JSON.stringify(data)
    }

    const response = await fetch(url, options)
    
    if (!response.ok) {
      const error = await response.text()
      throw new Error(`Calendly API error: ${response.status} ${error}`)
    }

    return response.json()
  }

  async getCurrentUser() {
    return this.makeRequest('/users/me')
  }

  async getEventTypes(userUri?: string) {
    const user = userUri || (await this.getCurrentUser()).resource.uri
    return this.makeRequest(`/event_types?user=${user}`)
  }

  async getScheduledEvents(userUri?: string, params?: {
    min_start_time?: string
    max_start_time?: string
    status?: string
  }) {
    const user = userUri || (await this.getCurrentUser()).resource.uri
    const queryParams = new URLSearchParams({
      user,
      ...params
    })
    
    return this.makeRequest(`/scheduled_events?${queryParams.toString()}`)
  }

  async cancelEvent(eventUuid: string, reason?: string) {
    return this.makeRequest(`/scheduled_events/${eventUuid}/cancellation`, 'POST', {
      reason: reason || 'Cancelled via integration'
    })
  }

  async getEventInvitees(eventUuid: string) {
    return this.makeRequest(`/scheduled_events/${eventUuid}/invitees`)
  }

  async createWebhookSubscription(url: string, events: string[], organizationUri: string) {
    return this.makeRequest('/webhook_subscriptions', 'POST', {
      url,
      events,
      organization: organizationUri,
      scope: 'organization'
    })
  }

  async getWebhookSubscriptions(organizationUri: string) {
    return this.makeRequest(`/webhook_subscriptions?organization=${organizationUri}`)
  }

  async deleteWebhookSubscription(webhookUuid: string) {
    return this.makeRequest(`/webhook_subscriptions/${webhookUuid}`, 'DELETE')
  }

  // Convenience methods
  async bookMeeting(params: {
    event_type_uuid: string
    start_time: string
    invitee_email: string
    invitee_name: string
    questions?: Array<{ name: string; value: string }>
  }) {
    // Calendly doesn't have a direct booking API - this would typically redirect to their booking page
    // or use their embeddable widget. For webhook integration, we can track when meetings are booked.
    throw new Error('Direct meeting booking requires Calendly embed or redirect flow')
  }

  async createEvent(params: {
    name: string
    duration: number
    description?: string
    location?: string
  }) {
    // Event types are typically managed through Calendly UI
    // This is a placeholder for event type creation
    throw new Error('Event type creation requires Calendly dashboard access')
  }

  // OAuth helpers
  static getAuthUrl(clientId: string, redirectUri: string, state?: string) {
    const params = new URLSearchParams({
      client_id: clientId,
      redirect_uri: redirectUri,
      response_type: 'code',
      ...(state && { state })
    })

    return `https://auth.calendly.com/oauth/authorize?${params.toString()}`
  }

  static async exchangeCodeForToken(
    clientId: string,
    clientSecret: string,
    code: string,
    redirectUri: string
  ) {
    const response = await fetch('https://auth.calendly.com/oauth/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        code,
        redirect_uri: redirectUri,
        grant_type: 'authorization_code'
      })
    })

    const result = await response.json()

    if (!response.ok) {
      throw new Error(result.error_description || result.error || 'Failed to exchange code for token')
    }

    return result
  }

  static async refreshToken(
    clientId: string,
    clientSecret: string,
    refreshToken: string
  ) {
    const response = await fetch('https://auth.calendly.com/oauth/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        refresh_token: refreshToken,
        grant_type: 'refresh_token'
      })
    })

    const result = await response.json()

    if (!response.ok) {
      throw new Error(result.error_description || result.error || 'Failed to refresh token')
    }

    return result
  }
}