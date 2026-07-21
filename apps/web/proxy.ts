import { NextRequest, NextResponse } from 'next/server';

export function proxy(request: NextRequest) {
  if (request.nextUrl.pathname.startsWith('/sign/')) {
    return NextResponse.next();
  }

  if (request.nextUrl.pathname.startsWith('/jobs/') && request.nextUrl.searchParams.has('hp') && request.nextUrl.searchParams.has('token')) {
    return NextResponse.next();
  }

  if (!request.cookies.has('pilotnow_session')) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('next', `${request.nextUrl.pathname}${request.nextUrl.search}`);
    return NextResponse.redirect(loginUrl);
  }
  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|login|forgot-password|_next/static|_next/image|favicon.ico).*)'],
};
