import { NextRequest } from "next/server"
import { getToken } from "next-auth/jwt"
import { prisma } from "./prisma"
import { getAuthSecret } from "./auth"

export async function assertAdmin(request: NextRequest) {
    const token = await getToken({
        req: request,
        secret: getAuthSecret()
    })

    if (!token || token.role !== "admin") {
        throw new Error("Unauthorized")
    }

    return token
}

export async function getAdminFromRequest(request: NextRequest) {
    const token = await assertAdmin(request)

    const admin = await prisma.adminUser.findUnique({
        where: { email: token.email as string }
    })

    if (!admin) {
        throw new Error("Unauthorized")
    }

    return admin
}
