import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { signToken, verifyToken } from '@/lib/auth/session';
import { validateCSRFToken, getCSRFToken } from '@/lib/auth/csrf';
import { SessionManager } from '@/lib/auth/session-manager';

const protectedRoutes = ['/users', '/funnels', '/catalog', '/operators', '/clients', '/proposals', '/reports', '/profile', '/settings'];
const publicRoutes = ['/sign-in', '/sign-up', '/pricing'];

const securityHeaders = {
  'X-DNS-Prefetch-Control': 'on',
  'X-XSS-Protection': '1; mode=block',
  'X-Frame-Options': 'SAMEORIGIN',
  'X-Content-Type-Options': 'nosniff',
  'Referrer-Policy': 'origin-when-cross-origin',
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload',
  'Content-Security-Policy': [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://js.stripe.com",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src 'self' https://fonts.gstatic.com",
    "img-src 'self' data: blob: https:",
    "connect-src 'self' https://api.stripe.com",
    "frame-src https://js.stripe.com"
  ].join('; ')
};

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
  
  // Apply security headers
  Object.entries(securityHeaders).forEach(([key, value]) => {
    res.headers.set(key, value);
  });

  // Refresh session on GET requests if valid
  if (sessionCookie && request.method === 'GET') {
    try {
      const parsed = await verifyToken(sessionCookie.value);
      
      // Check if session is still valid and exists in database
      if (parsed && new Date(parsed.expires) > new Date()) {
        try {
          const isValidInDB = await SessionManager.isSessionValid(sessionCookie.value);
          
          if (isValidInDB) {
            // Update last accessed time in database (non-blocking)
            SessionManager.updateLastAccessed(sessionCookie.value).catch(console.error);
            
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
            // Session not in database - create it (happens after server action login)
            try {
              await SessionManager.createSession(parsed.user.id, sessionCookie.value, request);
              console.log('Created database session for existing JWT token');
              
              // Update last accessed time
              SessionManager.updateLastAccessed(sessionCookie.value).catch(console.error);
              
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
            } catch (createError) {
              console.error('Failed to create database session:', createError);
              // Continue with JWT-only session
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
            }
          }
        } catch (dbError) {
          // Database error - continue without DB validation but log the error
          console.error('Database session validation failed:', dbError);
          // Still refresh the JWT session
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
        }
      } else {
        // Session expired or invalid
        try {
          await SessionManager.revokeSessionByToken(sessionCookie.value);
        } catch (dbError) {
          console.error('Failed to revoke session from database:', dbError);
        }
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
