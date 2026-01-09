import { NextRequest } from "next/server"
import { prisma } from "@/lib/prisma"
import { assertAdmin } from "@/lib/api-auth"
import { withApiErrorHandler, successResponse, badRequestResponse, messageResponse } from "@/lib/api-response"
import { validateStringLength } from "@/lib/validation"

export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    return withApiErrorHandler(async () => {
        await assertAdmin(request)
        const { id } = await params
        const body = await request.json()
        const { name, color } = body

        // Build update data
        const updateData: {
            name?: string
            color?: string | null
        } = {}

        if (name !== undefined) {
            const trimmedName = String(name).trim()
            const nameLengthValidation = validateStringLength(trimmedName, 1, 100, "Nomi")
            if (!nameLengthValidation.valid) {
                return badRequestResponse(nameLengthValidation.error!)
            }
            updateData.name = trimmedName
        }

        if (color !== undefined) {
            updateData.color = color && String(color).trim().length > 0 ? String(color).trim() : null
        }

        const category = await prisma.category.update({
            where: { id },
            data: updateData
        })

        return successResponse({ category })
    }, { method: 'PATCH', path: '/api/admin/categories/[id]' })
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    return withApiErrorHandler(async () => {
        await assertAdmin(request)
        const { id } = await params

        await prisma.category.delete({
            where: { id }
        })

        return messageResponse("Kategoriya muvaffaqiyatli o'chirildi")
    }, { method: 'DELETE', path: '/api/admin/categories/[id]' })
}

