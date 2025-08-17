/**
 * Centralized error handling utilities
 */

export interface AppError {
  code: string;
  message: string;
  details?: any;
  statusCode?: number;
}

export class CustomError extends Error {
  public code: string;
  public statusCode: number;
  public details?: any;

  constructor(message: string, code: string = 'UNKNOWN_ERROR', statusCode: number = 500, details?: any) {
    super(message);
    this.name = 'CustomError';
    this.code = code;
    this.statusCode = statusCode;
    this.details = details;
  }
}

export function handleError(error: unknown): AppError {
  if (error instanceof CustomError) {
    return {
      code: error.code,
      message: error.message,
      details: error.details,
      statusCode: error.statusCode,
    };
  }

  if (error instanceof Error) {
    return {
      code: 'GENERIC_ERROR',
      message: error.message,
      statusCode: 500,
    };
  }

  return {
    code: 'UNKNOWN_ERROR',
    message: 'An unexpected error occurred',
    statusCode: 500,
  };
}

export function createErrorResponse(error: AppError) {
  return {
    success: false,
    error: error.message,
    code: error.code,
    details: error.details,
  };
}

export function logError(error: unknown, context?: string) {
  const appError = handleError(error);
  console.error(`[${context || 'ERROR'}]:`, {
    code: appError.code,
    message: appError.message,
    details: appError.details,
    timestamp: new Date().toISOString(),
  });
}

export function isClientError(statusCode: number): boolean {
  return statusCode >= 400 && statusCode < 500;
}

export function isServerError(statusCode: number): boolean {
  return statusCode >= 500 && statusCode < 600;
}