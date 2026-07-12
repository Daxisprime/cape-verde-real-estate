import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const AUTH_COOKIE_NAME = 'procv-auth-token';
const LEGACY_COOKIES = ['sb-access-token', 'sb-refresh-token'];

export function middleware(request: NextRequest) {
  const response = NextResponse.next();
  const { pathname } = request.nextUrl;

  const protectedPaths = ['/my-store', '/dashboard', '/settings', '/favorites', '/sell'];
  const isProtected = protectedPaths.some(p => pathname.startsWith(p));

  if (!isProtected) {
    return response;
  }

  const sessionCookie = request.cookies.get(AUTH_COOKIE_NAME)?.value;
  const legacyAccess = request.cookies.get(LEGACY_COOKIES[0])?.value;
  const legacyRefresh = request.cookies.get(LEGACY_COOKIES[1])?.value;

  const hasSession = !!(sessionCookie || legacyAccess || legacyRefresh);

  if (hasSession) {
    const tokenToCheck = legacyAccess || null;
    if (tokenToCheck) {
      try {
        const parts = tokenToCheck.split('.');
        if (parts.length === 3) {
          const payload = JSON.parse(atob(parts[1]));
          const exp = payload.exp;
          if (exp && Date.now() / 1000 > exp) {
            const clearResponse = NextResponse.next();
            clearResponse.cookies.delete(LEGACY_COOKIES[0]);
            clearResponse.cookies.delete(LEGACY_COOKIES[1]);
            return clearResponse;
          }
        }
      } catch {
        const clearResponse = NextResponse.next();
        clearResponse.cookies.delete(LEGACY_COOKIES[0]);
        clearResponse.cookies.delete(LEGACY_COOKIES[1]);
        return clearResponse;
      }
    }
  }

  // Set secure cookie attributes on response for production domain transit
  if (process.env.NODE_ENV === 'production') {
    response.headers.set('X-Content-Type-Options', 'nosniff');
    response.headers.set('X-Frame-Options', 'DENY');
    response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  }

  return response;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|manifest.json|sw.js|offline.html|api/).*)',
  ],
};
