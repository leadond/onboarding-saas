import { NextResponse } from 'next/server'
import { ZodError } from 'zod'

// Database connectivity and service error codes
const DATABASE_CONNECTIVITY_ERRORS = [
  'PGRST205', // Could not find the table in the schema cache
  'PGRST204', // Schema cache not loaded
  'PGRST203', // Schema cache loading error
  'ECONNREFUSED', // Connection refused
  'ENOTFOUND', // Host not found
  'ETIMEDOUT', // Connection timeout
  'ECONNRESET', // Connection reset
]

const SERVICE_UNAVAILABLE_ERRORS = [
  'PGRST001', // Database connection failed
  'PGRST002', // Database timeout
  'PGRST003', // Database unavailable
]

interface DatabaseError {
  code?: string
  message?: string
  details?: string
  hint?: string
}

export interface ApiErrorResponse {
  error: string
  code?: string
  details?: any
  timestamp?: string
  retry_after?: number
}

/**
 * Determines if an error is related to database connectivity issues
 */
export function isDatabaseConnectivityError(error: DatabaseError): boolean {
  if (!error?.code) return false

  return DATABASE_CONNECTIVITY_ERRORS.includes(error.code) ||
         SERVICE_UNAVAILABLE_ERRORS.includes(error.code) ||
         (error.message?.includes('Could not find the table') ?? false) ||
         (error.message?.includes('schema cache') ?? false) ||
         (error.message?.includes('connection') ?? false) ||
         (error.message?.includes('timeout') ?? false)
}

/**
 * Determines if an error indicates service unavailability (503 status)
 */
export function isServiceUnavailableError(error: DatabaseError): boolean {
  if (!error?.code) return false

  return DATABASE_CONNECTIVITY_ERRORS.includes(error.code) ||
         SERVICE_UNAVAILABLE_ERRORS.includes(error.code)
}

/**
 * Determines if an error is a resource not found error (404 status)
 */
export function isNotFoundError(error: DatabaseError): boolean {
  return error?.code === 'PGRST116' // No rows found
}

/**
 * Determines if an error is a conflict error (409 status)
 */
export function isConflictError(error: DatabaseError): boolean {
  return error?.code === '23505' // Unique constraint violation
}

/**
 * Creates a standardized error response for database connectivity issues
 */
export function createDatabaseConnectivityErrorResponse(): NextResponse {
  const errorResponse: ApiErrorResponse = {
    error: 'Service temporarily unavailable. Please try again in a few moments.',
    code: 'SERVICE_UNAVAILABLE',
    details: {
      message: 'Database connectivity issue detected. The service is temporarily unavailable.',
      retry_strategy: 'Please wait a few moments and try again. If the issue persists, contact support.'
    },
    timestamp: new Date().toISOString(),
    retry_after: 30 // Suggest retry after 30 seconds
  }

  return NextResponse.json(errorResponse, {
    status: 503,
    headers: {
      'Retry-After': '30'
    }
  })
}

/**
 * Creates a standardized error response for resource not found
 */
export function createNotFoundErrorResponse(resource: string = 'Resource'): NextResponse {
  const errorResponse: ApiErrorResponse = {
    error: `${resource} not found`,
    code: 'NOT_FOUND',
    timestamp: new Date().toISOString()
  }

  return NextResponse.json(errorResponse, { status: 404 })
}

/**
 * Creates a standardized error response for conflicts
 */
export function createConflictErrorResponse(message: string): NextResponse {
  const errorResponse: ApiErrorResponse = {
    error: message,
    code: 'CONFLICT',
    timestamp: new Date().toISOString()
  }

  return NextResponse.json(errorResponse, { status: 409 })
}

/**
 * Creates a standardized error response for validation errors
 */
export function createValidationErrorResponse(zodError: ZodError): NextResponse {
  const errorResponse: ApiErrorResponse = {
    error: 'Validation failed',
    code: 'VALIDATION_ERROR',
    details: zodError.errors,
    timestamp: new Date().toISOString()
  }

  return NextResponse.json(errorResponse, { status: 400 })
}

/**
 * Creates a standardized error response for unauthorized access
 */
export function createUnauthorizedErrorResponse(): NextResponse {
  const errorResponse: ApiErrorResponse = {
    error: 'Unauthorized',
    code: 'UNAUTHORIZED',
    timestamp: new Date().toISOString()
  }

  return NextResponse.json(errorResponse, { status: 401 })
}

/**
 * Creates a standardized error response for internal server errors
 */
export function createInternalServerErrorResponse(message: string = 'Internal server error'): NextResponse {
  const errorResponse: ApiErrorResponse = {
    error: message,
    code: 'INTERNAL_SERVER_ERROR',
    timestamp: new Date().toISOString()
  }

  return NextResponse.json(errorResponse, { status: 500 })
}

/**
 * Main error handler function that categorizes errors and returns appropriate responses
 */
export function handleApiError(error: any, context?: string): NextResponse {
  console.error(`API Error${context ? ` in ${context}` : ''}:`, error)

  // Handle Zod validation errors
  if (error instanceof ZodError) {
    return createValidationErrorResponse(error)
  }

  // Handle database errors
  if (error && typeof error === 'object') {
    // Check for database connectivity issues
    if (isDatabaseConnectivityError(error)) {
      return createDatabaseConnectivityErrorResponse()
    }

    // Check for not found errors
    if (isNotFoundError(error)) {
      return createNotFoundErrorResponse()
    }

    // Check for conflict errors
    if (isConflictError(error)) {
      return createConflictErrorResponse('Resource conflict detected')
    }
  }

  // Default to internal server error
  return createInternalServerErrorResponse()
}

/**
 * Handles database operation errors with specific context
 */
export function handleDatabaseError(error: any, operation: string, resource: string): NextResponse {
  console.error(`Database error during ${operation} ${resource}:`, error)

  if (isDatabaseConnectivityError(error)) {
    return createDatabaseConnectivityErrorResponse()
  }

  if (isNotFoundError(error)) {
    return createNotFoundErrorResponse(resource)
  }

  if (isConflictError(error)) {
    if (operation === 'create') {
      return createConflictErrorResponse(`A ${resource.toLowerCase()} with these details already exists`)
    }
    return createConflictErrorResponse(`${resource} conflict detected`)
  }

  return createInternalServerErrorErrorResponse(`Failed to ${operation} ${resource.toLowerCase()}`)
}

// Fix typo in the last function name
function createInternalServerErrorErrorResponse(message: string): NextResponse {
  return createInternalServerErrorResponse(message)
}