'use server';

import { redirect } from 'next/navigation';
import { eq } from 'drizzle-orm';
import { db } from '@/lib/db/drizzle';
import { users, agencies } from '@/lib/db/schema';
import { comparePasswords, setSession } from '@/lib/auth/session';
import { withFormAction } from '@/lib/services/error-handler/action-wrapper';
import { signInSchema } from '@/lib/validations/auth.schema';
import { ActivityLogger } from '@/lib/services/activity-logger';
import { AuthenticationError, ValidationError } from '@/lib/services/error-handler';

export const signIn = withFormAction(
  async (context, data: FormData | any) => {
    // Extract email and password - handle both FormData and object
    const email = data instanceof FormData ? data.get('email') as string : data.email;
    const password = data instanceof FormData ? data.get('password') as string : data.password;

    // Basic validation - ensure values are strings and not null/undefined
    if (!email || typeof email !== 'string' || email.trim() === '') {
      throw new ValidationError('Valid email is required');
    }
    
    if (!password || typeof password !== 'string' || password.trim() === '') {
      throw new ValidationError('Valid password is required');
    }

    // Find user
    const user = await db
      .select()
      .from(users)
      .where(eq(users.email, email.trim().toLowerCase()))
      .limit(1);

    if (user.length === 0) {
      throw new AuthenticationError('Invalid credentials');
    }

    const foundUser = user[0];

    // Validate user data integrity
    if (!foundUser || !foundUser.id || !foundUser.agencyId) {
      throw new AuthenticationError('Invalid user data');
    }

    if (!foundUser.isActive) {
      throw new AuthenticationError('Account is deactivated');
    }

    // Verify password
    const isPasswordValid = await comparePasswords(password, foundUser.password);
    if (!isPasswordValid) {
      throw new AuthenticationError('Invalid credentials');
    }

    // Check if agency is active
    const agency = await db
      .select()
      .from(agencies)
      .where(eq(agencies.id, foundUser.agencyId))
      .limit(1);

    if (agency.length === 0 || !agency[0] || !agency[0].isActive) {
      throw new AuthenticationError('Agency account is deactivated or not found');
    }

    const foundAgency = agency[0];

    // Set session with validated user - only need the user object from DB
    await setSession(foundUser);

    // Log activity with proper null checks
    try {
      await ActivityLogger.logAuth(
        foundUser.agencyId,
        foundUser.id,
        'SIGN_IN'
      );
    } catch (logError) {
      // Don't fail authentication if logging fails
      console.error('Failed to log sign-in activity:', logError);
    }

    redirect('/dashboard');
  },
  {
    // schema: signInSchema, // Temporary disabled for debugging
    requireAuth: false,
    activityType: 'SIGN_IN' as any,
    rateLimit: {
      action: 'sign-in',
      limit: 5,        // 5 tentativas
      window: '10m'    // em 10 minutos
    }
  }
);
