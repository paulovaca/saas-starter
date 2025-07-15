import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { signToken, verifyToken } from '@/lib/auth/session';

const protectedRoutes = ['/users', '/funnels', '/catalog', '/operators', '/clients', '/proposals', '/reports', '/profile', '/settings'];
const publicRoutes = ['/sign-in', '/sign-up', '/pricing'];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const sessionCookie = request.cookies.get('session');
  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route));
  const isPublicRoute = publicRoutes.some(route => pathname.startsWith(route));
  const isDashboardRoot = pathname === '/';

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
      if (new Date(parsed.expires) > new Date()) {
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
