// middleware.ts
import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';

export default withAuth(
  function middleware(req) {
    const { pathname } = req.nextUrl;
    const token = req.nextauth.token;
    const userRole = token?.role as string;

    // 🔒 Block buyers from seller dashboard
    if (pathname.startsWith('/dashboard') && userRole !== 'seller') {
      return NextResponse.redirect(new URL('/auth/login?role=seller', req.url));
    }

    // 🔒 Block unauthenticated users from dashboard
    if (pathname.startsWith('/dashboard') && !token) {
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
  matcher: ['/dashboard/:path*'] 
};