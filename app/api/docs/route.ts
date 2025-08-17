import { NextResponse } from 'next/server'

// OpenAPI/Swagger specification for Onboard Hero API
const apiSpec = {
  openapi: '3.0.0',
  info: {
    title: 'Onboard Hero API',
    version: '2.0.0',
    description: 'API-First Architecture for Onboard Hero - Professional Client Onboarding Platform with comprehensive REST and GraphQL APIs, rate limiting, webhook system, and API key management.',
    contact: {
      name: 'Onboard Hero Support',
      email: 'support@onboardhero.com',
      url: 'https://onboardhero.com/support'
    },
    license: {
      name: 'MIT',
      url: 'https://opensource.org/licenses/MIT'
    }
  },
  servers: [
    {
      url: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
      description: 'Onboard Hero API Server'
    }
  ],
  security: [
    {
      BearerAuth: []
    },
    {
      ApiKeyAuth: []
    }
  ],
  components: {
    securitySchemes: {
      BearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'JWT token obtained from authentication'
      },
      ApiKeyAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'API Key',
        description: 'API key in the format: Bearer ok_xxxxxxxxxxxxxxxx'
      }
    },
    schemas: {
      Kit: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          user_id: { type: 'string', format: 'uuid' },
          name: { type: 'string', maxLength: 255 },
          slug: { type: 'string', maxLength: 255 },
          description: { type: 'string' },
          welcome_message: { type: 'string' },
          brand_color: { type: 'string', pattern: '^#[0-9A-Fa-f]{6}$' },
          logo_url: { type: 'string', format: 'uri' },
          status: { 
            type: 'string', 
            enum: ['draft', 'published', 'archived'] 
          },
          is_template: { type: 'boolean' },
          completion_redirect_url: { type: 'string', format: 'uri' },
          custom_domain: { type: 'string' },
          seo_title: { type: 'string' },
          seo_description: { type: 'string' },
          analytics_enabled: { type: 'boolean' },
          password_protected: { type: 'boolean' },
          created_at: { type: 'string', format: 'date-time' },
          updated_at: { type: 'string', format: 'date-time' },
          step_count: { type: 'integer' }
        },
        required: ['id', 'user_id', 'name', 'status']
      },
      KitStep: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          kit_id: { type: 'string', format: 'uuid' },
          step_order: { type: 'integer' },
          step_type: { 
            type: 'string',
            enum: ['welcome_message', 'intake_form', 'file_upload', 'contract', 'payment', 'scheduling', 'confirmation']
          },
          title: { type: 'string' },
          description: { type: 'string' },
          content: { type: 'object' },
          is_required: { type: 'boolean' },
          is_active: { type: 'boolean' },
          settings: { type: 'object' },
          conditional_logic: { type: 'object' },
          created_at: { type: 'string', format: 'date-time' },
          updated_at: { type: 'string', format: 'date-time' }
        },
        required: ['id', 'kit_id', 'step_type', 'title']
      },
      Analytics: {
        type: 'object',
        properties: {
          completion_rate: { type: 'number', format: 'float' },
          avg_completion_time: { type: 'number' },
          drop_off_rate: { type: 'number', format: 'float' },
          client_satisfaction: { type: 'number', format: 'float' },
          total_clients: { type: 'integer' },
          active_clients: { type: 'integer' },
          completed_clients: { type: 'integer' },
          trends: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                date: { type: 'string', format: 'date' },
                completion_rate: { type: 'number', format: 'float' },
                total_completions: { type: 'integer' }
              }
            }
          }
        }
      },
      Error: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: false },
          error: { type: 'string' },
          message: { type: 'string' },
          code: { type: 'string' },
          details: { type: 'object' }
        },
        required: ['success', 'error']
      },
      PaginatedResponse: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: true },
          data: { type: 'array' },
          pagination: {
            type: 'object',
            properties: {
              page: { type: 'integer' },
              limit: { type: 'integer' },
              total: { type: 'integer' },
              total_pages: { type: 'integer' }
            }
          }
        }
      }
    }
  },
  paths: {
    '/api/kits': {
      get: {
        summary: 'List kits',
        description: 'Retrieve a paginated list of kits with optional filtering',
        tags: ['Kits'],
        parameters: [
          {
            name: 'status',
            in: 'query',
            description: 'Filter by kit status (comma-separated)',
            schema: { type: 'string' },
            example: 'published,draft'
          },
          {
            name: 'search',
            in: 'query',
            description: 'Search in kit name and description',
            schema: { type: 'string' }
          },
          {
            name: 'is_template',
            in: 'query',
            description: 'Filter by template status',
            schema: { type: 'boolean' }
          },
          {
            name: 'page',
            in: 'query',
            description: 'Page number (1-based)',
            schema: { type: 'integer', minimum: 1, default: 1 }
          },
          {
            name: 'limit',
            in: 'query',
            description: 'Items per page',
            schema: { type: 'integer', minimum: 1, maximum: 100, default: 10 }
          },
          {
            name: 'sort_by',
            in: 'query',
            description: 'Sort field',
            schema: { type: 'string', enum: ['name', 'created_at', 'updated_at'], default: 'updated_at' }
          },
          {
            name: 'sort_order',
            in: 'query',
            description: 'Sort order',
            schema: { type: 'string', enum: ['asc', 'desc'], default: 'desc' }
          }
        ],
        responses: {
          '200': {
            description: 'Successful response',
            content: {
              'application/json': {
                schema: {
                  allOf: [
                    { $ref: '#/components/schemas/PaginatedResponse' },
                    {
                      properties: {
                        data: {
                          type: 'array',
                          items: { $ref: '#/components/schemas/Kit' }
                        }
                      }
                    }
                  ]
                }
              }
            }
          },
          '401': {
            description: 'Unauthorized',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Error' }
              }
            }
          }
        }
      },
      post: {
        summary: 'Create a new kit',
        description: 'Create a new onboarding kit',
        tags: ['Kits'],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  name: { type: 'string', maxLength: 255 },
                  description: { type: 'string' },
                  welcome_message: { type: 'string' },
                  brand_color: { type: 'string', pattern: '^#[0-9A-Fa-f]{6}$' },
                  logo_url: { type: 'string', format: 'uri' },
                  status: { type: 'string', enum: ['draft', 'published'], default: 'draft' },
                  is_template: { type: 'boolean', default: false },
                  completion_redirect_url: { type: 'string', format: 'uri' },
                  custom_domain: { type: 'string' },
                  seo_title: { type: 'string' },
                  seo_description: { type: 'string' },
                  analytics_enabled: { type: 'boolean', default: true },
                  password_protected: { type: 'boolean', default: false }
                },
                required: ['name']
              }
            }
          }
        },
        responses: {
          '201': {
            description: 'Kit created successfully',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    data: { $ref: '#/components/schemas/Kit' },
                    message: { type: 'string' }
                  }
                }
              }
            }
          },
          '400': {
            description: 'Bad request',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Error' }
              }
            }
          },
          '401': {
            description: 'Unauthorized',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Error' }
              }
            }
          },
          '403': {
            description: 'Kit limit reached',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Error' }
              }
            }
          }
        }
      }
    },
    '/api/kits/{kitId}': {
      get: {
        summary: 'Get kit by ID',
        description: 'Retrieve a specific kit by its ID',
        tags: ['Kits'],
        parameters: [
          {
            name: 'kitId',
            in: 'path',
            required: true,
            description: 'Kit ID',
            schema: { type: 'string', format: 'uuid' }
          }
        ],
        responses: {
          '200': {
            description: 'Successful response',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    data: { $ref: '#/components/schemas/Kit' }
                  }
                }
              }
            }
          },
          '404': {
            description: 'Kit not found',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Error' }
              }
            }
          }
        }
      }
    },
    '/api/kits/{kitId}/analytics': {
      get: {
        summary: 'Get kit analytics',
        description: 'Retrieve analytics data for a specific kit',
        tags: ['Analytics'],
        parameters: [
          {
            name: 'kitId',
            in: 'path',
            required: true,
            description: 'Kit ID',
            schema: { type: 'string', format: 'uuid' }
          },
          {
            name: 'period',
            in: 'query',
            description: 'Analytics period',
            schema: { type: 'string', enum: ['7d', '30d', '90d', '1y'], default: '30d' }
          }
        ],
        responses: {
          '200': {
            description: 'Analytics data',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    data: { $ref: '#/components/schemas/Analytics' }
                  }
                }
              }
            }
          }
        }
      }
    },
    '/api/integrations/email-marketing': {
      get: {
        summary: 'List email marketing integrations',
        description: 'Get available email marketing platform integrations',
        tags: ['Integrations'],
        responses: {
          '200': {
            description: 'Available integrations',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    data: {
                      type: 'array',
                      items: {
                        type: 'object',
                        properties: {
                          id: { type: 'string' },
                          name: { type: 'string' },
                          description: { type: 'string' },
                          logo_url: { type: 'string' },
                          is_connected: { type: 'boolean' },
                          features: { type: 'array', items: { type: 'string' } }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    },
    '/api/v1/api-keys': {
      get: {
        summary: 'List API keys',
        description: 'Retrieve all API keys for the authenticated user',
        tags: ['API Management'],
        responses: {
          '200': {
            description: 'List of API keys',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    data: {
                      type: 'array',
                      items: {
                        type: 'object',
                        properties: {
                          id: { type: 'string', format: 'uuid' },
                          name: { type: 'string' },
                          permissions: { type: 'array', items: { type: 'string' } },
                          rate_limit_tier: { type: 'string', enum: ['free', 'pro', 'enterprise'] },
                          is_active: { type: 'boolean' },
                          expires_at: { type: 'string', format: 'date-time', nullable: true },
                          last_used_at: { type: 'string', format: 'date-time', nullable: true },
                          usage_count: { type: 'integer' },
                          created_at: { type: 'string', format: 'date-time' },
                          updated_at: { type: 'string', format: 'date-time' }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      },
      post: {
        summary: 'Create API key',
        description: 'Create a new API key for programmatic access',
        tags: ['API Management'],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  name: { type: 'string', maxLength: 255 },
                  permissions: { 
                    type: 'array', 
                    items: { type: 'string' },
                    default: ['read'],
                    description: 'Array of permissions: read, write, delete, admin'
                  },
                  expires_at: { type: 'string', format: 'date-time', nullable: true }
                },
                required: ['name']
              }
            }
          }
        },
        responses: {
          '201': {
            description: 'API key created successfully',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    data: {
                      type: 'object',
                      properties: {
                        id: { type: 'string', format: 'uuid' },
                        name: { type: 'string' },
                        key: { type: 'string', description: 'The actual API key - store securely!' },
                        permissions: { type: 'array', items: { type: 'string' } },
                        rate_limit_tier: { type: 'string' },
                        created_at: { type: 'string', format: 'date-time' }
                      }
                    },
                    message: { type: 'string' }
                  }
                }
              }
            }
          }
        }
      }
    },
    '/api/v1/webhooks': {
      get: {
        summary: 'List webhook endpoints',
        description: 'Retrieve all webhook endpoints for the authenticated user',
        tags: ['Webhooks'],
        responses: {
          '200': {
            description: 'List of webhook endpoints',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    data: {
                      type: 'array',
                      items: {
                        type: 'object',
                        properties: {
                          id: { type: 'string', format: 'uuid' },
                          name: { type: 'string' },
                          url: { type: 'string', format: 'uri' },
                          events: { type: 'array', items: { type: 'string' } },
                          is_active: { type: 'boolean' },
                          retry_count: { type: 'integer' },
                          timeout_seconds: { type: 'integer' },
                          last_success_at: { type: 'string', format: 'date-time', nullable: true },
                          last_failure_at: { type: 'string', format: 'date-time', nullable: true },
                          failure_count: { type: 'integer' },
                          created_at: { type: 'string', format: 'date-time' }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      },
      post: {
        summary: 'Create webhook endpoint',
        description: 'Create a new webhook endpoint to receive real-time events',
        tags: ['Webhooks'],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  name: { type: 'string', maxLength: 255 },
                  url: { type: 'string', format: 'uri' },
                  events: { 
                    type: 'array', 
                    items: { type: 'string' },
                    description: 'Array of event types to subscribe to'
                  },
                  retry_count: { type: 'integer', minimum: 0, maximum: 10, default: 3 },
                  timeout_seconds: { type: 'integer', minimum: 5, maximum: 300, default: 30 }
                },
                required: ['name', 'url', 'events']
              }
            }
          }
        },
        responses: {
          '201': {
            description: 'Webhook endpoint created successfully',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    data: {
                      type: 'object',
                      properties: {
                        id: { type: 'string', format: 'uuid' },
                        name: { type: 'string' },
                        url: { type: 'string', format: 'uri' },
                        secret: { type: 'string', description: 'Webhook secret for signature verification - store securely!' },
                        events: { type: 'array', items: { type: 'string' } },
                        created_at: { type: 'string', format: 'date-time' }
                      }
                    },
                    message: { type: 'string' }
                  }
                }
              }
            }
          }
        }
      }
    },
    '/api/graphql': {
      post: {
        summary: 'GraphQL endpoint',
        description: 'Execute GraphQL queries and mutations with comprehensive API access',
        tags: ['GraphQL'],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  query: { type: 'string', description: 'GraphQL query or mutation' },
                  variables: { type: 'object', description: 'Query variables' },
                  operationName: { type: 'string', description: 'Operation name for multi-operation documents' }
                },
                required: ['query']
              }
            }
          }
        },
        responses: {
          '200': {
            description: 'GraphQL response',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    data: { type: 'object', description: 'Query result data' },
                    errors: { 
                      type: 'array', 
                      items: { type: 'object' },
                      description: 'GraphQL errors if any'
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  },
  tags: [
    {
      name: 'Kits',
      description: 'Onboarding kit management'
    },
    {
      name: 'Analytics',
      description: 'Analytics and reporting'
    },
    {
      name: 'Integrations',
      description: 'Third-party integrations'
    },
    {
      name: 'API Management',
      description: 'API key creation and management'
    },
    {
      name: 'Webhooks',
      description: 'Webhook endpoint management and real-time events'
    },
    {
      name: 'GraphQL',
      description: 'GraphQL API for flexible data querying'
    }
  ]
}

export async function GET() {
  return NextResponse.json(apiSpec, {
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'public, max-age=3600'
    }
  })
}