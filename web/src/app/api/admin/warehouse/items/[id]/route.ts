import { NextRequest } from "next/server"
import { prisma } from "@/lib/prisma"
import { assertAdmin } from "@/lib/api-auth"
import { withApiErrorHandler, successResponse, badRequestResponse, messageResponse } from "@/lib/api-response"
import { parseFloatSafe, parseIntSafe, validateStringLength } from "@/lib/validation"

export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    return withApiErrorHandler(async () => {
        await assertAdmin(request)
        const { id } = await params
        const body = await request.json()
        const { name, current, unit, minRequired, price } = body

        // Build update data
        const updateData: {
            name?: string
            current?: number
            unit?: string
            minRequired?: number
            price?: number
        } = {}

        if (name !== undefined) {
            const trimmedName = String(name).trim()
            const nameLengthValidation = validateStringLength(trimmedName, 1, 200, "Nomi")
            if (!nameLengthValidation.valid) {
                return badRequestResponse(nameLengthValidation.error!)
            }
            updateData.name = trimmedName
        }

        if (current !== undefined && current !== null) {
            const currentValidation = parseFloatSafe(current, "Hozirgi miqdor")
            if (!currentValidation.valid) {
                return badRequestResponse(currentValidation.error!)
            }
            updateData.current = currentValidation.value
        }

        if (unit !== undefined) {
            updateData.unit = String(unit).trim() || "kg"
        }

        if (minRequired !== undefined && minRequired !== null) {
            const minRequiredValidation = parseFloatSafe(minRequired, "Minimal talab")
            if (!minRequiredValidation.valid) {
                return badRequestResponse(minRequiredValidation.error!)
            }
            updateData.minRequired = minRequiredValidation.value
        }

        if (price !== undefined && price !== null) {
            const priceValidation = parseIntSafe(price, "Narx")
            if (!priceValidation.valid) {
                return badRequestResponse(priceValidation.error!)
            }
            updateData.price = priceValidation.value
        }

        const item = await prisma.stockItem.update({
            where: { id },
            data: updateData
        })

        return successResponse(item)
    }, { method: 'PATCH', path: '/api/admin/warehouse/items/[id]' })
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    return withApiErrorHandler(async () => {
        await assertAdmin(request)
        const { id } = await params

        await prisma.stockItem.delete({
            where: { id }
        })

        return messageResponse("Omborxona mahsuloti muvaffaqiyatli o'chirildi")
    }, { method: 'DELETE', path: '/api/admin/warehouse/items/[id]' })
}
