import { NextRequest } from "next/server"
import { getToken } from "next-auth/jwt"

export async function assertAdmin(request: NextRequest) {
    const token = await getToken({
        req: request,
        secret: process.env.NEXTAUTH_SECRET || "dev-secret-navqurt-2026"
    })

    if (!token || token.role !== "admin") {
        throw new Error("Unauthorized")
    }

    return token
}
