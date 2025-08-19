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

export class SlackService {
  private accessToken: string
  private baseUrl = 'https://slack.com/api'

  constructor(accessToken: string) {
    this.accessToken = accessToken
  }

  private async makeRequest(endpoint: string, method = 'GET', data?: any) {
    const url = `${this.baseUrl}/${endpoint}`
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
    const result = await response.json()

    if (!result.ok) {
      throw new Error(result.error || 'Slack API request failed')
    }

    return result
  }

  async sendMessage(channel: string, text: string, blocks?: any[]) {
    return this.makeRequest('chat.postMessage', 'POST', {
      channel,
      text,
      blocks
    })
  }

  async createChannel(name: string, isPrivate = false) {
    const endpoint = isPrivate ? 'conversations.create' : 'conversations.create'
    return this.makeRequest(endpoint, 'POST', {
      name,
      is_private: isPrivate
    })
  }

  async inviteUserToChannel(channel: string, users: string[]) {
    return this.makeRequest('conversations.invite', 'POST', {
      channel,
      users: users.join(',')
    })
  }

  async getChannels() {
    return this.makeRequest('conversations.list')
  }

  async getUserInfo(userId: string) {
    return this.makeRequest(`users.info?user=${userId}`)
  }

  async getTeamInfo() {
    return this.makeRequest('team.info')
  }

  // OAuth helpers
  static getAuthUrl(clientId: string, redirectUri: string, state?: string) {
    const scopes = [
      'channels:read',
      'channels:write',
      'chat:write',
      'users:read',
      'team:read'
    ].join(',')

    const params = new URLSearchParams({
      client_id: clientId,
      scope: scopes,
      redirect_uri: redirectUri,
      response_type: 'code',
      ...(state && { state })
    })

    return `https://slack.com/oauth/v2/authorize?${params.toString()}`
  }

  static async exchangeCodeForToken(
    clientId: string,
    clientSecret: string,
    code: string,
    redirectUri: string
  ) {
    const response = await fetch('https://slack.com/api/oauth.v2.access', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        code,
        redirect_uri: redirectUri
      })
    })

    const result = await response.json()

    if (!result.ok) {
      throw new Error(result.error || 'Failed to exchange code for token')
    }

    return result
  }
}