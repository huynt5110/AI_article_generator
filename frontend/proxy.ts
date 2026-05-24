import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function proxy(request: NextRequest) {
  const hasToken = request.cookies.has('refreshToken') || request.cookies.has('accessToken');
  const pathname = request.nextUrl.pathname;

  const isAuthPage = pathname.startsWith('/login') || pathname.startsWith('/signup');
  const isDashboardPage = pathname.startsWith('/articles');

  if (isAuthPage && hasToken) {
    return NextResponse.redirect(new URL('/articles', request.url));
  }

  if (!hasToken && isDashboardPage) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  if (pathname === '/') {
    if (hasToken) {
      return NextResponse.redirect(new URL('/articles', request.url));
    } else {
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/', '/login', '/signup', '/articles/:path*'],
};
