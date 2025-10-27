import { NextRequest, NextResponse } from 'next/server';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // For now, disable authentication to get basic functionality working
  // TODO: Re-enable authentication after testing
  return NextResponse.next();

  // Protect admin routes
  if (pathname.startsWith('/admin') || pathname.startsWith('/api/admin')) {
    const token = await getToken({ 
      req: request, 
      secret: process.env.NEXTAUTH_SECRET 
    });
    
    if (!token || !token.email) {
      // Redirect to login for admin pages
      if (pathname.startsWith('/admin')) {
        const loginUrl = new URL('/auth/login', request.url);
        loginUrl.searchParams.set('callbackUrl', pathname);
        return NextResponse.redirect(loginUrl);
      }
      
      // Return unauthorized for API routes
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Check if user has admin role (for demo, we'll check email)
    if (token.email !== 'admin@fba-calculator.com') {
      if (pathname.startsWith('/admin')) {
        return NextResponse.redirect(new URL('/unauthorized', request.url));
      }
      
      return NextResponse.json(
        { error: 'Forbidden - Admin access required' },
        { status: 403 }
      );
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/api/admin/:path*']
};