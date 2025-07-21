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
import { getUser } from '@/lib/db/queries';

export const signOut = withActionWrapper(
  async (context) => {
    if (context.user) {
      try {
        await ActivityLogger.logAuth(
          context.user.agencyId,
          context.user.id,
          'SIGN_OUT'
        );
      } catch (error) {
        // Don't fail logout if logging fails
        console.error('Failed to log sign-out activity:', error);
      }
    }

    (await cookies()).delete('session');
    redirect('/sign-in');
  },
  {
    requireAuth: false, // Don't require auth since we're logging out
  }
);

// Simple signOut function for client-side use
export async function signOutSimple() {
  'use server';

  try {
    // Clear the session cookie immediately with the same config as middleware
    const cookieStore = await cookies();
    cookieStore.set('session', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      expires: new Date(0), // Expire immediately
      maxAge: 0
    });
    
    // Also try the delete method as backup
    cookieStore.delete('session');
    
    // Try to log the activity, but don't let it block the logout
    try {
      const user = await getUser();
      if (user) {
        await ActivityLogger.logAuth(
          user.agencyId,
          user.id,
          'SIGN_OUT'
        );
      }
    } catch (logError) {
      // Logging failed, but that's ok for logout
      console.error('Failed to log sign-out activity:', logError);
    }
    
  } catch (error) {
    // Even if everything fails, try to clear the session
    console.error('Error during sign out:', error);
    try {
      const cookieStore = await cookies();
      cookieStore.delete('session');
    } catch (cookieError) {
      console.error('Failed to clear session cookie:', cookieError);
    }
  }

  redirect('/sign-in');
}

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
      { description: 'Senha atualizada' }
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
      { description: 'Conta atualizada' }
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
      { description: 'Conta excluída' }
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
