import { NextResponse } from 'next/server';

// Middleware to check authentication for protected routes
export async function middleware(request) {
  // Get the pathname
  const { pathname } = request.nextUrl;
  
  // Define protected routes that require authentication
  const protectedRoutes = [
    '/profile',
    '/chats',
    '/api/user',
    '/api/chat',
    // Add more protected routes as needed
  ];
  
  // Define auth routes that authenticated users shouldn't access
  const authRoutes = [
    '/auth/login',
    '/auth/register'
  ];
  
  // Check if the current route is protected
  const isProtectedRoute = protectedRoutes.some(route => 
    pathname.startsWith(route)
  );
  
  // Check if the current route is an auth route
  const isAuthRoute = authRoutes.some(route => 
    pathname.startsWith(route)
  );
  
  // Get session cookie
  const sessionCookie = request.cookies.get('kdsm-session');
  
  if (isProtectedRoute && !sessionCookie) {
    // Redirect to login if trying to access protected route without session
    const loginUrl = new URL('/auth/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }
  
  // Optional: Verify session validity for API routes
  if (pathname.startsWith('/api/') && isProtectedRoute) {
    if (!sessionCookie) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }
  }
  
  // Optional: Redirect authenticated users away from auth pages
  if (isAuthRoute && sessionCookie) {
    return NextResponse.redirect(new URL('/', request.url));
  }
  
  return NextResponse.next();
}

// Configure which routes this middleware runs on
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (public folder)
     */
    '/((?!_next/static|_next/image|favicon.ico|public/).*)',
  ],
};
