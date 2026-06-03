import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

interface JwtPayload {
  userId: number;
  username: string;
  role: "ADMIN" | "STAFF";
  exp: number;
}

// Decodes JWT payload without checking signature (signature checked by Go backend)
function parseJwt(token: string): JwtPayload | null {
  try {
    const base64Url = token.split('.')[1];
    if (!base64Url) return null;
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = atob(base64);
    return JSON.parse(jsonPayload) as JwtPayload;
  } catch (e) {
    return null;
  }
}

export function middleware(request: NextRequest) {
  const token = request.cookies.get('auth_token')?.value;
  const { pathname } = request.nextUrl;

  // Protect POS and Admin routes
  if (pathname.startsWith('/sales') || pathname.startsWith('/admin')) {
    if (!token) {
      // Not authenticated, send to login terminal
      return NextResponse.redirect(new URL('/login', request.url));
    }

    const payload = parseJwt(token);
    if (!payload) {
      // Invalid token, remove cookie and force login
      const response = NextResponse.redirect(new URL('/login', request.url));
      response.cookies.delete('auth_token');
      return response;
    }

    // Role verification for Admin panel
    if (pathname.startsWith('/admin') && payload.role !== 'ADMIN') {
      // Prevent infinite redirect loops on unauthorized page
      if (pathname !== '/admin/unauthorized') {
        return NextResponse.redirect(new URL('/admin/unauthorized', request.url));
      }
    }
  }

  // Redirect authenticated user away from login
  if (pathname === '/login' && token) {
    const payload = parseJwt(token);
    if (payload) {
      return NextResponse.redirect(new URL('/sales', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/login',
    '/sales',
    '/admin/:path*'
  ]
};
