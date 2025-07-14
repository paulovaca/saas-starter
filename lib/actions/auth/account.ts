'use server';

import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { eq } from 'drizzle-orm';
import { db } from '@/lib/db/drizzle';
import { users } from '@/lib/db/schema';
import { comparePasswords, hashPassword } from '@/lib/auth/session';
import { withFormAction, withActionWrapper } from '@/lib/services/error-handler/action-wrapper';
import { changePasswordSchema, updateProfileSchema, deleteAccountSchema } from '@/lib/validations/auth.schema';
import { ActivityLogger } from '@/lib/services/activity-logger';
import { AuthenticationError, ValidationError } from '@/lib/services/error-handler';

export const signOut = withActionWrapper(
  async (context) => {
    if (context.user) {
      await ActivityLogger.logAuth(
        context.user.agencyId,
        context.user.id,
        'SIGN_OUT'
      );
    }

    (await cookies()).delete('session');
    redirect('/sign-in');
  },
  {
    requireAuth: false, // Don't require auth since we're logging out
  }
);

export const updatePassword = withFormAction(
  async (context, data: FormData | any) => {
    if (!context.user) {
      throw new AuthenticationError('User not found');
    }

    // Extract form data - handle both FormData and object
    const currentPassword = data instanceof FormData ? data.get('currentPassword') as string : data.currentPassword;
    const newPassword = data instanceof FormData ? data.get('newPassword') as string : data.newPassword;

    // Verify current password
    const isCurrentPasswordValid = await comparePasswords(currentPassword, context.user.password);
    if (!isCurrentPasswordValid) {
      throw new ValidationError('Current password is incorrect', 'currentPassword');
    }

    // Hash new password
    const newPasswordHash = await hashPassword(newPassword);

    // Update password
    await db
      .update(users)
      .set({ password: newPasswordHash, updatedAt: new Date() })
      .where(eq(users.id, context.user.id));

    await ActivityLogger.logUserActivity(
      context.user.agencyId,
      context.user.id,
      'UPDATE_PASSWORD' as any,
      'Senha atualizada'
    );

    return { success: 'Password updated successfully' };
  },
  {
    schema: changePasswordSchema,
    requireAuth: true,
    activityType: 'UPDATE_PASSWORD' as any,
  }
);

export const updateAccount = withFormAction(
  async (context, data: FormData | any) => {
    if (!context.user) {
      throw new AuthenticationError('User not found');
    }

    // Extract form data - handle both FormData and object
    const name = data instanceof FormData ? data.get('name') as string : data.name;
    const email = data instanceof FormData ? data.get('email') as string : data.email;

    // Check if email is already taken by another user
    if (email !== context.user.email) {
      const existingUser = await db
        .select()
        .from(users)
        .where(eq(users.email, email))
        .limit(1);

      if (existingUser.length > 0) {
        throw new ValidationError('Email is already taken', 'email');
      }
    }

    // Update user
    await db
      .update(users)
      .set({ name, email, updatedAt: new Date() })
      .where(eq(users.id, context.user.id));

    await ActivityLogger.logUserActivity(
      context.user.agencyId,
      context.user.id,
      'UPDATE_ACCOUNT' as any,
      'Conta atualizada'
    );

    return { success: 'Account updated successfully' };
  },
  {
    schema: updateProfileSchema,
    requireAuth: true,
    activityType: 'UPDATE_ACCOUNT' as any,
  }
);

export const deleteAccount = withFormAction(
  async (context, data: FormData | any) => {
    if (!context.user) {
      throw new AuthenticationError('User not found');
    }

    // Extract form data - handle both FormData and object
    const currentPassword = data instanceof FormData ? data.get('currentPassword') as string : data.currentPassword;

    // Verify current password
    const isPasswordValid = await comparePasswords(currentPassword, context.user.password);
    if (!isPasswordValid) {
      throw new ValidationError('Current password is incorrect', 'currentPassword');
    }

    // Log the activity before deleting
    await ActivityLogger.logUserActivity(
      context.user.agencyId,
      context.user.id,
      'DELETE_ACCOUNT' as any,
      'Conta excluída'
    );

    // Delete the user account
    await db
      .delete(users)
      .where(eq(users.id, context.user.id));

    // Clear the session
    (await cookies()).delete('session');

    redirect('/');
  },
  {
    schema: deleteAccountSchema,
    requireAuth: true,
    activityType: 'DELETE_ACCOUNT' as any,
  }
);
