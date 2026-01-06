import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { getToken } from "next-auth/jwt"
import { getAuthSecret } from "@/lib/auth"

export async function middleware(request: NextRequest) {
    let token: unknown = null
    try {
        token = await getToken({
            req: request,
            secret: getAuthSecret()
        })
    } catch {
        // Secret/env muammosi bo'lsa - authenticated emas deb hisoblaymiz
        token = null
    }

    const isAuth = !!token
    const isLoginPage = request.nextUrl.pathname === "/login"
    const isDashboard = request.nextUrl.pathname.startsWith("/dashboard")

    // Redirect to login if not authenticated and trying to access dashboard
    if (isDashboard && !isAuth) {
        return NextResponse.redirect(new URL("/login", request.url))
    }

    // Check for admin role if accessing the dashboard
    if (isDashboard && isAuth) {
        if (token.role !== 'admin') {
            // You might want to redirect to a specific 'unauthorized' page
            // For now, redirecting to login
            return NextResponse.redirect(new URL("/login?error=unauthorized", request.url))
        }
    }

    // Redirect to dashboard if authenticated and on login page
    if (isLoginPage && isAuth) {
        return NextResponse.redirect(new URL("/dashboard", request.url))
    }

    return NextResponse.next()
}

export const config = {
    matcher: ["/dashboard/:path*", "/login"]
}
