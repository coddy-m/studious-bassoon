// middleware.ts
import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';

export default withAuth(
  function middleware(req) {
    const { pathname } = req.nextUrl;
    const token = req.nextauth.token;
    const role = token?.role;

    // 🔒 Block buyers from seller dashboard
    if (pathname.startsWith('/dashboard') && role !== 'seller') {
      return NextResponse.redirect(new URL('/auth/login?role=seller', req.url));
    }

    // 🔒 Block unauthenticated users from checkout
    if (pathname.startsWith('/checkout') && !token) {
      return NextResponse.redirect(new URL('/auth/login', req.url));
    }
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
  }
);

export const config = { 
  matcher: ['/dashboard/:path*', '/checkout/:path*'] 
};