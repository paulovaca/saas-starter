// lib/actions/action-wrapper.ts
import { z } from 'zod';
import { getCurrentUser } from '@/lib/auth/session';
import { Permission, hasPermission, UserRole } from '@/lib/auth/permissions';
import { handleDatabaseError } from '@/lib/services/error-handler/database-errors';
import { ActivityLogger } from '@/lib/services/activity-logger';
import { RateLimiter } from '@/lib/services/rate-limiter';
import { AppError, ValidationError, AuthenticationError, AuthorizationError, isAppError } from '@/lib/services/error-handler';

interface ActionOptions {
  permission?: Permission;
  requireAuth?: boolean;
  rateLimitKey?: string;
  rateLimitAttempts?: number;
  rateLimitWindow?: number;
  logActivity?: boolean;
  activityType?: string;
}

export interface ActionResult<T> {
  success: true;
  data: T;
}

export interface ActionError {
  success: false;
  error: string;
  code?: string;
  field?: string;
}

export type ActionResponse<T> = ActionResult<T> | ActionError;

/**
 * Universal action wrapper that provides:
 * - Input validation with Zod
 * - Authentication & authorization
 * - Permission checks
 * - Rate limiting
 * - Activity logging
 * - Standardized error handling
 */
export function createAction<TInput, TOutput>(
  schema: z.ZodSchema<TInput>,
  handler: (input: TInput, user: any) => Promise<TOutput>,
  options: ActionOptions = {}
): (input: unknown) => Promise<ActionResponse<TOutput>> {
  
  return async (input: unknown): Promise<ActionResponse<TOutput>> => {
    try {
      // 1. Input validation
      let validatedInput: TInput;
      try {
        validatedInput = schema.parse(input);
      } catch (error) {
        if (error instanceof z.ZodError) {
          const firstError = error.errors[0];
          return {
            success: false,
            error: `Erro de validação: ${firstError.message}`,
            code: 'VALIDATION_ERROR',
            field: firstError.path.join('.')
          };
        }
        throw error;
      }

      // 2. Authentication
      let user = null;
      if (options.requireAuth !== false) {
        user = await getCurrentUser();
        if (!user) {
          return {
            success: false,
            error: 'Acesso negado. Usuário não autenticado.',
            code: 'AUTHENTICATION_ERROR'
          };
        }
      }

      // 3. Permission check
      if (options.permission && user) {
        if (!hasPermission(user.role as UserRole, options.permission)) {
          return {
            success: false,
            error: 'Acesso negado. Permissão insuficiente.',
            code: 'AUTHORIZATION_ERROR'
          };
        }
      }

      // 4. Rate limiting
      if (options.rateLimitKey && user) {
        const rateLimiter = new RateLimiter({
          keyPrefix: options.rateLimitKey,
          attempts: options.rateLimitAttempts || 10,
          window: options.rateLimitWindow || 60000
        });

        const isAllowed = await rateLimiter.check(user.id);
        if (!isAllowed) {
          return {
            success: false,
            error: 'Muitas tentativas. Tente novamente em alguns minutos.',
            code: 'RATE_LIMIT_ERROR'
          };
        }
      }

      // 5. Execute action
      const result = await handler(validatedInput, user);

      // 6. Activity logging
      if (options.logActivity && options.activityType && user) {
        try {
          await ActivityLogger.log({
            userId: user.id,
            agencyId: user.agencyId,
            type: options.activityType,
            description: `Ação executada: ${options.activityType}`,
            metadata: {
              input: validatedInput,
              result: typeof result === 'object' && result !== null && 'id' in result ? { id: (result as any).id } : {}
            }
          });
        } catch (logError) {
          // Don't fail the main action if logging fails
          console.error('Failed to log activity:', logError);
        }
      }

      return { success: true, data: result };

    } catch (error) {
      console.error('Action error:', error);

      // Handle different error types
      if (isAppError(error)) {
        return {
          success: false,
          error: error.message,
          code: error.code,
          ...(error instanceof ValidationError && error.field && { field: error.field }),
        };
      }

      // Handle database errors
      if (error && typeof error === 'object' && 'code' in error) {
        try {
          const dbError = handleDatabaseError(error);
          return {
            success: false,
            error: dbError.message,
            code: dbError.code,
            ...(dbError instanceof ValidationError && dbError.field && { field: dbError.field }),
          };
        } catch (dbHandlerError) {
          console.error('Error handling database error:', dbHandlerError);
        }
      }

      // Handle Zod validation errors that might have escaped
      if (error instanceof z.ZodError) {
        const firstError = error.errors[0];
        return {
          success: false,
          error: `Erro de validação: ${firstError.message}`,
          code: 'VALIDATION_ERROR',
          field: firstError.path.join('.')
        };
      }

      // Generic error fallback
      const message = error instanceof Error ? error.message : 'Erro interno do servidor';
      return {
        success: false,
        error: message,
        code: 'INTERNAL_ERROR'
      };
    }
  };
}

/**
 * Helper to create actions that require authentication by default
 */
export function createAuthenticatedAction<TInput, TOutput>(
  schema: z.ZodSchema<TInput>,
  handler: (input: TInput, user: NonNullable<any>) => Promise<TOutput>,
  options: Omit<ActionOptions, 'requireAuth'> = {}
) {
  return createAction(
    schema,
    handler,
    { ...options, requireAuth: true }
  );
}

/**
 * Helper to create actions with permission requirements
 */
export function createPermissionAction<TInput, TOutput>(
  schema: z.ZodSchema<TInput>,
  permission: Permission,
  handler: (input: TInput, user: NonNullable<any>) => Promise<TOutput>,
  options: Omit<ActionOptions, 'permission' | 'requireAuth'> = {}
) {
  return createAction(
    schema,
    handler,
    { ...options, permission, requireAuth: true }
  );
}

/**
 * Helper to create actions with rate limiting
 */
export function createRateLimitedAction<TInput, TOutput>(
  schema: z.ZodSchema<TInput>,
  rateLimitKey: string,
  handler: (input: TInput, user: any) => Promise<TOutput>,
  options: Omit<ActionOptions, 'rateLimitKey'> = {}
) {
  return createAction(
    schema,
    handler,
    { ...options, rateLimitKey, requireAuth: true }
  );
}

/**
 * Utility function to check if result is success
 */
export function isActionSuccess<T>(result: ActionResponse<T>): result is ActionResult<T> {
  return result.success === true;
}

/**
 * Utility function to check if result is error
 */
export function isActionError<T>(result: ActionResponse<T>): result is ActionError {
  return result.success === false;
}