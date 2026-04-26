import { getToken } from 'next-auth/jwt'
import { NextRequest, NextResponse } from 'next/server'

const STATIC_EXT = /\.(svg|png|jpg|jpeg|ico|webp|gif|css|js|woff2?)$/i

function noCache(res: NextResponse): NextResponse {
  res.headers.set('x-middleware-cache', 'no-cache')
  return res
}

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl

  if (
    pathname.startsWith('/api/auth') ||
    pathname.startsWith('/_next') ||
    STATIC_EXT.test(pathname)
  ) {
    return NextResponse.next()
  }

  const isAuthPage       = pathname === '/login' || pathname === '/register'
  const isProtectedRoute = pathname === '/profile' || pathname.startsWith('/profile/') ||
                           pathname === '/dashboard' || pathname.startsWith('/dashboard/')

  if (!isAuthPage && !isProtectedRoute) return NextResponse.next()

  // Let getToken auto-detect the cookie name across all next-auth variants
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET })

  if (token && isAuthPage) {
    return noCache(NextResponse.redirect(new URL('/profile', req.url)))
  }

  if (!token && isProtectedRoute) {
    const dest = new URL('/login', req.url)
    dest.searchParams.set('from', pathname)
    return noCache(NextResponse.redirect(dest))
  }

  return noCache(NextResponse.next())
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}
