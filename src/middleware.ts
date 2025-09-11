import { withAuth } from 'next-auth/middleware'

export default withAuth(
  function middleware(req) {
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        if (req.nextUrl.pathname.startsWith('/auth/')) {
          return true
        }
        
        if (req.nextUrl.pathname.startsWith('/profile') || 
            req.nextUrl.pathname.startsWith('/checkout')) {
          return !!token
        }
        
        return true
      },
    },
  }
)

export const config = {
  matcher: ['/profile/:path*', '/checkout/:path*', '/auth/:path*']
}
