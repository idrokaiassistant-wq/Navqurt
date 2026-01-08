import { NextRequest } from "next/server"
import { prisma } from "@/lib/prisma"
import { getAdminFromRequest } from "@/lib/api-auth"
import bcrypt from "bcryptjs"
import { withApiErrorHandler, successResponse, badRequestResponse } from "@/lib/api-response"
import { validateRequired, validateEmail, validateStringLength } from "@/lib/validation"

export async function GET(request: NextRequest) {
    return withApiErrorHandler(async () => {
        const admin = await getAdminFromRequest(request)

        return successResponse({
            id: admin.id,
            email: admin.email,
            name: admin.name,
            logoUrl: admin.logoUrl,
            createdAt: admin.createdAt.toISOString()
        })
    })
}

export async function PATCH(request: NextRequest) {
    return withApiErrorHandler(async () => {
        const admin = await getAdminFromRequest(request)
        const body = await request.json()
        const { name, email, logoUrl, currentPassword, newPassword } = body

        // If changing password, verify current password
        if (newPassword) {
            const currentPasswordValidation = validateRequired(currentPassword, "Joriy parol")
            if (!currentPasswordValidation.valid) {
                return badRequestResponse(currentPasswordValidation.error!)
            }

            const newPasswordValidation = validateStringLength(newPassword, 6, 100, "Yangi parol")
            if (!newPasswordValidation.valid) {
                return badRequestResponse(newPasswordValidation.error!)
            }

            const isValid = await bcrypt.compare(String(currentPassword), admin.passwordHash)
            if (!isValid) {
                return badRequestResponse("Joriy parol noto'g'ri")
            }
        }

        // Build update data
        const updateData: { name?: string; email?: string; passwordHash?: string; logoUrl?: string } = {}

        if (name !== undefined) {
            const trimmedName = String(name).trim()
            if (trimmedName.length > 0) {
                updateData.name = trimmedName
            }
        }

        if (logoUrl !== undefined) {
            updateData.logoUrl = logoUrl
        }

        if (email !== undefined) {
            const trimmedEmail = String(email).trim()
            const emailValidation = validateEmail(trimmedEmail)
            if (!emailValidation.valid) {
                return badRequestResponse(emailValidation.error!)
            }
            updateData.email = trimmedEmail
        }

        if (newPassword) {
            updateData.passwordHash = await bcrypt.hash(String(newPassword), 10)
        }

        const updated = await prisma.adminUser.update({
            where: { id: admin.id },
            data: updateData
        })

        return successResponse({
            id: updated.id,
            email: updated.email,
            name: updated.name,
            logoUrl: updated.logoUrl,
            message: newPassword ? "Parol yangilandi" : "Profil yangilandi"
        })
    })
}
