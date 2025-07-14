/**
 * Custom error classes for better error handling throughout the application
 */

export class AppError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode: number = 500,
    public isOperational: boolean = true
  ) {
    super(message);
    this.name = this.constructor.name;
    
    // Maintains proper stack trace for where our error was thrown (only available on V8)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}

export class ValidationError extends AppError {
  constructor(message: string, field?: string) {
    super(message, 'VALIDATION_ERROR', 400);
    this.field = field;
  }
  
  public field?: string;
}

export class AuthenticationError extends AppError {
  constructor(message: string = 'Authentication failed') {
    super(message, 'AUTHENTICATION_ERROR', 401);
  }
}

export class AuthorizationError extends AppError {
  constructor(message: string = 'Access denied') {
    super(message, 'AUTHORIZATION_ERROR', 403);
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string = 'Resource') {
    super(`${resource} not found`, 'NOT_FOUND_ERROR', 404);
  }
}

export class ConflictError extends AppError {
  constructor(message: string) {
    super(message, 'CONFLICT_ERROR', 409);
  }
}

export class DatabaseError extends AppError {
  constructor(message: string, originalError?: Error) {
    super(message, 'DATABASE_ERROR', 500);
    this.originalError = originalError;
  }
  
  public originalError?: Error;
}

export class ExternalServiceError extends AppError {
  constructor(service: string, message: string, originalError?: Error) {
    super(`${service} service error: ${message}`, 'EXTERNAL_SERVICE_ERROR', 502);
    this.service = service;
    this.originalError = originalError;
  }
  
  public service: string;
  public originalError?: Error;
}

export class RateLimitError extends AppError {
  constructor(message: string = 'Too many requests') {
    super(message, 'RATE_LIMIT_ERROR', 429);
  }
}

/**
 * Type guard to check if an error is an AppError
 */
export function isAppError(error: unknown): error is AppError {
  return error instanceof AppError;
}

/**
 * Formats error for client response
 */
export function formatErrorForClient(error: unknown) {
  if (isAppError(error)) {
    return {
      message: error.message,
      code: error.code,
      statusCode: error.statusCode,
      ...(error instanceof ValidationError && error.field && { field: error.field }),
    };
  }
  
  // Don't expose internal errors to client
  return {
    message: 'An unexpected error occurred',
    code: 'INTERNAL_ERROR',
    statusCode: 500,
  };
}

/**
 * Logs error with appropriate level and context
 */
export function logError(error: unknown, context?: Record<string, any>) {
  // Skip logging Next.js redirect "errors" - these are normal behavior
  if (error instanceof Error && error.message === 'NEXT_REDIRECT') {
    return;
  }
  
  const timestamp = new Date().toISOString();
  
  if (isAppError(error)) {
    const logLevel = error.statusCode >= 500 ? 'ERROR' : 'WARN';
    const logData = {
      message: error.message,
      code: error.code,
      statusCode: error.statusCode,
      stack: error.stack,
      context,
    };
    
    if (logLevel === 'ERROR') {
      console.error(`[${timestamp}] ERROR:`, logData);
    } else {
      console.warn(`[${timestamp}] WARN:`, logData);
    }
  } else {
    console.error(`[${timestamp}] ERROR:`, {
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      context,
    });
  }
}
