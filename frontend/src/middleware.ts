import { NextResponse } from 'next/server';
import { auth } from '@/auth';

export default auth((req) => {
  const isLoggedIn = !!req.auth;
  const { nextUrl } = req;
  
  const isAuthPage = nextUrl.pathname.startsWith('/login');
  const isDashboardPage = nextUrl.pathname.startsWith('/dashboard');

  if (isAuthPage && isLoggedIn) {
    return NextResponse.redirect(new URL('/dashboard', nextUrl));
  }

  if (isDashboardPage && !isLoggedIn) {
    return NextResponse.redirect(new URL('/login', nextUrl));
  }

  // Basic RBAC routing verification
  if (isDashboardPage && isLoggedIn) {
    const role = req.auth?.user?.role;
    
    // Scoped dashboard sub-routes check if required
    // e.g., if (nextUrl.pathname.startsWith('/dashboard/admin') && role !== 'Admin') redirect...
  }

  return NextResponse.next();
});

export const config = {
  matcher: ['/dashboard/:path*', '/login'],
};
