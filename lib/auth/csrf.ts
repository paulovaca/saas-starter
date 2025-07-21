import { NextRequest } from 'next/server';
import crypto from 'crypto';

const SECRET = process.env.CSRF_SECRET || 'your-csrf-secret-please-change-this';

export function generateCSRFToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

export function validateCSRFToken(token: string, sessionToken: string): boolean {
  try {
    const expectedToken = crypto
      .createHmac('sha256', SECRET)
      .update(sessionToken)
      .digest('hex');
    return crypto.timingSafeEqual(Buffer.from(token), Buffer.from(expectedToken));
  } catch (error) {
    return false;
  }
}

export function getCSRFToken(request: NextRequest): string | null {
  // Check header first (for AJAX requests)
  const headerToken = request.headers.get('x-csrf-token');
  if (headerToken) {
    return headerToken;
  }
  
  // Check query parameter (for form submissions)
  const queryToken = request.nextUrl.searchParams.get('_csrf');
  if (queryToken) {
    return queryToken;
  }
  
  // Check form data if available
  // Note: This requires parsing the body which might not be ideal in middleware
  return null;
}