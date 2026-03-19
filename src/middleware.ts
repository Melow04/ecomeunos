import { NextResponse } from 'next/server'

import { auth } from '@/lib/auth'

export default auth((req) => {
  const pathname = req.nextUrl.pathname
  const session = req.auth

  if (pathname.startsWith('/account') || pathname.startsWith('/checkout')) {
    if (!session) {
      const url = req.nextUrl.clone()
      url.pathname = '/auth/login'
      url.searchParams.set('next', pathname + req.nextUrl.search)
      return NextResponse.redirect(url)
    }
  }

  if (pathname.startsWith('/admin')) {
    if (!session) {
      const url = req.nextUrl.clone()
      url.pathname = '/auth/login'
      url.searchParams.set('next', pathname)
      return NextResponse.redirect(url)
    }

    if (session.user.role !== 'admin') {
      const url = req.nextUrl.clone()
      url.pathname = '/auth/login'
      return NextResponse.redirect(url)
    }
  }

  return NextResponse.next()
})

export const config = {
  matcher: ['/account/:path*', '/admin/:path*', '/checkout/:path*'],
}
