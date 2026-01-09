import { NextRequest } from "next/server"
import { prisma } from "@/lib/prisma"
import { assertAdmin } from "@/lib/api-auth"
import { withApiErrorHandler, successResponse, badRequestResponse, notFoundResponse, messageResponse, conflictResponse } from "@/lib/api-response"
import { validateStringLength, parseIntSafe, validateNonNegativeNumber } from "@/lib/validation"

export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    return withApiErrorHandler(async () => {
        await assertAdmin(request)
        const { id } = await params
        const body = await request.json()
        const { name, deliveryPrice, minFreeDelivery, isActive } = body

        // Check if region exists
        const existingRegion = await prisma.region.findUnique({
            where: { id }
        })

        if (!existingRegion) {
            return notFoundResponse("Region topilmadi")
        }

        // Build update data
        const updateData: {
            name?: string
            deliveryPrice?: number
            minFreeDelivery?: number | null
            isActive?: boolean
        } = {}

        // Validate and set name
        if (name !== undefined) {
            const trimmedName = String(name).trim()
            const nameLengthValidation = validateStringLength(trimmedName, 1, 200, "Nomi")
            if (!nameLengthValidation.valid) {
                return badRequestResponse(nameLengthValidation.error!)
            }

            // Check if another region with same name exists
            const duplicateRegion = await prisma.region.findUnique({
                where: { name: trimmedName }
            })

            if (duplicateRegion && duplicateRegion.id !== id) {
                return conflictResponse("Bu nomli region allaqachon mavjud")
            }

            updateData.name = trimmedName
        }

        // Validate and set deliveryPrice
        if (deliveryPrice !== undefined) {
            const deliveryPriceValidation = parseIntSafe(deliveryPrice, "Yetkazib berish narxi")
            if (!deliveryPriceValidation.valid) {
                return badRequestResponse(deliveryPriceValidation.error!)
            }

            const deliveryPricePositive = validateNonNegativeNumber(deliveryPriceValidation.value!, "Yetkazib berish narxi")
            if (!deliveryPricePositive.valid) {
                return badRequestResponse(deliveryPricePositive.error!)
            }

            updateData.deliveryPrice = deliveryPriceValidation.value!
        }

        // Validate and set minFreeDelivery
        if (minFreeDelivery !== undefined) {
            if (minFreeDelivery === null || minFreeDelivery === "") {
                updateData.minFreeDelivery = null
            } else {
                const minFreeDeliveryValidation = parseIntSafe(minFreeDelivery, "Minimal bepul yetkazib berish")
                if (!minFreeDeliveryValidation.valid) {
                    return badRequestResponse(minFreeDeliveryValidation.error!)
                }

                const minFreeDeliveryPositive = validateNonNegativeNumber(minFreeDeliveryValidation.value!, "Minimal bepul yetkazib berish")
                if (!minFreeDeliveryPositive.valid) {
                    return badRequestResponse(minFreeDeliveryPositive.error!)
                }

                updateData.minFreeDelivery = minFreeDeliveryValidation.value!
            }
        }

        // Set isActive
        if (isActive !== undefined) {
            updateData.isActive = Boolean(isActive)
        }

        // Update region
        const region = await prisma.region.update({
            where: { id },
            data: updateData
        })

        return successResponse({ region })
    }, { method: 'PATCH', path: '/api/admin/regions/[id]' })
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    return withApiErrorHandler(async () => {
        await assertAdmin(request)
        const { id } = await params

        // Check if region exists
        const region = await prisma.region.findUnique({
            where: { id },
            include: {
                users: true,
                orders: true
            }
        })

        if (!region) {
            return notFoundResponse("Region topilmadi")
        }

        // Check if region has users or orders
        if (region.users.length > 0 || region.orders.length > 0) {
            return badRequestResponse(
                `Bu region ${region.users.length} ta mijoz va ${region.orders.length} ta buyurtmaga ega. ` +
                `Bog'liq ma'lumotlar bo'lgan regionni o'chirib bo'lmaydi.`
            )
        }

        // Delete region
        await prisma.region.delete({
            where: { id }
        })

        return messageResponse("Region muvaffaqiyatli o'chirildi")
    }, { method: 'DELETE', path: '/api/admin/regions/[id]' })
}
