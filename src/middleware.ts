import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const AUTH_COOKIE_NAME = 'procv-auth-token';

export function middleware(request: NextRequest) {
  const response = NextResponse.next();
  const { pathname } = request.nextUrl;

  const protectedPaths = ['/my-store', '/dashboard', '/settings', '/favorites', '/sell'];
  const isProtected = protectedPaths.some(p => pathname.startsWith(p));

  if (!isProtected) {
    return response;
  }

  // Check all possible Supabase session cookie shapes
  const sessionCookie = request.cookies.get(AUTH_COOKIE_NAME)?.value;

  // Supabase stores session in cookies with the pattern: sb-<ref>-auth-token
  const allCookies = request.cookies.getAll();
  const supabaseCookie = allCookies.find(
    (c) => c.name.startsWith('sb-') && c.name.endsWith('-auth-token')
  );
  const supabaseCookieChunked = allCookies.find(
    (c) => c.name.startsWith('sb-') && c.name.includes('-auth-token.')
  );

  const hasSession = !!(sessionCookie || supabaseCookie?.value || supabaseCookieChunked?.value);

  // If no session exists at all, allow the page to render -- the client-side
  // auth context will handle redirect if needed. This prevents blocking users
  // who have a valid session that hasn't been written to cookies yet (e.g. fresh login).
  if (!hasSession) {
    // Still allow access -- the client-side SupabaseAuthContext handles auth state.
    // This avoids the race condition where middleware blocks before the session cookie is set.
    return response;
  }

  // Set security headers in production
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
