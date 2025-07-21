import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { signToken, verifyToken } from '@/lib/auth/session';
import { validateCSRFToken, getCSRFToken } from '@/lib/auth/csrf';

const protectedRoutes = ['/users', '/funnels', '/catalog', '/operators', '/clients', '/proposals', '/reports', '/profile', '/settings'];
const publicRoutes = ['/sign-in', '/sign-up', '/pricing'];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const sessionCookie = request.cookies.get('session');
  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route));
  const isPublicRoute = publicRoutes.some(route => pathname.startsWith(route));
  const isDashboardRoot = pathname === '/';
  
  // CSRF Protection for mutation methods
  if (['POST', 'PUT', 'DELETE', 'PATCH'].includes(request.method)) {
    // Skip CSRF check for API routes that don't need it
    const skipCSRFRoutes = ['/api/stripe/webhook', '/api/csrf-token'];
    const shouldSkipCSRF = skipCSRFRoutes.some(route => pathname.startsWith(route));
    
    // Skip CSRF check for Server Actions (they have built-in CSRF protection)
    const isServerAction = request.headers.get('next-action') !== null || 
                          request.headers.get('content-type') === 'text/plain;charset=UTF-8';
    
    if (!shouldSkipCSRF && !isServerAction && sessionCookie) {
      const csrfToken = getCSRFToken(request);
      
      if (!csrfToken || !validateCSRFToken(csrfToken, sessionCookie.value)) {
        return new Response('CSRF token invalid', { status: 403 });
      }
    }
  }

  // Redirect authenticated users away from auth pages
  if (sessionCookie && (pathname.startsWith('/sign-in') || pathname.startsWith('/sign-up'))) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  // Redirect unauthenticated users from protected routes and dashboard root
  if ((isProtectedRoute || isDashboardRoot) && !sessionCookie) {
    return NextResponse.redirect(new URL('/sign-in', request.url));
  }

  let res = NextResponse.next();

  // Refresh session on GET requests if valid
  if (sessionCookie && request.method === 'GET') {
    try {
      const parsed = await verifyToken(sessionCookie.value);
      
      // Check if session is still valid
      if (parsed && new Date(parsed.expires) > new Date()) {
        const expiresInOneDay = new Date(Date.now() + 24 * 60 * 60 * 1000);

        res.cookies.set({
          name: 'session',
          value: await signToken({
            ...parsed,
            expires: expiresInOneDay.toISOString()
          }),
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
          expires: expiresInOneDay
        });
      } else {
        // Session expired
        res.cookies.delete('session');
        if (isProtectedRoute || isDashboardRoot) {
          return NextResponse.redirect(new URL('/sign-in', request.url));
        }
      }
    } catch (error) {
      console.error('Error updating session:', error);
      res.cookies.delete('session');
      if (isProtectedRoute || isDashboardRoot) {
        return NextResponse.redirect(new URL('/sign-in', request.url));
      }
    }
  }

  return res;
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
  runtime: 'nodejs'
};
