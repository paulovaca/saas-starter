import { z } from 'zod';
import { logError, formatErrorForClient, isAppError, AuthenticationError } from './index';
import { getUser, logActivity } from '@/lib/db/queries';
import { ActivityType } from '@/lib/db/schema';

export type ActionResult<T = any> = {
  success: boolean;
  data?: T;
  error?: {
    message: string;
    code: string;
    field?: string;
  };
};

export type ActionContext = {
  user?: any;
  agencyId?: string;
  userId?: string;
};

/**
 * Options for action wrapper
 */
export type ActionOptions = {
  /** Require authentication */
  requireAuth?: boolean;
  /** Validate input schema */
  schema?: z.ZodSchema;
  /** Activity type to log */
  activityType?: ActivityType;
  /** Custom activity description */
  activityDescription?: string;
};

/**
 * Wrapper for Server Actions that provides:
 * - Error handling
 * - Input validation
 * - Authentication checks
 * - Activity logging
 * - Consistent response format
 */
export function withActionWrapper<T extends any[], R>(
  action: (context: ActionContext, ...args: T) => Promise<R>,
  options: ActionOptions = {}
) {
  return async (...args: T): Promise<ActionResult<R>> => {
    try {
      const context: ActionContext = {};

      // Authentication check
      if (options.requireAuth) {
        const user = await getUser();
        if (!user) {
          throw new AuthenticationError('User not authenticated');
        }
        context.user = user;
        context.userId = user.id;
        context.agencyId = user.agencyId;
      }

      // Input validation (if FormData, validate the first argument)
      if (options.schema && args.length > 0) {
        const firstArg = args[0];
        if (firstArg instanceof FormData) {
          // Convert FormData to object for validation
          const data = Object.fromEntries(firstArg.entries());
          const validationResult = options.schema.safeParse(data);
          
          if (!validationResult.success) {
            const firstError = validationResult.error.issues[0];
            return {
              success: false,
              error: {
                message: firstError.message,
                code: 'VALIDATION_ERROR',
                field: firstError.path.join('.'),
              },
            };
          }
          
          // Replace the FormData with validated data
          args[0] = validationResult.data as T[0];
        } else {
          // Direct object validation
          const validationResult = options.schema.safeParse(firstArg);
          
          if (!validationResult.success) {
            const firstError = validationResult.error.issues[0];
            return {
              success: false,
              error: {
                message: firstError.message,
                code: 'VALIDATION_ERROR',
                field: firstError.path.join('.'),
              },
            };
          }
          
          args[0] = validationResult.data as T[0];
        }
      }

      // Execute the action
      const result = await action(context, ...args);

      // Log activity if specified
      if (options.activityType && context.agencyId && context.userId) {
        await logActivity(
          context.agencyId,
          context.userId,
          options.activityType
        );
      }

      return {
        success: true,
        data: result,
      };

    } catch (error) {
      // Handle Next.js redirects - these are not errors
      if (error instanceof Error && error.message === 'NEXT_REDIRECT') {
        // Re-throw the redirect to let Next.js handle it
        throw error;
      }
      
      // Log the error
      logError(error, {
        action: action.name,
        args: args.map(arg => {
          // Don't log sensitive FormData contents
          if (arg instanceof FormData) {
            return { type: 'FormData', keys: Array.from(arg.keys()) };
          }
          return arg;
        }),
        options,
      });

      // Return formatted error
      return {
        success: false,
        error: formatErrorForClient(error),
      };
    }
  };
}

/**
 * Simplified wrapper for form actions that return ActionState
 */
export function withFormAction<T>(
  action: (context: ActionContext, formData: FormData) => Promise<T>,
  options: ActionOptions = {}
) {
  return async (state: any, formData: FormData): Promise<T> => {
    const result = await withActionWrapper(
      (context: ActionContext, formData: FormData) => action(context, formData),
      options
    )(formData);

    if (!result.success) {
      return {
        error: result.error?.message || 'An error occurred',
        ...result.error,
      } as T;
    }

    return result.data as T;
  };
}

/**
 * Wrapper specifically for API route handlers
 */
export function withApiWrapper<T extends any[], R>(
  handler: (context: ActionContext, ...args: T) => Promise<R>,
  options: ActionOptions = {}
) {
  return async (...args: T): Promise<Response> => {
    const result = await withActionWrapper(handler, options)(...args);

    if (!result.success) {
      return Response.json(
        { error: result.error },
        { status: isAppError(result.error) ? (result.error as any).statusCode : 500 }
      );
    }

    return Response.json({ data: result.data });
  };
}
