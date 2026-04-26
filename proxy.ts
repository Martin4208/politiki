import { NextResponse, type NextRequest } from 'next/server';

export default function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl

    const publicPaths = [
        '/',
        '/about',
        '/legal/terms',
        '/pledge_tracker'
    ]

    const isPublic = publicPaths.some(path => pathname.startsWith(path))
    const isStaticOrApi = pathname.startsWith('/_next') || pathname.startsWith('/favicon')

    if (!isPublic && !isStaticOrApi) {
        const url = request.nextUrl.clone()
        url.pathname = '/'
        return NextResponse.redirect(url)
    }

    return NextResponse.next()
}

export const config = {
    matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
}