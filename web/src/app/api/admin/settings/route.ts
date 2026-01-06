import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { assertAdmin, getAdminFromRequest } from "@/lib/api-auth"
import bcrypt from "bcryptjs"

export async function GET(request: NextRequest) {
    try {
        const admin = await getAdminFromRequest(request)

        return NextResponse.json({
            id: admin.id,
            email: admin.email,
            name: admin.name,
            createdAt: admin.createdAt.toISOString()
        })
    } catch (error: unknown) {
        if (error instanceof Error && error.message === "Unauthorized") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }
        return NextResponse.json(
            { error: error instanceof Error ? error.message : "Failed to fetch profile" },
            { status: 500 }
        )
    }
}

export async function PATCH(request: NextRequest) {
    try {
        const admin = await getAdminFromRequest(request)
        const body = await request.json()
        const { name, email, currentPassword, newPassword } = body

        // If changing password, verify current password
        if (newPassword) {
            if (!currentPassword) {
                return NextResponse.json({ error: "Joriy parol majburiy" }, { status: 400 })
            }

            const isValid = await bcrypt.compare(currentPassword, admin.passwordHash)
            if (!isValid) {
                return NextResponse.json({ error: "Joriy parol noto'g'ri" }, { status: 400 })
            }
        }

        const updateData: { name?: string; email?: string; passwordHash?: string } = {}

        if (name !== undefined) updateData.name = name
        if (email !== undefined) updateData.email = email
        if (newPassword) {
            updateData.passwordHash = await bcrypt.hash(newPassword, 10)
        }

        const updated = await prisma.adminUser.update({
            where: { id: admin.id },
            data: updateData
        })

        return NextResponse.json({
            id: updated.id,
            email: updated.email,
            name: updated.name,
            message: newPassword ? "Parol yangilandi" : "Profil yangilandi"
        })
    } catch (error: unknown) {
        if (error instanceof Error && error.message === "Unauthorized") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }
        return NextResponse.json(
            { error: error instanceof Error ? error.message : "Failed to update profile" },
            { status: 500 }
        )
    }
}
