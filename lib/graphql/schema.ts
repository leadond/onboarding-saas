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

import { gql } from 'graphql-tag'

export const typeDefs = gql`
  scalar DateTime
  scalar JSON

  # API Management Types
  type ApiKey {
    id: ID!
    name: String!
    permissions: [String!]!
    rate_limit_tier: String!
    is_active: Boolean!
    expires_at: DateTime
    last_used_at: DateTime
    usage_count: Int!
    created_at: DateTime!
    updated_at: DateTime!
  }

  type WebhookEndpoint {
    id: ID!
    name: String!
    url: String!
    events: [String!]!
    is_active: Boolean!
    retry_count: Int!
    timeout_seconds: Int!
    last_success_at: DateTime
    last_failure_at: DateTime
    failure_count: Int!
    created_at: DateTime!
    updated_at: DateTime!
  }

  type WebhookDelivery {
    id: ID!
    webhook_endpoint_id: ID!
    event_type: String!
    payload: JSON!
    status: WebhookDeliveryStatus!
    http_status_code: Int
    response_body: String
    error_message: String
    attempt_count: Int!
    next_retry_at: DateTime
    delivered_at: DateTime
    created_at: DateTime!
  }

  enum WebhookDeliveryStatus {
    PENDING
    SUCCESS
    FAILED
    RETRYING
  }

  type Kit {
    id: ID!
    user_id: ID!
    name: String!
    slug: String!
    description: String
    welcome_message: String
    brand_color: String
    logo_url: String
    status: KitStatus!
    is_template: Boolean!
    completion_redirect_url: String
    custom_domain: String
    seo_title: String
    seo_description: String
    analytics_enabled: Boolean!
    password_protected: Boolean!
    created_at: DateTime!
    updated_at: DateTime!
    step_count: Int
    steps: [KitStep!]!
    analytics: KitAnalytics
  }

  type KitStep {
    id: ID!
    kit_id: ID!
    step_order: Int!
    step_type: StepType!
    title: String!
    description: String
    content: JSON
    is_required: Boolean!
    is_active: Boolean!
    settings: JSON
    conditional_logic: JSON
    created_at: DateTime!
    updated_at: DateTime!
  }

  type KitAnalytics {
    completion_rate: Float!
    avg_completion_time: Float!
    drop_off_rate: Float!
    client_satisfaction: Float!
    total_clients: Int!
    active_clients: Int!
    completed_clients: Int!
    trends: [AnalyticsTrend!]!
    step_performance: [StepPerformance!]!
  }

  type AnalyticsTrend {
    date: String!
    completion_rate: Float!
    total_completions: Int!
  }

  type StepPerformance {
    step_id: ID!
    step_title: String!
    avg_time_spent: Float!
    completion_rate: Float!
    drop_off_rate: Float!
  }

  type EmailIntegration {
    id: ID!
    name: String!
    description: String!
    logo_url: String!
    is_connected: Boolean!
    features: [String!]!
    connection_status: ConnectionStatus!
    last_sync: DateTime
  }

  type User {
    id: ID!
    email: String!
    full_name: String
    avatar_url: String
    created_at: DateTime!
    kits: [Kit!]!
    integrations: [EmailIntegration!]!
  }

  enum KitStatus {
    DRAFT
    PUBLISHED
    ARCHIVED
  }

  enum StepType {
    WELCOME_MESSAGE
    INTAKE_FORM
    FILE_UPLOAD
    CONTRACT
    PAYMENT
    SCHEDULING
    CONFIRMATION
  }

  enum ConnectionStatus {
    CONNECTED
    DISCONNECTED
    ERROR
    PENDING
  }

  enum SortOrder {
    ASC
    DESC
  }

  input KitFilter {
    status: [KitStatus!]
    search: String
    is_template: Boolean
    created_after: DateTime
    created_before: DateTime
  }

  input KitSort {
    field: String!
    order: SortOrder!
  }

  input CreateKitInput {
    name: String!
    description: String
    welcome_message: String
    brand_color: String
    logo_url: String
    status: KitStatus = DRAFT
    is_template: Boolean = false
    completion_redirect_url: String
    custom_domain: String
    seo_title: String
    seo_description: String
    analytics_enabled: Boolean = true
    password_protected: Boolean = false
    steps: [CreateKitStepInput!]
  }

  input CreateKitStepInput {
    step_order: Int!
    step_type: StepType!
    title: String!
    description: String
    content: JSON
    is_required: Boolean = true
    is_active: Boolean = true
    settings: JSON
    conditional_logic: JSON
  }

  input UpdateKitInput {
    name: String
    description: String
    welcome_message: String
    brand_color: String
    logo_url: String
    status: KitStatus
    is_template: Boolean
    completion_redirect_url: String
    custom_domain: String
    seo_title: String
    seo_description: String
    analytics_enabled: Boolean
    password_protected: Boolean
  }

  type Query {
    # Kit queries
    kits(
      filter: KitFilter
      sort: KitSort
      page: Int = 1
      limit: Int = 10
    ): KitConnection!
    
    kit(id: ID!): Kit
    
    # Analytics queries
    kitAnalytics(kitId: ID!, period: String = "30d"): KitAnalytics
    
    # Integration queries
    emailIntegrations: [EmailIntegration!]!
    
    # API Management queries
    apiKeys: [ApiKey!]!
    apiKey(id: ID!): ApiKey
    
    # Webhook queries
    webhookEndpoints: [WebhookEndpoint!]!
    webhookEndpoint(id: ID!): WebhookEndpoint
    webhookDeliveries(endpointId: ID!, page: Int = 1, limit: Int = 50): WebhookDeliveryConnection!
    
    # User queries
    me: User
  }

  type Mutation {
    # Kit mutations
    createKit(input: CreateKitInput!): Kit!
    updateKit(id: ID!, input: UpdateKitInput!): Kit!
    deleteKit(id: ID!): Boolean!
    duplicateKit(id: ID!): Kit!
    publishKit(id: ID!): Kit!
    
    # API Key mutations
    createApiKey(input: CreateApiKeyInput!): CreateApiKeyResponse!
    updateApiKey(id: ID!, input: UpdateApiKeyInput!): ApiKey!
    deleteApiKey(id: ID!): Boolean!
    
    # Webhook mutations
    createWebhookEndpoint(input: CreateWebhookEndpointInput!): CreateWebhookEndpointResponse!
    updateWebhookEndpoint(id: ID!, input: UpdateWebhookEndpointInput!): WebhookEndpoint!
    deleteWebhookEndpoint(id: ID!): Boolean!
    retryWebhookDelivery(id: ID!): WebhookDelivery!
    
    # Integration mutations
    connectEmailIntegration(provider: String!, credentials: JSON!): EmailIntegration!
    disconnectEmailIntegration(id: ID!): Boolean!
    syncEmailIntegration(id: ID!): EmailIntegration!
  }

  type Subscription {
    # Real-time updates
    kitUpdated(kitId: ID!): Kit!
    analyticsUpdated(kitId: ID!): KitAnalytics!
  }

  type KitConnection {
    edges: [KitEdge!]!
    pageInfo: PageInfo!
    totalCount: Int!
  }

  type KitEdge {
    node: Kit!
    cursor: String!
  }

  type PageInfo {
    hasNextPage: Boolean!
    hasPreviousPage: Boolean!
    startCursor: String
    endCursor: String
  }

  # API Key Input Types
  input CreateApiKeyInput {
    name: String!
    permissions: [String!] = ["read"]
    expires_at: DateTime
  }

  input UpdateApiKeyInput {
    name: String
    permissions: [String!]
    is_active: Boolean
    expires_at: DateTime
  }

  type CreateApiKeyResponse {
    apiKey: ApiKey!
    key: String! # Only returned on creation
  }

  # Webhook Input Types
  input CreateWebhookEndpointInput {
    name: String!
    url: String!
    events: [String!]!
    retry_count: Int = 3
    timeout_seconds: Int = 30
  }

  input UpdateWebhookEndpointInput {
    name: String
    url: String
    events: [String!]
    is_active: Boolean
    retry_count: Int
    timeout_seconds: Int
  }

  type CreateWebhookEndpointResponse {
    webhookEndpoint: WebhookEndpoint!
    secret: String! # Only returned on creation
  }

  # Webhook Delivery Connection
  type WebhookDeliveryConnection {
    edges: [WebhookDeliveryEdge!]!
    pageInfo: PageInfo!
    totalCount: Int!
  }

  type WebhookDeliveryEdge {
    node: WebhookDelivery!
    cursor: String!
  }
`