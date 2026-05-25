import { NextResponse, type NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Check if any Supabase auth cookie exists (set by browser client after login)
  const hasSession = request.cookies.getAll().some(
    c => c.name.startsWith('sb-') && c.name.includes('auth-token')
  )

  // Protect dashboard — redirect to login if no cookie found
  if (!hasSession && pathname.startsWith('/dashboard')) {
    return NextResponse.redirect(new URL('/auth/login', request.url))
  }

  // Do NOT redirect /auth → /dashboard here.
  // The login page handles the redirect after sign-in client-side.
  // Avoiding this prevents the redirect loop caused by cookie reading
  // differences between middleware (Edge) and server components (Node.js).

  return NextResponse.next()
}

export const config = {
  matcher: ['/dashboard/:path*', '/auth/:path*'],
}
