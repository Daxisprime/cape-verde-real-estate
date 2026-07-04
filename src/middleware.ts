import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const response = NextResponse.next();
  const { pathname } = request.nextUrl;

  const protectedPaths = ['/my-store', '/dashboard', '/settings', '/favorites', '/sell'];
  const isProtected = protectedPaths.some(p => pathname.startsWith(p));

  if (!isProtected) {
    return response;
  }

  const accessToken = request.cookies.get('sb-access-token')?.value;
  const refreshToken = request.cookies.get('sb-refresh-token')?.value;

  const hasAnySessionCookie = !!(accessToken || refreshToken);

  if (hasAnySessionCookie) {
    try {
      if (accessToken) {
        const parts = accessToken.split('.');
        if (parts.length === 3) {
          const payload = JSON.parse(atob(parts[1]));
          const exp = payload.exp;
          if (exp && Date.now() / 1000 > exp) {
            const clearResponse = NextResponse.next();
            clearResponse.cookies.delete('sb-access-token');
            clearResponse.cookies.delete('sb-refresh-token');
            return clearResponse;
          }
        }
      }
    } catch {
      const clearResponse = NextResponse.next();
      clearResponse.cookies.delete('sb-access-token');
      clearResponse.cookies.delete('sb-refresh-token');
      return clearResponse;
    }
  }

  return response;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|manifest.json|sw.js|offline.html|api/).*)',
  ],
};
