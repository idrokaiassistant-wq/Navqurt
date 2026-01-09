import { NextRequest } from "next/server"
import { prisma } from "@/lib/prisma"
import { assertAdmin } from "@/lib/api-auth"
import { withApiErrorHandler, successResponse, badRequestResponse, notFoundResponse, messageResponse } from "@/lib/api-response"
import { parseIntSafe } from "@/lib/validation"

export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    return withApiErrorHandler(async () => {
        await assertAdmin(request)
        const { id } = await params
        const body = await request.json()
        const { priceDelta } = body

        // Check if variant exists
        const variant = await prisma.variant.findUnique({
            where: { id }
        })

        if (!variant) {
            return notFoundResponse("Variant topilmadi")
        }

        // Validate priceDelta if provided
        const updateData: { priceDelta?: number } = {}
        if (priceDelta !== undefined) {
            const priceDeltaValidation = parseIntSafe(priceDelta, "Narx farqi")
            if (!priceDeltaValidation.valid) {
                return badRequestResponse(priceDeltaValidation.error!)
            }
            updateData.priceDelta = priceDeltaValidation.value!
        }

        // Update variant
        const updatedVariant = await prisma.variant.update({
            where: { id },
            data: updateData
        })

        return successResponse({ variant: updatedVariant })
    }, { method: 'PATCH', path: '/api/admin/variants/[id]' })
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    return withApiErrorHandler(async () => {
        await assertAdmin(request)
        const { id } = await params

        // Check if variant exists
        const variant = await prisma.variant.findUnique({
            where: { id },
            include: {
                orderItems: true
            }
        })

        if (!variant) {
            return notFoundResponse("Variant topilmadi")
        }

        // Check if variant has order items
        if (variant.orderItems.length > 0) {
            return badRequestResponse(
                `Bu variant ${variant.orderItems.length} ta buyurtmada ishlatilgan. ` +
                `Buyurtmalarda ishlatilgan variantni o'chirib bo'lmaydi.`
            )
        }

        // Delete variant
        await prisma.variant.delete({
            where: { id }
        })

        return messageResponse("Variant muvaffaqiyatli o'chirildi")
    }, { method: 'DELETE', path: '/api/admin/variants/[id]' })
}
