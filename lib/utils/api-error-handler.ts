import { NextResponse } from 'next/server';
import { ZodError } from 'zod';

export interface ApiError {
  code: string;
  message: string;
  details?: any;
}

export function handleApiError(error: unknown, context?: string): NextResponse {
  console.error(`[API Error${context ? ` - ${context}` : ''}]:`, error);

  if (error instanceof ZodError) {
    return NextResponse.json(
      {
        success: false,
        error: 'Validation failed',
        details: error.errors,
      },
      { status: 400 }
    );
  }

  if (error instanceof Error) {
    return NextResponse.json(
      {
        success: false,
        error: error.message,
      },
      { status: 500 }
    );
  }

  return NextResponse.json(
    {
      success: false,
      error: 'An unexpected error occurred',
    },
    { status: 500 }
  );
}

export function handleDatabaseError(error: any, operation: string, resource: string): NextResponse {
  console.error(`[Database Error - ${operation} ${resource}]:`, error);

  let message = `Failed to ${operation} ${resource.toLowerCase()}`;
  let statusCode = 500;

  // Handle specific database error codes
  if (error.code) {
    switch (error.code) {
      case 'PGRST116':
        message = `${resource} not found`;
        statusCode = 404;
        break;
      case '23505':
        message = `${resource} already exists`;
        statusCode = 409;
        break;
      case '23503':
        message = `Cannot ${operation} ${resource.toLowerCase()}: related records exist`;
        statusCode = 409;
        break;
      case '23502':
        message = `Missing required information for ${resource.toLowerCase()}`;
        statusCode = 400;
        break;
      default:
        message = error.message || message;
    }
  }

  return NextResponse.json(
    {
      success: false,
      error: message,
    },
    { status: statusCode }
  );
}

export function createUnauthorizedErrorResponse(): NextResponse {
  return NextResponse.json(
    {
      success: false,
      error: 'Unauthorized',
    },
    { status: 401 }
  );
}

export function createValidationErrorResponse(error: ZodError): NextResponse {
  return NextResponse.json(
    {
      success: false,
      error: 'Validation failed',
      details: error.errors,
    },
    { status: 400 }
  );
}

export function createNotFoundResponse(resource: string): NextResponse {
  return NextResponse.json(
    {
      success: false,
      error: `${resource} not found`,
    },
    { status: 404 }
  );
}

export function createForbiddenResponse(): NextResponse {
  return NextResponse.json(
    {
      success: false,
      error: 'Forbidden',
    },
    { status: 403 }
  );
}

export function createRateLimitResponse(): NextResponse {
  return NextResponse.json(
    {
      success: false,
      error: 'Rate limit exceeded',
    },
    { status: 429 }
  );
}