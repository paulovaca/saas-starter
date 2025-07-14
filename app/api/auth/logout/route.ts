import { cookies } from 'next/headers';
import { ActivityLogger } from '@/lib/services/activity-logger';
import { getUser } from '@/lib/db/queries';

export async function POST() {
  try {
    // Get user for logging before clearing session
    let user = null;
    try {
      user = await getUser();
    } catch (error) {
      // User might not exist or session might be invalid
      console.log('Could not get user for logout logging:', error);
    }
    
    // Clear the session cookie
    const cookieStore = await cookies();
    
    // Set cookie to expire immediately
    cookieStore.set('session', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      expires: new Date(0),
      maxAge: 0,
      path: '/'
    });
    
    // Also try delete method
    cookieStore.delete('session');
    
    // Log the activity if we have a user
    if (user) {
      try {
        await ActivityLogger.logAuth(
          user.agencyId,
          user.id,
          'SIGN_OUT'
        );
      } catch (logError) {
        console.error('Failed to log sign-out activity:', logError);
      }
    }
    
    return Response.json({ success: true, message: 'Signed out successfully' });
    
  } catch (error) {
    console.error('Error during sign out:', error);
    
    // Even if there's an error, try to clear the session
    try {
      const cookieStore = await cookies();
      cookieStore.delete('session');
    } catch (cookieError) {
      console.error('Failed to clear session cookie:', cookieError);
    }
    
    return Response.json({ success: true, message: 'Signed out (with errors)' });
  }
}
