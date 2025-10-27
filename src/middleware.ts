// src/middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Protected routes - bu sayfalara sadece login olmuş kullanıcılar erişebilir
const protectedRoutes = ['/dashboard'];

// Public routes - bu sayfalara herkes erişebilir
const publicRoutes = ['/login', '/', '/auth/callback', '/auth/select-role'];

export function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // Token kontrolü - cookie veya header'dan token al
    const token = request.cookies.get('accessToken')?.value ||
                  request.headers.get('authorization')?.replace('Bearer ', '');

    // Protected route kontrolü
    const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route));
    const isPublicRoute = publicRoutes.some(route => pathname === route || pathname.startsWith(route));

    // Dashboard'a gitmek istiyorsa ve token yoksa, login'e yönlendir
    if (isProtectedRoute && !token) {
        const loginUrl = new URL('/login', request.url);
        return NextResponse.redirect(loginUrl);
    }

    // Login sayfası kontrolünü kaldırdık - kullanıcı isterse login'e gidebilir
    // Token validation zaten backend'de ve AuthContext'te yapılıyor

    return NextResponse.next();
}

// Middleware'in hangi path'lerde çalışacağını belirt
export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - api (API routes)
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * - public folder
         */
        '/((?!api|_next/static|_next/image|favicon.ico|assets|.*\\.png|.*\\.jpg|.*\\.jpeg|.*\\.svg|.*\\.webp).*)',
    ],
};
