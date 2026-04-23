import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export default async function middleware(request: NextRequest) {
    let supabaseResponse = NextResponse.next({ request })

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
        {
            cookies: {
                getAll() {
                    return request.cookies.getAll()
                },
                setAll(cookiesToSet) {
                    cookiesToSet.forEach(({ name, value }) =>
                        request.cookies.set(name, value)
                    )
                    supabaseResponse = NextResponse.next({ request })
                    cookiesToSet.forEach(({ name, value, options }) =>
                        supabaseResponse.cookies.set(name, value, options)
                    )
                },
            },
        }
    )

    // セッションのリフレッシュ（getUser は getSession より安全）
    const { data: { user } } = await supabase.auth.getUser()

    const { pathname } = request.nextUrl

    // ログイン必須のルート
    const protectedPaths = [
        '/dashboard',
        '/settings',
        '/politicians',
        '/radar',
        '/journal',
    ]

    // ログイン済みならアクセス不要な認証ルート
    const authPaths = ['/login', '/register']

    const isProtectedPath = protectedPaths.some(path => pathname.startsWith(path))
    const isAuthPath = authPaths.some(path => pathname.startsWith(path))

    // 未ログインで保護ページ → /login へリダイレクト
    if (isProtectedPath && !user) {
        const url = request.nextUrl.clone()
        url.pathname = '/login'
        return NextResponse.redirect(url)
    }

    // ログイン済みで /login・/register → / へリダイレクト
    if (isAuthPath && user) {
        const url = request.nextUrl.clone()
        url.pathname = '/'
        return NextResponse.redirect(url)
    }

    return supabaseResponse
}

export const config = {
    matcher: [
        // 静的ファイル・画像・faviconを除くすべてのルートに適用
        '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
    ],
}
