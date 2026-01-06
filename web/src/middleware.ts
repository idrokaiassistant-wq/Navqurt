import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { getToken } from "next-auth/jwt"

export async function middleware(request: NextRequest) {
    const token = await getToken({
        req: request,
        secret: process.env.NEXTAUTH_SECRET
    })

    const isAuth = !!token
    const isLoginPage = request.nextUrl.pathname === "/login"
    const isDashboard = request.nextUrl.pathname.startsWith("/dashboard")

    // Redirect to login if not authenticated and trying to access dashboard
    if (isDashboard && !isAuth) {
        return NextResponse.redirect(new URL("/login", request.url))
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
