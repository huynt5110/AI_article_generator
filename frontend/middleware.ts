import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Check for our HttpOnly cookies. We check for refreshToken since accessToken might be expired
  // and we still want to consider them "logged in" so the client can refresh it.
  const hasToken = request.cookies.has('refreshToken') || request.cookies.has('accessToken');
  const pathname = request.nextUrl.pathname;

  const isAuthPage = pathname.startsWith('/login') || pathname.startsWith('/signup');
  const isDashboardPage = pathname.startsWith('/dashboard');

  // 1. If user is logged in and trying to access an auth page, redirect to dashboard
  if (isAuthPage && hasToken) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  // 2. If user is NOT logged in and trying to access protected pages, redirect to login
  if (!hasToken && isDashboardPage) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // 3. For the root route, we can conditionally route them
  if (pathname === '/') {
    if (hasToken) {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    } else {
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  return NextResponse.next();
}

// Configure the paths where this middleware should run
export const config = {
  matcher: ['/', '/login', '/signup', '/dashboard/:path*'],
};
